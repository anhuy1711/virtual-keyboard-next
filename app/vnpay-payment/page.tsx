"use client";

import Link from "next/link";
import QRCode from "react-qr-code";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-toastify";
import {
    getVnPayPaymentStatusAPI,
    handleVnPayResultAPI,
    VnPayPaymentResponse,
} from "@/app/services/paymentService";
import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";

const formatCurrency = (value?: number | string) => {
    return `${new Intl.NumberFormat("vi-VN", {
        maximumFractionDigits: 0,
    }).format(Number(value || 0))} VNĐ`;
};

export default function VnPayPaymentPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const transactionCode = searchParams.get("transactionCode") || "";

    const [paymentInfo, setPaymentInfo] =
        useState<VnPayPaymentResponse | null>(null);
    const [isChecking, setIsChecking] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const hasCheckedPaymentRef = useRef(false);
    useEffect(() => {
        const fetchPaymentInfo = async () => {
            if (hasCheckedPaymentRef.current) return;
            hasCheckedPaymentRef.current = true;

            if (!transactionCode) {
                toast.error("Không tìm thấy mã giao dịch");
                router.push("/");
                return;
            }

            try {
                setIsChecking(true);

                const data = await getVnPayPaymentStatusAPI(transactionCode);

                if (data.status === "PAID") {
                    toast.info("Giao dịch này đã được thanh toán");
                    router.push(`/orders/${data.orderId}`);
                    return;
                }

                if (data.status === "CANCELED" || data.status === "FAILED") {
                    toast.error("Giao dịch đã bị hủy hoặc thất bại");
                    router.push(`/orders/${data.orderId}`);
                    return;
                }

                setPaymentInfo(data);
            } catch (error) {
                console.error(error);
                toast.error(
                    error instanceof Error
                        ? error.message
                        : "Không thể tải thông tin thanh toán"
                );
                router.push("/");
            } finally {
                setIsChecking(false);
            }
        };

        fetchPaymentInfo();
    }, [transactionCode, router]);

    const qrValue = useMemo(() => {
        if (!paymentInfo) return "";

        return JSON.stringify({
            provider: "VNPAY",
            orderId: paymentInfo.orderId,
            paymentId: paymentInfo.paymentId,
            transactionCode: paymentInfo.transactionCode,
            amount: paymentInfo.amount,
            paymentMethod: paymentInfo.paymentMethod,
        });
    }, [paymentInfo]);

    const handlePaymentResult = async (success: boolean) => {
        if (!paymentInfo?.transactionCode) {
            toast.error("Không tìm thấy mã giao dịch");
            return;
        }

        try {
            setIsSubmitting(true);

            const result = await handleVnPayResultAPI(
                paymentInfo.transactionCode,
                success
            );

            if (success) {
                toast.success("Thanh toán thành công!");
            } else {
                toast.error("Thanh toán đã bị hủy!");
            }

            router.push(`/orders/${result.orderId}`);
        } catch (error) {
            console.error(error);
            toast.error(
                error instanceof Error ? error.message : "Xử lý thanh toán thất bại"
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isChecking) {
        return (
            <main className="min-h-screen flex items-center justify-center bg-[#f4f6f8]">
                <div className="text-center">
                    <div className="mx-auto mb-4 h-10 w-10 animate-spin rounded-full border-b-2 border-[#0a6cc5]" />
                    <p className="text-sm text-slate-500">
                        Đang tải thông tin thanh toán...
                    </p>
                </div>
            </main>
        );
    }

    if (!paymentInfo) {
        return null;
    }

    return (
        <main className="min-h-screen bg-[#f4f6f8] px-4 py-8 md:px-8">
            <div className="mx-auto w-full max-w-6xl">
                <header className="mb-6 flex items-center justify-between">
                    <Link
                        href="/"
                        className="text-3xl font-extrabold tracking-tight text-[#0a4ea1]"
                    >
                        VN<span className="text-[#e11d48]">PAY</span>
                    </Link>

                    <span className="text-sm font-medium text-slate-500">
            Cổng thanh toán trực tuyến
          </span>
                </header>

                <div className="mb-8 rounded-md border border-orange-200 bg-orange-50 px-4 py-4 text-sm text-orange-700">
                    <div className="flex items-start gap-3">
            <span className="material-symbols-outlined text-[20px]">
              warning
            </span>
                        <p>
                            Quý khách vui lòng không tắt trình duyệt cho đến khi nhận được kết
                            quả giao dịch trên website. Xin cảm ơn!
                        </p>
                    </div>
                </div>

                <section style={{display: "flex", justifyContent:"space-between"}} className="grid grid-cols-1 overflow-hidden rounded-xl bg-white shadow-sm lg:grid-cols-2">
                    {/* Left */}
                    <div className="bg-[#f1f5f9] p-8 md:p-10">
                        <h1 className="text-2xl font-semibold text-slate-900">
                            Thông tin thanh toán
                        </h1>

                        <div className="my-8 h-px bg-slate-300" />

                        <div className="space-y-8">
                            <div>
                                <p className="mb-2 text-sm text-slate-500">
                                    Số tiền cần thanh toán
                                </p>

                                <p className="text-4xl font-light text-[#0a6cc5] md:text-5xl">
                                    {new Intl.NumberFormat("vi-VN", {
                                        maximumFractionDigits: 0,
                                    }).format(paymentInfo.amount)}
                                    <span className="ml-1 align-top text-xl">VNĐ</span>
                                </p>
                            </div>

                            {/*<div>*/}
                            {/*    <p className="mb-2 text-sm text-slate-500">Mã đơn hàng</p>*/}
                            {/*    <p className="break-all text-lg font-semibold text-slate-900">*/}
                            {/*        #{paymentInfo.orderId}*/}
                            {/*    </p>*/}
                            {/*</div>*/}

                            <div>
                                <p className="mb-2 text-sm text-slate-500">Mã giao dịch</p>
                                <p className="break-all text-lg font-semibold text-slate-900">
                                    {paymentInfo.transactionCode}
                                </p>
                            </div>

                            <div>
                                <p className="mb-2 text-sm text-slate-500">
                                    Trạng thái thanh toán
                                </p>
                                <span className="inline-flex rounded-full py-1 text-xs font-bold text-amber-700">
                  {paymentInfo.status}
                </span>
                            </div>

                        </div>
                    </div>

                    {/* Right */}
                    <div className="flex flex-col items-center justify-center p-8 md:p-10">
                        <h2 className="text-center text-2xl font-semibold text-slate-900">
                            Quét mã qua ứng dụng Ví VNPAY
                        </h2>

                        <button
                            type="button"
                            className="mt-4 inline-flex items-center gap-2 text-sm text-[#0a85d9]"
                        >
                        </button>

                        {/*<div className="mt-8 flex justify-center">*/}
                        {/*    <div className="w-[90px] aspect-[1200/382]">*/}
                        {/*        <img*/}
                        {/*            src="/Logo-VNPAY-QR-1.webp"*/}
                        {/*            alt="VNPay QR"*/}
                        {/*            className="h-full w-full object-contain"*/}
                        {/*        />*/}
                        {/*    </div>*/}
                        {/*</div>*/}

                        <div className="mt-4 rounded-md border-[4px] border-[#0a6cc5] bg-white p-4">
                            <QRCode value={qrValue} size={260} />
                        </div>

                        <div className="mt-8 flex w-full max-w-sm flex-col gap-3">
                            <button style={{backgroundColor: "green"}}
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => handlePaymentResult(true)}
                                className="h-12 rounded-md bg-[#0a6cc5] text-sm font-bold text-white disabled:opacity-50"
                            >
                                {isSubmitting ? "Đang xử lý..." : "Tôi đã thanh toán"}
                            </button>

                            <button
                                type="button"
                                disabled={isSubmitting}
                                onClick={() => handlePaymentResult(false)}
                                className="h-12 rounded-md bg-slate-100 text-sm font-semibold text-slate-700 disabled:opacity-50"
                            >
                                Hủy thanh toán
                            </button>
                        </div>
                    </div>
                </section>
            </div>
        </main>
    );
}