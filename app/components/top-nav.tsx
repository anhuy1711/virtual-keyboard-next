"use client";

import { useState } from "react";
import Link from "next/link";
import "./top-nav.css";

export default function TopNav() {
  const [isLoggedIn] = useState(false);

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
          <button className="icon-btn" title="Search">
            <i className="fas fa-search"></i>
          </button>

          <button className="icon-btn" title="Shopping Cart">
            <i className="fas fa-shopping-cart"></i>
          </button>

          {/* giả lập trạng thái đã login */}
          {isLoggedIn ? (
            <Link href="/account" className="icon-btn user-icon" title="Account">
              <i className="fas fa-user-circle"></i>
            </Link>
          ) : (
            <Link href="/login" className="btn-login">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}