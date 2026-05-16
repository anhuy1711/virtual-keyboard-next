'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'react-toastify';
import TopNav from '@/app/components/top-nav';
import Footer from '@/app/components/footer';
import {
    cancelMyOrderAPI,
    getMyOrderDetailAPI,
    OrderResponse,
} from '@/app/services/orderService';

export default function OrderDetailPage() {
    const router = useRouter();
    const params = useParams();

    const orderId = params?.id ? Number(params.id) : null;

    const [order, setOrder] = useState<OrderResponse | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCancelling, setIsCancelling] = useState(false);

    useEffect(() => {
        if (!orderId) return;

        const fetchOrderDetail = async () => {
            try {
                setIsLoading(true);

                const data = await getMyOrderDetailAPI(orderId);

                setOrder(data);
            } catch (error) {
                console.error(error);
                toast.error('Không thể tải chi tiết đơn hàng');
                router.push('/account');
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrderDetail();
    }, [orderId, router]);

    const subtotal = useMemo(() => {
        if (!order?.items) return 0;

        return order.items.reduce((sum, item) => {
            return sum + Number(item.totalPrice ?? 0);
        }, 0);
    }, [order]);

    const shippingFee = 0;
    const total = Number(order?.total ?? subtotal + shippingFee);

    const formatCurrency = (value: number) => {
        return Number(value || 0).toLocaleString('vi-VN') + '₫';
    };

    const getOrderStatusLabel = (status?: string) => {
        switch (status) {
            case 'PENDING':
                return 'Chờ xác nhận';
            case 'CONFIRMED':
                return 'Đã xác nhận';
            case 'SHIPPING':
                return 'Đang giao';
            case 'COMPLETED':
                return 'Hoàn thành';
            case 'CANCELLED':
                return 'Đã hủy';
            default:
                return status || 'Không xác định';
        }
    };

    const getPaymentStatusLabel = (status?: string | null) => {
        switch (status) {
            case 'UNPAID':
                return 'Chưa thanh toán';
            case 'PAID':
                return 'Đã thanh toán';
            case 'FAILED':
                return 'Thanh toán thất bại';
            case 'REFUNDED':
                return 'Đã hoàn tiền';
            case 'CANCELLED':
                return 'Đã hủy thanh toán';
            default:
                return 'N/A';
        }
    };

    const getStatusBadgeClass = (status?: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-secondary-container/10 text-secondary border-secondary/20';
            case 'CONFIRMED':
                return 'bg-primary-fixed text-primary border-primary/20';
            case 'SHIPPING':
                return 'bg-tertiary-fixed text-tertiary border-tertiary/20';
            case 'COMPLETED':
                return 'bg-green-100 text-green-700 border-green-200';
            case 'CANCELLED':
                return 'bg-error-container text-error border-error/20';
            default:
                return 'bg-surface-container text-on-surface-variant border-outline-variant/30';
        }
    };

    const getPaymentIcon = () => {
        if (order?.payment?.paymentMethod === 'COD') {
            return 'local_shipping';
        }

        return 'payments';
    };

    const getPaymentMethodLabel = () => {
        if (!order?.payment) return 'N/A';

        if (order.payment.paymentMethod === 'COD') {
            return 'Thanh toán khi nhận hàng';
        }

        if (order.payment.provider === 'MOCK') {
            return 'Thanh toán trực tuyến';
        }

        return order.payment.paymentMethod;
    };

    const handleCancelOrder = async () => {
        if (!order) return;

        const confirmed = window.confirm(
            `Bạn có chắc muốn hủy đơn hàng ${order.orderCode}?`
        );

        if (!confirmed) return;

        try {
            setIsCancelling(true);

            const updatedOrder = await cancelMyOrderAPI(order.id);

            setOrder(updatedOrder);
            toast.success('Hủy đơn hàng thành công');
        } catch (error) {
            console.error(error);
            toast.error('Không thể hủy đơn hàng');
        } finally {
            setIsCancelling(false);
        }
    };

    const handleContinuePayment = () => {
        const paymentUrl = order?.payment?.paymentUrl;

        if (!paymentUrl) {
            toast.warning('Không tìm thấy đường dẫn thanh toán');
            return;
        }

        window.location.href = paymentUrl;
    };

    if (isLoading) {
        return (
            <>
                <TopNav />
                <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 bg-surface flex items-center justify-center">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                        <p className="text-on-surface-variant">Đang tải chi tiết đơn hàng...</p>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    if (!order) {
        return (
            <>
                <TopNav />
                <main className="min-h-screen pt-32 pb-24 px-6 md:px-12 bg-surface flex items-center justify-center">
                    <div className="text-center space-y-4">
                        <h1 className="font-headline text-3xl font-bold text-primary">
                            Không tìm thấy đơn hàng
                        </h1>
                        <Link
                            href="/account"
                            className="inline-block px-6 py-3 bg-primary text-on-primary rounded font-bold"
                        >
                            Quay lại tài khoản
                        </Link>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    return (
        <>
            <TopNav />

            <main className="pt-32 pb-24 px-6 md:px-12 lg:px-[160px] max-w-[1920px] mx-auto bg-surface min-h-screen">
                {/* Back */}
                <div className="mb-8">
                    <button
                        type="button"
                        onClick={() => router.push('/account')}
                        className="inline-flex items-center gap-2 text-sm font-bold text-secondary uppercase tracking-widest hover:text-primary transition-colors"
                    >
                        <span className="material-symbols-outlined text-base">arrow_back</span>
                        Back to My Orders
                    </button>
                </div>

                {/* Order Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-12 border-b border-outline-variant/15 pb-8">
                    <div className="space-y-2">
            <span className="font-label text-xs font-bold uppercase tracking-[0.2em] text-secondary">
              Chi tiết đặt hàng
            </span>

                        <h1 className="font-headline text-4xl font-extrabold tracking-tight text-primary">
                            #{order.orderCode}
                        </h1>

                        <p className="text-on-surface-variant font-medium">
                            Mã đơn hàng: {order.id}
                        </p>
                    </div>

                    <div
                        className={`flex items-center px-4 py-2 rounded-full border ${getStatusBadgeClass(
                            order.status
                        )}`}
                    >
                        <span className="w-2 h-2 rounded-full bg-current mr-3 animate-pulse"></span>
                        <span className="font-label text-sm font-bold uppercase tracking-wider">
              Trạng thái: {getOrderStatusLabel(order.status)}
            </span>
                    </div>
                </header>

                {/* Status Tracker */}
                {order.status !== 'CANCELLED' ? (
                    <section className="mb-12 bg-surface-container-low p-6 rounded-lg border border-outline-variant/20">
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {['PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED'].map(
                                (status, index) => {
                                    const statusOrder = ['PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED'];
                                    const currentIndex = statusOrder.indexOf(order.status);
                                    const active = currentIndex >= index;

                                    return (
                                        <div key={status} className="flex items-center gap-3">
                                            <div
                                                className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-sm ${
                                                    active
                                                        ? 'bg-primary text-on-primary'
                                                        : 'bg-surface-container-high text-on-surface/40'
                                                }`}
                                            >
                                                {active ? (
                                                    <span className="material-symbols-outlined text-sm">check</span>
                                                ) : (
                                                    index + 1
                                                )}
                                            </div>

                                            <span
                                                className={`text-xs md:text-sm font-bold ${
                                                    active ? 'text-primary' : 'text-on-surface/40'
                                                }`}
                                            >
                        {getOrderStatusLabel(status)}
                      </span>
                                        </div>
                                    );
                                }
                            )}
                        </div>
                    </section>
                ) : (
                    <section className="mb-12 bg-error-container text-error p-6 rounded-lg border border-error/20">
                        <div className="flex items-center gap-3">
                            <span className="material-symbols-outlined">cancel</span>
                            <p className="font-bold">Đơn hàng này đã bị hủy.</p>
                        </div>
                    </section>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                    {/* Left Column */}
                    <div className="lg:col-span-2 space-y-12">
                        {/* Receiver Info */}
                        <section className="bg-surface-container-low p-8 rounded-lg border border-outline-variant/20">
                            <div className="flex items-center space-x-3 mb-6 text-secondary">
                                <span className="material-symbols-outlined">person_pin</span>
                                <h3 className="font-headline text-xl font-bold text-primary">
                                    Thông tin người nhận
                                </h3>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 text-sm text-on-surface-variant">
                                <div className="space-y-3">
                                    <div>
                                        <p className="font-label text-xs font-bold uppercase tracking-widest text-secondary mb-1">
                                            Họ và tên
                                        </p>
                                        <p className="text-lg font-bold text-on-surface">
                                            {order.receiverName}
                                        </p>
                                    </div>

                                    <div>
                                        <p className="font-label text-xs font-bold uppercase tracking-widest text-secondary mb-1">
                                            Số điện thoại
                                        </p>
                                        <p className="text-on-surface font-medium">
                                            {order.receiverPhone}
                                        </p>
                                    </div>
                                </div>

                                <div>
                                    <p className="font-label text-xs font-bold uppercase tracking-widest text-secondary mb-1">
                                        Địa chỉ giao hàng
                                    </p>
                                    <p className="text-on-surface leading-relaxed">
                                        {order.receiverAddress}
                                    </p>

                                    {order.note && (
                                        <div className="mt-4">
                                            <p className="font-label text-xs font-bold uppercase tracking-widest text-secondary mb-1">
                                                Ghi chú
                                            </p>
                                            <p className="text-on-surface leading-relaxed">
                                                {order.note}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>

                        {/* Product List */}
                        <section className="space-y-6">
                            <h3 className="font-headline text-xl font-bold text-primary">
                                Sản phẩm đã chọn
                            </h3>

                            <div className="space-y-4">
                                {order.items.map((item) => (
                                    <div
                                        key={item.id}
                                        className="bg-surface-container-lowest p-4 md:p-6 flex flex-col sm:flex-row sm:items-center gap-5 md:gap-8 rounded-sm border border-outline-variant/10 group transition-all duration-300"
                                    >
                                        <div className="w-24 h-24 bg-surface-container flex-shrink-0 overflow-hidden">
                                            <img
                                                alt={item.productName}
                                                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all"
                                                src={item.productImage}
                                            />
                                        </div>

                                        <div className="flex-grow min-w-0">
                                            <h4 className="font-headline font-bold text-on-surface line-clamp-2">
                                                {item.productName}
                                            </h4>

                                            <p className="text-on-surface-variant text-xs mt-1">
                                                SKU ID: {item.productSkuId}
                                            </p>

                                            <p className="mt-2 text-xs font-bold text-secondary uppercase tracking-widest">
                                                Số lượng: {item.quantity}
                                            </p>
                                        </div>

                                        <div className="text-left sm:text-right">
                                            <p className="text-xs text-on-surface-variant">
                                                {formatCurrency(Number(item.price))} / sản phẩm
                                            </p>
                                            <p className="font-headline font-bold text-primary text-lg">
                                                {formatCurrency(Number(item.totalPrice))}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Right Column */}
                    <div className="space-y-8">
                        {/* Payment Info */}
                        <section className="bg-surface-container-lowest p-8 border border-outline-variant/20 rounded-lg">
                            <div className="flex items-center space-x-3 mb-4 text-secondary">
                                <span className="material-symbols-outlined">credit_card</span>
                                <h4 className="font-label text-xs font-bold uppercase tracking-widest">
                                    Phương thức thanh toán
                                </h4>
                            </div>

                            <div className="flex items-center space-x-4 p-4 bg-surface-container-low rounded">
                <span className="material-symbols-outlined text-primary text-3xl">
                  {getPaymentIcon()}
                </span>

                                <div>
                                    <p className="text-sm font-bold text-on-surface">
                                        {getPaymentMethodLabel()}
                                    </p>
                                    <p className="text-[10px] text-on-surface-variant uppercase tracking-wider">
                                        {getPaymentStatusLabel(order.payment?.status)}
                                    </p>

                                    {order.payment?.transactionCode && (
                                        <p className="text-[10px] text-on-surface-variant mt-1">
                                            Transaction: {order.payment.transactionCode}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {order.payment?.paymentMethod === 'ONLINE' &&
                                order.payment?.status === 'UNPAID' &&
                                order.payment?.paymentUrl && (
                                    <button
                                        type="button"
                                        onClick={handleContinuePayment}
                                        className="mt-5 w-full bg-secondary text-on-secondary py-4 rounded font-label text-xs font-bold uppercase tracking-widest transition-all hover:bg-secondary/90"
                                    >
                                        Tiếp tục thanh toán
                                    </button>
                                )}
                        </section>

                        {/* Summary */}
                        <section className="bg-surface-container p-8 rounded-lg shadow-sm">
                            <h3 className="font-headline text-xl font-bold text-primary mb-8">
                                Tổng kết thanh toán
                            </h3>

                            <div className="space-y-4 text-sm font-body">
                                <div className="flex justify-between text-on-surface-variant">
                                    <span>Tạm tính</span>
                                    <span className="font-medium">{formatCurrency(subtotal)}</span>
                                </div>

                                <div className="flex justify-between text-on-surface-variant">
                                    <span>Phí giao hàng</span>
                                    <span className="font-medium">
                    {shippingFee === 0 ? 'Miễn phí' : formatCurrency(shippingFee)}
                  </span>
                                </div>

                                <div className="pt-8 mt-4 border-t border-outline-variant/30">
                                    <div className="flex justify-between items-end mb-8 gap-4">
                    <span className="font-label font-bold uppercase tracking-[0.2em] text-on-surface text-xs">
                      Tổng thanh toán
                    </span>

                                        <span className="font-headline text-2xl md:text-3xl font-extrabold text-primary tracking-tighter text-right">
                      {formatCurrency(total)}
                    </span>
                                    </div>

                                    <div className="space-y-3">
                                        <Link
                                            href="/products"
                                            className="block text-center w-full bg-primary text-on-primary py-4 rounded font-label text-xs font-bold uppercase tracking-widest transition-all hover:bg-primary/90"
                                        >
                                            Tiếp tục mua sắm
                                        </Link>

                                        <Link
                                            href="/account"
                                            className="block text-center w-full bg-transparent border border-outline text-on-surface-variant py-4 rounded font-label text-xs font-bold uppercase tracking-widest transition-all hover:bg-surface-container-high"
                                        >
                                            Quay lại đơn hàng
                                        </Link>

                                        {order.status === 'PENDING' && (
                                            <button
                                                type="button"
                                                onClick={handleCancelOrder}
                                                disabled={isCancelling}
                                                className="w-full bg-transparent border border-error text-error py-4 rounded font-label text-xs font-bold uppercase tracking-widest transition-all hover:bg-error/5 disabled:opacity-50"
                                            >
                                                {isCancelling ? 'Đang hủy...' : 'Hủy đơn hàng'}
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <Footer />
        </>
    );
}