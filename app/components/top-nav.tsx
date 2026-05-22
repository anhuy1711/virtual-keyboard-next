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
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");

  const handleSearchSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    const keyword = searchKeyword.trim();

    if (!keyword) {
      setIsSearchOpen(false);
      return;
    }

    router.push(`/products?name=${encodeURIComponent(keyword)}`);
    setIsSearchOpen(false);
  };
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
    { id: "custom-keyboard", label: "Custom", href: "/custom-keyboard" },
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
          <h1>Clack Keebs</h1>
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
          <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
            <div
                className={`overflow-hidden transition-all duration-300 ${
                    isSearchOpen ? "w-[240px] opacity-100" : "w-0 opacity-0"
                }`}
            >
              <input
                  type="text"
                  value={searchKeyword}
                  onChange={(e) => setSearchKeyword(e.target.value)}
                  placeholder="Tìm sản phẩm..."
                  className="h-10 w-[240px] rounded-full border border-gray-300 bg-white px-4 text-sm text-black placeholder:text-gray-400 outline-none focus:border-blue-700 focus:ring-1 focus:ring-blue-700"
                  autoFocus={isSearchOpen}
              />
            </div>

            <button
                type={isSearchOpen ? "submit" : "button"}
                className="icon-btn"
                title="Search"
                onClick={() => {
                  if (!isSearchOpen) {
                    setIsSearchOpen(true);
                  }
                }}
            >
              <i className="fas fa-search"></i>
            </button>
          </form>

          <Link href="/cart" className="icon-btn" title="Shopping Cart">
            <i className="fas fa-shopping-cart"></i>
          </Link>

          {/* Account/Login Icon */}
          <div className="user-dropdown">
            <button type="button" className="icon-btn user-icon" title="Account">
              <i className="fas fa-user-circle"></i>
            </button>

            <div className="user-dropdown-menu">
              {!isLoggedIn ? (
                  <>
                    <Link href="/login" className="user-dropdown-item">
                      <i className="fas fa-sign-in-alt"></i>
                      Đăng nhập
                    </Link>

                    <Link href="/signup" className="user-dropdown-item">
                      <i className="fas fa-user-plus"></i>
                      Đăng ký
                    </Link>
                  </>
              ) : (
                  <>
                    <Link href="/account" className="user-dropdown-item">
                      <i className="fas fa-user"></i>
                      Tài khoản
                    </Link>

                    <button
                        type="button"
                        onClick={handleLogout}
                        className="user-dropdown-item user-dropdown-logout"
                    >
                      <i className="fas fa-sign-out-alt"></i>
                      Đăng xuất
                    </button>
                  </>
              )}
            </div>
          </div>

          {/* Admin Button - Only show if user is admin */}
          {isLoggedIn && userRole === "ADMIN" && (
            <Link href="/admin" className="btn-admin" title="Admin Panel">
              <i className="fas fa-shield-alt"></i> Admin
            </Link>
          )}

          {/* Login/Sign In Button */}
        </div>
      </div>
    </nav>
  );
}
