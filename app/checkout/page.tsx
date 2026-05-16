'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'react-toastify';
import { checkoutAPI, PaymentMethod } from '@/app/services/orderService';
import { CartResponse, getMyCartAPI } from '@/app/services/cartService';
import { getUserInfoAPI } from '@/app/services/userService';

export default function CheckoutPage() {
    const router = useRouter();

    const [cart, setCart] = useState<CartResponse | null>(null);
    const [isLoadingCart, setIsLoadingCart] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [receiverName, setReceiverName] = useState('');
    const [receiverPhone, setReceiverPhone] = useState('');
    const [receiverAddress, setReceiverAddress] = useState('');
    const [note, setNote] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('COD');

    useEffect(() => {
        const fetchCart = async () => {
            try {
                setIsLoadingCart(true);
                const data = await getMyCartAPI();
                setCart(data);
            } catch (error) {
                console.error(error);
                toast.error('Không thể tải giỏ hàng');
            } finally {
                setIsLoadingCart(false);
            }
        };

        fetchCart();
    }, []);

    useEffect(() => {
        const fetchUserInfo = async () => {
            try {
                const user = await getUserInfoAPI();

                setReceiverName(user.fullName ?? '');
                setReceiverPhone(user.phone ?? '');
                setReceiverAddress(user.address ?? '');
            } catch (error) {
                console.error(error);
                toast.error('Không thể tải thông tin người dùng');
            }
        };

        fetchUserInfo();
    }, []);

    const subtotal = useMemo(() => {
        return Number(cart?.totalPrice ?? 0);
    }, [cart]);

    const shippingFee = 0;
    const total = subtotal + shippingFee;

    const validateForm = () => {
        if (!receiverName.trim()) {
            toast.warning('Vui lòng nhập tên người nhận');
            return false;
        }

        if (!receiverPhone.trim()) {
            toast.warning('Vui lòng nhập số điện thoại');
            return false;
        }

        if (!receiverAddress.trim()) {
            toast.warning('Vui lòng nhập địa chỉ nhận hàng');
            return false;
        }

        if (!cart || cart.items.length === 0) {
            toast.warning('Giỏ hàng đang trống');
            return false;
        }

        return true;
    };

    const handleCheckout = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) return;

        try {
            setIsSubmitting(true);

            const order = await checkoutAPI({
                receiverName: receiverName.trim(),
                receiverPhone: receiverPhone.trim(),
                receiverAddress: receiverAddress.trim(),
                note: note.trim() || undefined,
                paymentMethod,
                provider: paymentMethod === 'COD' ? 'COD' : 'MOCK',
            });

            toast.success('Đặt hàng thành công!');

            if (
                order.payment?.paymentMethod === 'ONLINE' &&
                order.payment?.paymentUrl
            ) {
                window.location.href = order.payment.paymentUrl;
                return;
            }

            router.push(`/orders/${order.id}`);
        } catch (error) {
            console.error(error);
            toast.error('Đặt hàng thất bại');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="bg-surface text-on-surface min-h-screen">
            {/* Top Navigation */}
            <header className="fixed top-0 w-full z-50 bg-[#fcf9f8]/80 backdrop-blur-md shadow-sm">
                <div className="flex justify-between items-center px-6 md:px-12 h-20 w-full max-w-[1920px] mx-auto">
                    <Link href="/" className="text-2xl font-bold tracking-tighter text-primary font-headline">
                        The Digital Atelier
                    </Link>

                    <div className="flex items-center gap-6">
            <span className="text-sm font-medium text-on-surface/60 font-label tracking-wide uppercase">
              Secure Checkout
            </span>
                        <span className="material-symbols-outlined text-primary">lock</span>
                    </div>
                </div>
            </header>

            <main className="pt-32 pb-24 px-6 md:px-12 max-w-[1440px] mx-auto">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-16">
                    {/* Left Column */}
                    <div className="lg:col-span-7">
                        {/* Stepper */}
                        <div className="flex items-center gap-4 mb-12 overflow-x-auto pb-4">
                            <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm">
                  1
                </span>
                                <span className="font-headline font-semibold text-primary whitespace-nowrap">
                  Shipping Information
                </span>
                            </div>

                            <div className="w-12 h-[1px] bg-outline-variant/30"></div>

                            <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-primary text-on-primary flex items-center justify-center font-bold text-sm">
                  2
                </span>
                                <span className="font-headline font-semibold text-primary whitespace-nowrap">
                  Payment
                </span>
                            </div>

                            <div className="w-12 h-[1px] bg-outline-variant/30"></div>

                            <div className="flex items-center gap-3">
                <span className="w-8 h-8 rounded-full bg-surface-container-high text-on-surface/40 flex items-center justify-center font-bold text-sm">
                  3
                </span>
                                <span className="font-headline font-semibold text-on-surface/40 whitespace-nowrap">
                  Complete
                </span>
                            </div>
                        </div>

                        <form onSubmit={handleCheckout} className="space-y-12">
                            {/* Shipping Info */}
                            <section className="space-y-8">
                                <div className="flex flex-col gap-2">
                  <span className="font-label text-xs font-bold tracking-[0.1em] text-secondary uppercase">
                    Contact Details
                  </span>
                                    <h2 className="text-3xl font-bold tracking-tight text-primary font-headline">
                                        Thông tin nhận hàng
                                    </h2>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="md:col-span-2 flex flex-col gap-2">
                                        <label className="font-label text-xs font-semibold text-on-surface/60 uppercase tracking-wider">
                                            Người nhận
                                        </label>
                                        <input
                                            value={receiverName}
                                            onChange={(e) => setReceiverName(e.target.value)}
                                            className="h-14 px-4 bg-surface-container-low border-none focus:ring-0 focus:bg-surface-container-lowest transition-all border-b-2 border-transparent focus:border-secondary text-on-surface font-body outline-none"
                                            placeholder="Nguyễn Văn A"
                                            type="text"
                                        />
                                    </div>

                                    <div className="md:col-span-2 flex flex-col gap-2">
                                        <label className="font-label text-xs font-semibold text-on-surface/60 uppercase tracking-wider">
                                            Số điện thoại
                                        </label>
                                        <input
                                            value={receiverPhone}
                                            onChange={(e) => setReceiverPhone(e.target.value)}
                                            className="h-14 px-4 bg-surface-container-low border-none focus:ring-0 focus:bg-surface-container-lowest transition-all border-b-2 border-transparent focus:border-secondary text-on-surface font-body outline-none"
                                            placeholder="0909123456"
                                            type="tel"
                                        />
                                    </div>

                                    <div className="md:col-span-2 flex flex-col gap-2">
                                        <label className="font-label text-xs font-semibold text-on-surface/60 uppercase tracking-wider">
                                            Địa chỉ nhận hàng
                                        </label>
                                        <input
                                            value={receiverAddress}
                                            onChange={(e) => setReceiverAddress(e.target.value)}
                                            className="h-14 px-4 bg-surface-container-low border-none focus:ring-0 focus:bg-surface-container-lowest transition-all border-b-2 border-transparent focus:border-secondary text-on-surface font-body outline-none"
                                            placeholder="123 Nguyễn Huệ, Quận 1, TP.HCM"
                                            type="text"
                                        />
                                    </div>

                                    <div className="md:col-span-2 flex flex-col gap-2">
                                        <label className="font-label text-xs font-semibold text-on-surface/60 uppercase tracking-wider">
                                            Ghi chú
                                        </label>
                                        <textarea
                                            value={note}
                                            onChange={(e) => setNote(e.target.value)}
                                            className="min-h-28 px-4 py-4 bg-surface-container-low border-none focus:ring-0 focus:bg-surface-container-lowest transition-all border-b-2 border-transparent focus:border-secondary text-on-surface font-body outline-none resize-none"
                                            placeholder="Ví dụ: Giao giờ hành chính"
                                        />
                                    </div>
                                </div>
                            </section>

                            {/* Payment */}
                            <section className="space-y-8 border-t border-outline-variant/15 pt-10">
                                <div className="flex flex-col gap-2">
                  <span className="font-label text-xs font-bold tracking-[0.1em] text-secondary uppercase">
                    Payment Method
                  </span>
                                    <h2 className="text-3xl font-bold tracking-tight text-primary font-headline">
                                        Phương thức thanh toán
                                    </h2>
                                </div>

                                <div className="space-y-4">
                                    <label
                                        className={`relative flex flex-col p-6 rounded-lg cursor-pointer group transition-all border-2 ${
                                            paymentMethod === 'COD'
                                                ? 'bg-surface-container-low border-primary'
                                                : 'bg-surface-container-low border-transparent hover:border-outline-variant/30'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="COD"
                                            checked={paymentMethod === 'COD'}
                                            onChange={() => setPaymentMethod('COD')}
                                            className="sr-only"
                                        />

                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-secondary">
                          local_shipping
                        </span>
                                                <span className="font-headline font-bold text-primary">
                          Thanh toán khi nhận hàng (COD)
                        </span>
                                            </div>

                                            {paymentMethod === 'COD' && (
                                                <span className="material-symbols-outlined text-primary">
                          check_circle
                        </span>
                                            )}
                                        </div>

                                        <p className="mt-2 text-xs text-on-surface/60 font-body">
                                            Quý khách thanh toán bằng tiền mặt khi đơn hàng được giao tới.
                                        </p>
                                    </label>

                                    <label
                                        className={`relative flex flex-col p-6 rounded-lg cursor-pointer group transition-all border-2 ${
                                            paymentMethod === 'ONLINE'
                                                ? 'bg-surface-container-low border-primary'
                                                : 'bg-surface-container-low border-transparent hover:border-outline-variant/30'
                                        }`}
                                    >
                                        <input
                                            type="radio"
                                            name="paymentMethod"
                                            value="ONLINE"
                                            checked={paymentMethod === 'ONLINE'}
                                            onChange={() => setPaymentMethod('ONLINE')}
                                            className="sr-only"
                                        />

                                        <div className="flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                        <span className="material-symbols-outlined text-secondary">
                          payments
                        </span>
                                                <span className="font-headline font-bold text-primary">
                          Thanh toán trực tuyến
                        </span>
                                            </div>

                                            <div className="flex gap-2">
                        <span className="material-symbols-outlined text-on-surface/40 text-xl">
                          credit_card
                        </span>
                                                <span className="material-symbols-outlined text-on-surface/40 text-xl">
                          qr_code_2
                        </span>
                                            </div>
                                        </div>

                                        <p className="mt-2 text-xs text-on-surface/60 font-body">
                                            Demo thanh toán online bằng Mock Payment.
                                        </p>
                                    </label>
                                </div>
                            </section>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    disabled={isSubmitting || isLoadingCart || !cart || cart.items.length === 0}
                                    className="group relative px-10 h-16 bg-gradient-to-r from-primary to-primary-container text-on-primary font-headline font-bold rounded-md flex items-center justify-center gap-3 overflow-hidden transition-transform active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <span>{isSubmitting ? 'Đang đặt hàng...' : 'Đặt hàng'}</span>
                                    <span className="material-symbols-outlined text-lg transition-transform group-hover:translate-x-1">
                    arrow_forward
                  </span>
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Right Column */}
                    <aside className="lg:col-span-5">
                        <div className="sticky top-32 p-8 md:p-10 bg-surface-container-low rounded-xl">
                            <h3 className="text-xl font-bold tracking-tight text-primary mb-8 font-headline">
                                Order Summary
                            </h3>

                            {isLoadingCart ? (
                                <div className="py-16 text-center text-on-surface/60">
                                    Đang tải giỏ hàng...
                                </div>
                            ) : !cart || cart.items.length === 0 ? (
                                <div className="py-16 text-center space-y-4">
                                    <p className="text-on-surface/60">Giỏ hàng đang trống</p>
                                    <Link
                                        href="/products"
                                        className="inline-block px-6 py-3 bg-primary text-on-primary rounded-md font-bold"
                                    >
                                        Tiếp tục mua hàng
                                    </Link>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-6 mb-10">
                                        {cart.items.map((item) => (
                                            <div key={item.id} className="flex gap-4">
                                                <div className="w-20 h-20 bg-surface-container-lowest rounded-lg overflow-hidden flex-shrink-0">
                                                    <img
                                                        className="w-full h-full object-cover"
                                                        src={item.image}
                                                        alt={item.productName}
                                                    />
                                                </div>

                                                <div className="flex flex-col justify-center flex-grow min-w-0">
                          <span className="font-headline font-bold text-on-surface text-sm line-clamp-1">
                            {item.productName}
                          </span>

                                                    {item.options && item.options.length > 0 && (
                                                        <span className="font-body text-xs text-on-surface/60 line-clamp-1">
                              {item.options.map((o) => o.value).join(' / ')}
                            </span>
                                                    )}

                                                    <span className="font-body text-xs text-on-surface/50">
                            Số lượng: {item.quantity}
                          </span>
                                                </div>

                                                <div className="flex items-center">
                          <span className="font-headline font-semibold text-primary whitespace-nowrap">
                            ${Number(item.price * item.quantity).toFixed(2)}
                          </span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-4 border-t border-outline-variant/30 pt-8">
                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-on-surface/60 font-body">Subtotal</span>
                                            <span className="text-on-surface font-headline font-semibold">
                        ${subtotal.toFixed(2)}
                      </span>
                                        </div>

                                        <div className="flex justify-between items-center text-sm">
                                            <span className="text-on-surface/60 font-body">Shipping</span>
                                            <span className="text-on-surface font-headline font-semibold">
                        Free
                      </span>
                                        </div>

                                        <div className="flex justify-between items-center pt-4 border-t border-outline-variant/30">
                      <span className="text-lg font-bold text-primary font-headline uppercase tracking-tighter">
                        Total
                      </span>

                                            <div className="flex flex-col items-end">
                        <span className="text-2xl font-extrabold text-primary font-headline">
                          ${total.toFixed(2)}
                        </span>
                                                <span className="text-[10px] text-on-surface/40 font-body">
                          USD
                        </span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="mt-10 grid grid-cols-2 gap-4">
                                        <div className="flex items-center gap-2 text-[10px] text-on-surface/50 font-label uppercase tracking-widest">
                      <span className="material-symbols-outlined text-sm">
                        verified_user
                      </span>
                                            Secure Server
                                        </div>

                                        <div className="flex items-center gap-2 text-[10px] text-on-surface/50 font-label uppercase tracking-widest">
                      <span className="material-symbols-outlined text-sm">
                        local_shipping
                      </span>
                                            Global Insured
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}