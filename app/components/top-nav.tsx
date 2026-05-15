"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { logoutAPI } from "@/app/services/authService";
import { getCategoriesAPI, CategoryResponse } from "@/app/services/productService";
import "./top-nav.css";

export default function TopNav() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [categories, setCategories] = useState<CategoryResponse[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);

  // Mark component as mounted on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check token after component is mounted on client
  useEffect(() => {
    if (!isMounted) return;

    const token = localStorage.getItem("accessToken");
    const userStr = localStorage.getItem("user");
    
    console.log("TopNav checking token:", token);
    setIsLoggedIn(!!token);
    
    // Extract role from user object
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setUserRole(user.role || null);
      } catch (e) {
        console.error("Failed to parse user from localStorage:", e);
        setUserRole(null);
      }
    }
  }, [isMounted]);

  // Fetch categories
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await getCategoriesAPI(0, 100);
        setCategories(response.content || []);
      } catch (error) {
        console.error("Failed to fetch categories:", error);
        // Fallback to empty array
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  const handleLogout = () => {
    logoutAPI();
    toast.success("Đã đăng xuất!");
    router.push("/");
    setIsLoggedIn(false);
  };

  // Build nav items with Trang Chủ first, then categories
  const navItems = [
    { id: "home", label: "Trang Chủ", href: "/" },
    ...categories.map((cat) => ({
      id: `cat-${cat.id}`,
      label: cat.name,
      href: `/products?categoryId=${cat.id}`,
    })),
  ];

  return (
    <nav className="navbar">
      <div className="navbar-container">
        {/* Logo */}
        <div className="navbar-brand">
          <h1>Virtual Keyboard</h1>
        </div>

        {/* Desktop Menu */}
        <div className="navbar-menu">
          {navItems.map((item) => (
            <Link key={item.id} href={item.href} className="nav-link">
              {item.label}
            </Link>
          ))}
        </div>

        {/* Icons & Buttons */}
        <div className="navbar-icons">
          <button className="icon-btn" title="Search">
            <i className="fas fa-search"></i>
          </button>

          <Link href="/cart" className="icon-btn" title="Shopping Cart">
            <i className="fas fa-shopping-cart"></i>
          </Link>

          {/* Account Button */}
          {isLoggedIn && (
            <Link href="/account" className="icon-btn user-icon" title="Account">
              <i className="fas fa-user-circle"></i>
            </Link>
          )}

          {/* Admin Button - Only show if user is admin */}
          {isLoggedIn && userRole === "admin" && (
            <Link href="/admin" className="btn-admin" title="Admin Panel">
              <i className="fas fa-shield-alt"></i> Admin
            </Link>
          )}

          {/* Logout Button */}
          {isLoggedIn && (
            <button
              className="btn-logout"
              onClick={handleLogout}
              title="Logout"
            >
              Logout
            </button>
          )}

          {/* Login/Sign In Button */}
          {!isLoggedIn && (
            <Link href="/login" className="btn-login">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}