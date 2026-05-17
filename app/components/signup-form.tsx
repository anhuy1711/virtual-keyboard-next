"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import "./signup-form.css";

export default function SignupForm() {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validate passwords match
    if (password !== confirmPassword) {
      alert("Mật khẩu không khớp!");
      return;
    }

    // Validate password strength
    if (password.length < 8) {
      alert("Mật khẩu phải có ít nhất 8 ký tự!");
      return;
    }

    // Validate terms accepted
    if (!agreeTerms) {
      alert("Vui lòng chấp nhận điều khoản và chính sách bảo mật!");
      return;
    }

    setIsLoading(true);

    try {
      // TODO: Implement actual signup API call
      console.log("Signup attempt:", { fullName, email, password });
      // await signupAPI(fullName, email, password);
      // router.push("/login");
    } catch (error) {
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginInstead = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push("/login");
  };

  const handleLoginWithFacebook = () => {
    setIsLoading(true);
    try {
      // TODO: Implement Facebook signup
      console.log("Signup with Facebook");
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginWithGoogle = () => {
    setIsLoading(true);
    try {
      // TODO: Implement Google signup
      console.log("Signup with Google");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-wrapper">
        {/* Signup Card */}
        <div className="signup-card">
          <h1>ĐĂNG KÝ TÀI KHOẢN</h1>
          <p className="signup-subtitle">
            Bạn đã có tài khoản?{" "}
            <a href="#" onClick={handleLoginInstead} className="login-link">
              Đăng nhập tại đây
            </a>
          </p>

          {/* Signup Form */}
          <form onSubmit={handleSubmit} className="signup-form">
            {/* Full Name Input */}
            <div className="form-group">
              <label htmlFor="fullName">
                Họ và tên <span className="required">*</span>
              </label>
              <input
                id="fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Nhập tên đầy đủ"
                required
                disabled={isLoading}
                className="input-field"
              />
            </div>

            {/* Email Input */}
            <div className="form-group">
              <label htmlFor="email">
                Email <span className="required">*</span>
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email"
                required
                disabled={isLoading}
                className="input-field"
              />
            </div>

            <div className="form-group">
              <label htmlFor="username">
                Username <span className="required">*</span>
              </label>

              <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Nhập username"
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
                  placeholder="Mật khẩu (ít nhất 8 ký tự)"
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
              <p className="password-hint">Mật khẩu phải có ít nhất 8 ký tự</p>
            </div>

            {/* Confirm Password Input */}
            <div className="form-group">
              <label htmlFor="confirmPassword">
                Xác nhận mật khẩu <span className="required">*</span>
              </label>
              <div className="password-input-wrapper">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Xác nhận mật khẩu"
                  required
                  disabled={isLoading}
                  className="input-field"
                />
                <button
                  type="button"
                  className="toggle-password"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                >
                  {showConfirmPassword ? (
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

            {/* Terms and Conditions */}
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={(e) => setAgreeTerms(e.target.checked)}
                  disabled={isLoading}
                  className="checkbox-input"
                />
                <span>
                  Tôi đồng ý với{" "}
                  <a href="#" className="terms-link">
                    điều khoản và chính sách bảo mật
                  </a>
                </span>
              </label>
            </div>

            {/* Sign Up Button */}
            <button type="submit" className="btn-signup" disabled={isLoading}>
              {isLoading ? "Đang đăng ký..." : "Đăng ký"}
            </button>
          </form>

          {/* Social Login Divider */}
          <div className="divider">
            <p>Hoặc đăng ký bằng</p>
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
  );
}



