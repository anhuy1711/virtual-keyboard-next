"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import { registerAPI } from "@/app/services/authService";
import TopNav from "@/app/components/top-nav";
import Footer from "@/app/components/footer";
import "../components/login-form.css";

export default function SignupPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!username.trim() || !email.trim() || !password || !confirmPassword) {
      toast.warning("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Mật khẩu không khớp");
      return;
    }

    if (password.length < 6) {
      toast.warning("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setIsLoading(true);

    try {
      await registerAPI({
        username: username.trim(),
        email: email.trim(),
        password,
      });

      toast.success("Tạo tài khoản thành công!");

      setTimeout(() => {
        router.push("/login");
      }, 1500);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Tạo tài khoản thất bại. Vui lòng thử lại.";
      toast.error(errorMessage);
      console.error("Register error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLoginNow = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    router.push("/login");
  };

  return (
    <>
      <TopNav />
      <main className="min-h-screen flex flex-col pt-20">
        <div className="flex-grow">
          <div className="login-container">
            <div className="login-wrapper">
              <div className="login-card">
                <h1>ĐĂNG KÝ TÀI KHOẢN</h1>
                <p className="login-subtitle">
                  Bạn đã có tài khoản?{" "}
                  <a href="#" onClick={handleLoginNow} className="signup-link">
                    Đăng nhập tại đây
                  </a>
                </p>

                <form onSubmit={handleSubmit} className="login-form">
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

                  {/* Username Input */}
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

                  {/* Sign Up Button */}
                  <button type="submit" className="btn-login" disabled={isLoading}>
                    {isLoading ? "Đang tạo tài khoản..." : "Đăng ký"}
                  </button>
                </form>

                {/*<div className="divider">*/}
                {/*  <p>Hoặc đăng ký bằng</p>*/}
                {/*</div>*/}

                {/*<div className="social-login">*/}
                {/*  <button*/}
                {/*    type="button"*/}
                {/*    className="btn-facebook"*/}
                {/*    disabled={isLoading}*/}
                {/*    onClick={() => toast.info("Đăng ký Facebook sẽ sớm được cập nhật")}*/}
                {/*  >*/}
                {/*    <span className="social-icon">f</span> Facebook*/}
                {/*  </button>*/}
                {/*  <button*/}
                {/*    type="button"*/}
                {/*    className="btn-google"*/}
                {/*    disabled={isLoading}*/}
                {/*    onClick={() => toast.info("Đăng ký Google sẽ sớm được cập nhật")}*/}
                {/*  >*/}
                {/*    <span className="social-icon">+</span> Google*/}
                {/*  </button>*/}
                {/*</div>*/}
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

