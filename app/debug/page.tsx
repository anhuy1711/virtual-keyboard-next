"use client";

import { useState, useEffect } from "react";

export default function DebugPage() {
  const [user, setUser] = useState<any>(null);
  const [token, setToken] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const userStr = localStorage.getItem("user");
    const tokenStr = localStorage.getItem("accessToken");
    
    setToken(tokenStr);
    
    if (userStr) {
      try {
        setUser(JSON.parse(userStr));
      } catch (e) {
        setUser({ error: "Không thể đọc dữ liệu người dùng" });
      }
    }
  }, []);

  if (!mounted) return <div>Đang tải...</div>;

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>Debug - Thông tin người dùng</h1>
      
      <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}>
        <h3>Mã xác thực:</h3>
        <pre style={{ fontSize: "12px", overflow: "auto", maxHeight: "100px" }}>
          {token ? `Có mã: ${token.substring(0, 50)}...` : "Không tìm thấy mã xác thực"}
        </pre>
      </div>

      <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}>
        <h3>Dữ liệu người dùng:</h3>
        <pre style={{ fontSize: "12px", overflow: "auto", maxHeight: "150px", backgroundColor: "#f5f5f5" }}>
          {user ? JSON.stringify(user, null, 2) : "Không tìm thấy người dùng"}
        </pre>
      </div>

      <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}>
        <h3>Kiểm tra vai trò:</h3>
        <p>
          {user?.role ? (
            <>
              <strong>Vai trò:</strong> {user.role} <br />
              <strong>Là quản trị viên?</strong> {user.role.toLowerCase() === "admin" ? "Có" : "Không"}
            </>
          ) : (
            "Không tìm thấy vai trò trong dữ liệu người dùng"
          )}
        </p>
      </div>

      <div style={{ marginTop: "20px" }}>
        <button 
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
          style={{ padding: "10px 20px", backgroundColor: "#ff6b6b", color: "white", border: "none", borderRadius: "5px", cursor: "pointer" }}
        >
          Clear localStorage & Refresh
        </button>
      </div>
    </div>
  );
}

