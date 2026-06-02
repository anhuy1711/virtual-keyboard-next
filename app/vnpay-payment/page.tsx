"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function VnPayPaymentResult() {
    const searchParams = useSearchParams();

    const orderId = searchParams.get("orderId");
    const status = searchParams.get("status");
    const responseCode = searchParams.get("responseCode");
    const transactionCode = searchParams.get("transactionCode");

    const isSuccess = status === "success";
    const hasResult = Boolean(orderId && status);

    return (
        <main className="min-h-screen bg-[#f4f6f8] px-4 py-10 md:px-8">
            <div className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-3xl items-center justify-center">
                <section className="w-full rounded-xl bg-white p-8 shadow-sm md:p-10">
                    <Link
                        href="/"
                        className="text-3xl font-extrabold tracking-tight text-[#0a4ea1]"
                    >
                        VN<span className="text-[#e11d48]">PAY</span>
                    </Link>

                    <div className="mt-10 flex items-start gap-4">
                        <span
                            className={`material-symbols-outlined text-5xl ${
                                isSuccess ? "text-emerald-600" : "text-rose-600"
                            }`}
                        >
                            {isSuccess ? "check_circle" : "error"}
                        </span>

                        <div>
                            <h1 className="text-2xl font-bold text-slate-900">
                                {hasResult
                                    ? isSuccess
                                        ? "Thanh toan VNPay thanh cong"
                                        : "Thanh toan VNPay that bai"
                                    : "Khong tim thay ket qua thanh toan"}
                            </h1>

                            <p className="mt-3 text-sm leading-6 text-slate-600">
                                {hasResult
                                    ? isSuccess
                                        ? "Don hang da duoc xac nhan sau khi VNPay tra ve ket qua hop le."
                                        : "Giao dich chua thanh cong hoac da bi huy tren cong VNPay."
                                    : "Vui long quay lai danh sach don hang de kiem tra trang thai moi nhat."}
                            </p>
                        </div>
                    </div>

                    <div className="mt-8 space-y-3 rounded-lg bg-slate-50 p-4 text-sm text-slate-700">
                        {orderId && (
                            <div className="flex justify-between gap-4">
                                <span className="text-slate-500">Ma don hang</span>
                                <span className="font-semibold">#{orderId}</span>
                            </div>
                        )}

                        {transactionCode && (
                            <div className="flex justify-between gap-4">
                                <span className="text-slate-500">Ma giao dich</span>
                                <span className="break-all text-right font-semibold">
                                    {transactionCode}
                                </span>
                            </div>
                        )}

                        {responseCode && (
                            <div className="flex justify-between gap-4">
                                <span className="text-slate-500">VNPay response code</span>
                                <span className="font-semibold">{responseCode}</span>
                            </div>
                        )}
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                        {orderId && (
                            <Link
                                href={`/orders/${orderId}`}
                                className="inline-flex h-12 items-center justify-center rounded-md bg-[#0a4ea1] px-6 text-sm font-bold text-white"
                            >
                                Xem chi tiet don hang
                            </Link>
                        )}

                        <Link
                            href="/account"
                            className="inline-flex h-12 items-center justify-center rounded-md bg-slate-100 px-6 text-sm font-semibold text-slate-700"
                        >
                            Ve tai khoan
                        </Link>
                    </div>
                </section>
            </div>
        </main>
    );
}

export default function VnPayPaymentPage() {
    return (
        <Suspense
            fallback={
                <main className="min-h-screen bg-[#f4f6f8] px-4 py-10 md:px-8">
                    <div className="mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-3xl items-center justify-center">
                        <section className="w-full rounded-xl bg-white p-8 text-center text-sm text-slate-600 shadow-sm md:p-10">
                            Dang tai ket qua thanh toan...
                        </section>
                    </div>
                </main>
            }
        >
            <VnPayPaymentResult />
        </Suspense>
    );
}
