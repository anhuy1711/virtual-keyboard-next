"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { logoutAPI } from "@/app/services/authService";
import "./top-nav.css";

export default function TopNav() {
  const router = useRouter();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Mark component as mounted on client
  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Check token after component is mounted on client
  useEffect(() => {
    if (!isMounted) return;

    const token = localStorage.getItem("accessToken");
    console.log("TopNav checking token:", token);
    setIsLoggedIn(!!token);
  }, [isMounted]);

  const handleLogout = () => {
    logoutAPI();
    toast.success("Đã đăng xuất!");
    router.push("/");
    setIsLoggedIn(false);
  };

  const navItems = [
    { id: "home", label: "Trang Chủ", href: "/" },
    { id: "products", label: "Bàn Phím", href: "/products" },
    { id: "keycaps", label: "Keycap", href: "/products" },
    { id: "switches", label: "Switch", href: "/products" },
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
          {/* Debug: Show login status */}
          <span style={{ fontSize: "12px", color: "#757682" }}>
            {isLoggedIn ? "✓ Logged In" : "Not Logged"}
          </span>

          <button className="icon-btn" title="Search">
            <i className="fas fa-search"></i>
          </button>

          <button className="icon-btn" title="Shopping Cart">
            <i className="fas fa-shopping-cart"></i>
          </button>

          {/* Account Button */}
          {isLoggedIn && (
            <Link href="/account" className="icon-btn user-icon" title="Account">
              <i className="fas fa-user-circle"></i>
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