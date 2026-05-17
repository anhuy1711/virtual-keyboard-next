"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { loginAPI } from "@/app/services/authService";
import TopNav from "@/app/components/top-nav";
import Footer from "@/app/components/footer";
import "../components/login-form.css";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.warning("Vui lòng nhập email và mật khẩu");
      return;
    }

    setIsLoading(true);

    try {
      const response = await loginAPI(username, password);
      
      console.log("Login successful, token:", localStorage.getItem("accessToken"));
      console.log("User stored:", localStorage.getItem("user"));

      toast.success("Đăng nhập thành công!");
      
      // Redirect to home page after short delay
      setTimeout(() => {
        router.push("/");
      }, 2000);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Đăng nhập thất bại. Vui lòng thử lại.";
      toast.error(errorMessage);
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateAccount = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push("/signup");
  };

  const handleForgotPassword = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    toast.info("Chức năng quên mật khẩu sẽ sớm được cập nhật");
  };

  const handleLoginWithFacebook = () => {
    toast.info("Đăng nhập Facebook sẽ sớm được cập nhật");
  };

  const handleLoginWithGoogle = () => {
    toast.info("Đăng nhập Google sẽ sớm được cập nhật");
  };

  return (
    <>
      <TopNav />
      <main className="min-h-screen flex flex-col pt-20">
        <div className="flex-grow">
          <div className="login-container">
            <div className="login-wrapper">
              {/* Login Card */}
              <div className="login-card">
          <h1>ĐĂNG NHẬP TÀI KHOẢN</h1>
          <p className="login-subtitle">
            Bạn chưa có tài khoản?{" "}
            <a href="#" onClick={handleCreateAccount} className="signup-link">
              Đăng ký tại đây
            </a>
          </p>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="login-form">
            {/* Email Input */}
            <div className="form-group">
              <label htmlFor="username">
                Tên đăng nhập <span className="required">*</span>
              </label>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Email"
                required
                disabled={isLoading}
                className="input-field"
              />
            </div>

            {/* Password Input */}
            <div className="form-group">
              <label htmlFor="password">
                Mật khẩu <span className="required">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Mật khẩu"
                  required
                  disabled={isLoading}
                  className="input-field"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                >
                  {showPassword ? (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path
                        fillRule="evenodd"
                        d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M3.707 2.293a1 1 0 00-1.414 1.414l14 14a1 1 0 001.414-1.414l-14-14zM10 4.5a7 7 0 016.062 10.857l-1.847-1.847A5 5 0 108.5 8.5l-1.847-1.847A7 7 0 0110 4.5zm0 10a3 3 0 01-3-3l-1.85 1.85A3 3 0 0010 14.5z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                </button>
              </div>
            </div>

            {/* Forgot Password Link */}
            <div className="forgot-password">
              <a href="#" onClick={handleForgotPassword}>
                Quên mật khẩu? Nhấn vào <u>đây</u>
              </a>
            </div>

            {/* Sign In Button */}
            <button type="submit" className="btn-login" disabled={isLoading}>
              {isLoading ? "Đang đăng nhập..." : "Đăng nhập"}
            </button>
          </form>

          {/* Social Login Divider */}
          <div className="divider">
            <p>Hoặc đăng nhập bằng</p>
          </div>

          {/* Social Login Buttons */}
          <div className="social-login">
            <button
              type="button"
              className="btn-facebook"
              disabled={isLoading}
              onClick={handleLoginWithFacebook}
            >
              <span className="social-icon">f</span> Facebook
            </button>
            <button
              type="button"
              className="btn-google"
              disabled={isLoading}
              onClick={handleLoginWithGoogle}
            >
              <span className="social-icon">+</span> Google
            </button>
          </div>
        </div>
      </div>
    </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

