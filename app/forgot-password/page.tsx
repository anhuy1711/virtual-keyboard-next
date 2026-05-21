"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-toastify";
import TopNav from "@/app/components/top-nav";
import Footer from "@/app/components/footer";
import { forgotPasswordAPI } from "@/app/services/authService";
import "../components/login-form.css";
import Link from "next/link";

export default function ForgotPasswordPage() {
    const router = useRouter();

    const [email, setEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const handleForgotPassword = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.warning("Vui lòng nhập email");
            return;
        }

        try {
            setIsLoading(true);

            await forgotPasswordAPI({
                email: email.trim(),
            });

            toast.success("Mật khẩu mới đã được gửi về email của bạn!");

            setTimeout(() => {
                router.push("/login");
            }, 1500);
        } catch (error) {
            console.error("Forgot password error:", error);

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Gửi yêu cầu quên mật khẩu thất bại"
            );
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <TopNav />

            <main className="min-h-screen flex flex-col pt-20">
                <div className="flex-grow">
                    <div className="login-container">
                        <div className="login-wrapper">
                            <div className="login-card">
                                <h1>ĐẶT LẠI MẬT KHẨU</h1>

                                <p className="text-sm text-slate-500 text-center mb-6">
                                    Nhập email đã đăng ký. Hệ thống sẽ gửi mật khẩu mới về email
                                    của bạn.
                                </p>

                                <form onSubmit={handleForgotPassword} className="login-form">
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

                                    <button
                                        type="submit"
                                        className="btn-login"
                                        disabled={isLoading}
                                    >
                                        {isLoading ? "Đang gửi..." : "Gửi mật khẩu mới"}
                                    </button>
                                </form>

                                <div className="forgot-password mt-5">
                                    <Link
                                        href="/login"
                                        className="text-sm font-semibold text-primary hover:underline"
                                    >
                                        Quay lại đăng nhập
                                    </Link>
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