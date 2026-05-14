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
        setUser({ error: "Failed to parse user" });
      }
    }
  }, []);

  if (!mounted) return <div>Loading...</div>;

  return (
    <div style={{ padding: "20px", fontFamily: "monospace" }}>
      <h1>🔍 Debug - User Info</h1>
      
      <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}>
        <h3>Token:</h3>
        <pre style={{ fontSize: "12px", overflow: "auto", maxHeight: "100px" }}>
          {token ? `✅ ${token.substring(0, 50)}...` : "❌ No token found"}
        </pre>
      </div>

      <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}>
        <h3>User Object:</h3>
        <pre style={{ fontSize: "12px", overflow: "auto", maxHeight: "150px", backgroundColor: "#f5f5f5" }}>
          {user ? JSON.stringify(user, null, 2) : "❌ No user found"}
        </pre>
      </div>

      <div style={{ marginTop: "20px", padding: "10px", border: "1px solid #ccc", borderRadius: "5px" }}>
        <h3>Role Check:</h3>
        <p>
          {user?.role ? (
            <>
              <strong>Role:</strong> {user.role} <br />
              <strong>Is Admin?</strong> {user.role.toLowerCase() === "admin" ? "✅ YES" : "❌ NO"}
            </>
          ) : (
            "❌ No role found in user object"
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

