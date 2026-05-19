"use client";


import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { jwtDecode } from "jwt-decode";
import Link from "next/link";
import { toast } from "react-toastify";
import {
    getAdminOrderDetailAPI,
    getAdminOrdersAPI,
    OrderResponse,
    OrderStatus,
    SimplePage,
    updateOrderStatusAPI,
    confirmOrderAPI,
} from "@/app/services/orderAdminService";

const ORDER_STATUSES: OrderStatus[] = [
    "PENDING",
    "CONFIRMED",
    "SHIPPING",
    "COMPLETED",
    "CANCELLED",
];

export default function AdminOrdersPage() {
    const router = useRouter();

    const [isAuthorized, setIsAuthorized] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isMounted, setIsMounted] = useState(false);

    const [orders, setOrders] = useState<OrderResponse[]>([]);
    const [pageData, setPageData] = useState<SimplePage<OrderResponse> | null>(
        null
    );
    const [isLoadingOrders, setIsLoadingOrders] = useState(false);

    const [orderId, setOrderId] = useState("");
    const [userId, setUserId] = useState("");
    const [status, setStatus] = useState<OrderStatus | "">("");

    const [currentPage, setCurrentPage] = useState(0);

    const [selectedOrder, setSelectedOrder] = useState<OrderResponse | null>(
        null
    );
    const [isLoadingDetail, setIsLoadingDetail] = useState(false);
    const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

    const [orderToConfirm, setOrderToConfirm] = useState<OrderResponse | null>(null);
    const [isConfirmingOrder, setIsConfirmingOrder] = useState(false);

    useEffect(() => {
        setIsMounted(true);
    }, []);

    useEffect(() => {
        if (!isMounted) return;

        const token = localStorage.getItem("accessToken");

        if (!token) {
            router.push("/login");
            return;
        }

        try {
            const decoded = jwtDecode(token) as { role?: string };
            const userRole = decoded.role?.toUpperCase();

            if (userRole !== "ADMIN") {
                router.push("/");
                return;
            }

            setIsAuthorized(true);
        } catch (error) {
            console.error("Invalid token:", error);
            router.push("/login");
        } finally {
            setIsLoading(false);
        }
    }, [router, isMounted]);

    useEffect(() => {
        if (isAuthorized) {
            fetchOrders(0);
        }
    }, [isAuthorized]);


    const fetchOrders = async (page: number = 0) => {
        try {
            setIsLoadingOrders(true);

            const response = await getAdminOrdersAPI(status || undefined, page, 20);

            setOrders(response.content || []);
            setPageData(response);
            setCurrentPage(page);
        } catch (error) {
            console.error("Failed to fetch orders:", error);
            toast.error("Lỗi khi tải danh sách đơn hàng");
        } finally {
            setIsLoadingOrders(false);
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        fetchOrders(0);
    };

    const handleResetFilter = () => {
        setStatus("");

        setTimeout(() => {
            fetchOrders(0);
        }, 0);
    };

    const handleViewDetail = async (id: number) => {
        try {
            setIsLoadingDetail(true);
            setSelectedOrder(null);

            const data = await getAdminOrderDetailAPI(id);

            setSelectedOrder(data);
        } catch (error) {
            console.error("Failed to get order detail:", error);
            toast.error("Không thể tải chi tiết đơn hàng");
        } finally {
            setIsLoadingDetail(false);
        }
    };

    const handleUpdateStatus = async (newStatus: OrderStatus) => {
        if (!selectedOrder) return;

        try {
            setIsUpdatingStatus(true);

            const updated = await updateOrderStatusAPI(selectedOrder.id, newStatus);

            setSelectedOrder(updated);
            toast.success("Cập nhật trạng thái thành công");

            fetchOrders(currentPage);
        } catch (error) {
            console.error("Update order status error:", error);
            toast.error("Cập nhật trạng thái thất bại");
        } finally {
            setIsUpdatingStatus(false);
        }
    };

    const formatCurrency = (value?: number) => {
        return new Intl.NumberFormat("vi-VN", {
            style: "currency",
            currency: "VND",
            maximumFractionDigits: 0,
        }).format(value || 0);
    };

    const formatDate = (value?: string | null) => {
        if (!value) return "-";

        return new Date(value).toLocaleDateString("vi-VN", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
        });
    };

    const getStatusClass = (value?: string) => {
        switch (value) {
            case "COMPLETED":
                return "bg-emerald-100 text-emerald-700 border-emerald-200";
            case "PENDING":
                return "bg-amber-100 text-amber-700 border-amber-200";
            case "CONFIRMED":
                return "bg-blue-100 text-blue-700 border-blue-200";
            case "SHIPPING":
                return "bg-purple-100 text-purple-700 border-purple-200";
            case "CANCELLED":
                return "bg-red-100 text-red-700 border-red-200";
            default:
                return "bg-slate-100 text-slate-700 border-slate-200";
        }
    };

    const handleConfirmOrder = async () => {
        if (!orderToConfirm) return;

        try {
            setIsConfirmingOrder(true);

            await confirmOrderAPI(orderToConfirm.id);

            toast.success("Xác nhận đơn hàng thành công!");

            setOrderToConfirm(null);
            fetchOrders(currentPage);
        } catch (error) {
            console.error("Confirm order error:", error);
            toast.error(
                error instanceof Error ? error.message : "Xác nhận đơn hàng thất bại"
            );
        } finally {
            setIsConfirmingOrder(false);
        }
    };

    if (!isMounted || isLoading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-surface">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                    <p className="text-on-surface-variant">
                        Đang kiểm tra quyền truy cập...
                    </p>
                </div>
            </div>
        );
    }

    if (!isAuthorized) {
        return null;
    }

    return (
        <div className="flex h-screen bg-surface-ivory">
            <main className="w-full pb-20 md:pb-0">
                <div className="p-8 max-w-7xl mx-auto">
                    {/* Title */}
                    <section className="flex justify-between items-end mb-8">
                        <div>
                            <nav className="flex mb-2">
                                <ol className="flex items-center space-x-2 text-[10px] uppercase tracking-widest text-slate-400 font-label">
                                    <li>
                                        <Link href="/admin" className="hover:text-primary">
                                            Admin
                                        </Link>
                                    </li>
                                    <li>
                    <span className="material-symbols-outlined text-[12px]">
                      chevron_right
                    </span>
                                    </li>
                                    <li>
                                        <span className="text-primary font-bold">Đơn hàng</span>
                                    </li>
                                </ol>
                            </nav>

                            <h1 className="text-4xl font-extrabold tracking-tight text-blue-900 leading-none">
                                Order Management
                            </h1>
                        </div>
                    </section>

                    {/* Filter */}
                    <section className="mb-6 bg-white p-5 rounded-xl border border-outline-variant/10 shadow-sm">
                        <form
                            onSubmit={handleSearch}
                            className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end"
                        >
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
                                    Trạng thái
                                </label>

                                <select
                                    value={status}
                                    onChange={(e) => setStatus(e.target.value as OrderStatus | "")}
                                    className="w-full h-10 px-3 rounded-lg border border-outline-variant/30 bg-surface-container-low text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
                                >
                                    <option value="">Tất cả</option>

                                    {ORDER_STATUSES.map((item) => (
                                        <option key={item} value={item}>
                                            {item}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <button
                                type="submit"
                                className="h-10 px-5 rounded-lg bg-primary text-white text-sm font-bold"
                            >
                                Tìm kiếm
                            </button>

                            <button
                                type="button"
                                onClick={handleResetFilter}
                                className="h-10 px-5 rounded-lg border border-outline-variant text-slate-600 text-sm font-bold"
                            >
                                Xóa bộ lọc
                            </button>
                        </form>
                    </section>

                    {/* Table */}
                    <div className="bg-white rounded-xl overflow-hidden shadow-sm border border-outline-variant/10">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                <tr className="bg-surface-container-low border-b border-outline-variant/10">
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-label font-bold">
                                        Đơn hàng
                                    </th>
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-label font-bold">
                                        Khách hàng
                                    </th>
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-label font-bold text-right">
                                        Tổng tiền
                                    </th>
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-label font-bold">
                                        Trạng thái
                                    </th>
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-label font-bold">
                                        Thanh toán
                                    </th>
                                    <th className="px-6 py-4 text-[10px] uppercase tracking-widest text-slate-500 font-label font-bold text-right">
                                        Hành động
                                    </th>
                                </tr>
                                </thead>

                                <tbody className="divide-y divide-outline-variant/10">
                                {isLoadingOrders ? (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-10 text-center text-slate-500"
                                        >
                                            <div className="flex items-center justify-center gap-2">
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                                                Đang tải đơn hàng...
                                            </div>
                                        </td>
                                    </tr>
                                ) : orders.length > 0 ? (
                                    orders.map((order) => (
                                        <tr
                                            key={order.id}
                                            className="hover:bg-surface-container/30 transition-colors group"
                                        >
                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-bold text-sm text-blue-900">
                                                        {order.orderCode}
                                                    </p>
                                                    <p className="text-xs text-slate-400">
                                                        {formatDate(order.createdAt)}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4">
                                                <div>
                                                    <p className="font-bold text-sm text-blue-900">
                                                        {order.receiverName || `User #${order.userId}`}
                                                    </p>
                                                </div>
                                            </td>

                                            <td className="px-6 py-4 text-right text-sm font-bold text-blue-900">
                                                {formatCurrency(order.total)}
                                            </td>

                                            <td className="px-6 py-4">
                          <span
                              className={`inline-flex px-2.5 py-1 border text-[10px] font-bold uppercase tracking-wider rounded-full ${getStatusClass(
                                  order.status
                              )}`}
                          >
                            {order.status}
                          </span>
                                            </td>

                                            <td className="px-6 py-4 text-sm text-slate-600">
                                                <p>{order.payment?.paymentMethod || "-"}</p>
                                                <p className="text-xs text-slate-400">
                                                    {order.payment?.status || "-"}
                                                </p>
                                            </td>

                                            <td className="px-6 py-4 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        type="button"
                                                        onClick={() => handleViewDetail(order.id)}
                                                        className="inline-flex items-center justify-center w-8 h-8 text-slate-400 hover:text-blue-900 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Xem chi tiết"
                                                    >
      <span className="material-symbols-outlined text-[18px]">
        visibility
      </span>
                                                    </button>

                                                    {order.status === "PENDING" && (
                                                        <button
                                                            type="button"
                                                            onClick={() => setOrderToConfirm(order)}
                                                            className="inline-flex items-center justify-center w-8 h-8 text-emerald-600 bg-emerald-50 rounded-lg transition-colors"
                                                            title="Xác nhận đơn"
                                                        >
        <span className="material-symbols-outlined text-[18px]">
          check_circle
        </span>
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td
                                            colSpan={6}
                                            className="px-6 py-10 text-center text-slate-500"
                                        >
                                            Không có đơn hàng nào
                                        </td>
                                    </tr>
                                )}
                                </tbody>
                            </table>
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-3 bg-surface-container-low flex justify-between items-center border-t border-outline-variant/10">
                            <p className="text-xs text-slate-500">
                                {orders.length} / {pageData?.totalElements ?? orders.length}
                            </p>

                            <div className="flex gap-2">
                                <button
                                    disabled={currentPage <= 0}
                                    onClick={() => fetchOrders(currentPage - 1)}
                                    className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-slate-400 disabled:opacity-50"
                                >
                  <span className="material-symbols-outlined text-sm">
                    chevron_left
                  </span>
                                </button>

                                <button className="w-8 h-8 flex items-center justify-center rounded bg-primary text-white text-xs font-bold">
                                    {currentPage + 1}
                                </button>

                                <button
                                    disabled={
                                        pageData ? currentPage + 1 >= pageData.totalPages : true
                                    }
                                    onClick={() => fetchOrders(currentPage + 1)}
                                    className="w-8 h-8 flex items-center justify-center rounded border border-outline-variant text-slate-400 disabled:opacity-50"
                                >
                  <span className="material-symbols-outlined text-sm">
                    chevron_right
                  </span>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {orderToConfirm && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/20 px-4">
                    <div
                        className="rounded-2xl bg-white px-6 py-6 text-center shadow-xl"
                        style={{
                            width: "min(340px, calc(100vw - 32px))",
                        }}
                    >
                        <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-emerald-100">
        <span className="material-symbols-outlined text-[22px] text-emerald-600">
          check_circle
        </span>
                        </div>

                        <h2 className="text-base font-bold text-slate-900">
                            Xác nhận đơn hàng
                        </h2>

                        <p className="mt-3 text-sm font-semibold text-blue-900">
                            Đơn #{orderToConfirm.id}
                        </p>

                        <p className="mt-2 text-xs text-slate-500">
                            Sau khi xác nhận, đơn hàng sẽ chuyển từ PENDING sang CONFIRMED.
                        </p>

                        <div className="mt-6 grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setOrderToConfirm(null)}
                                disabled={isConfirmingOrder}
                                className="h-10 rounded-lg bg-slate-100 text-sm font-semibold text-slate-600 disabled:opacity-50"
                            >
                                Huỷ
                            </button>

                            <button
                                type="button"
                                onClick={handleConfirmOrder}
                                disabled={isConfirmingOrder}
                                style={{
                                    backgroundColor: "#10b981",
                                    color: "#ffffff",
                                }}
                                className="h-10 rounded-lg text-sm font-bold disabled:opacity-50"
                            >
                                {isConfirmingOrder ? "Đang xác nhận..." : "Xác nhận"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Detail Modal */}
            {(selectedOrder || isLoadingDetail) && (
                <div className="fixed inset-0 z-[999] flex items-center justify-center bg-black/20 px-4">
                    <div
                        className="rounded-2xl bg-white shadow-xl overflow-hidden flex flex-col"
                        style={{
                            width: "min(900px, calc(100vw - 32px))",
                            maxHeight: "calc(100vh - 32px)",
                        }}
                    >
                        <div className="px-6 py-5 border-b border-outline-variant/10 flex items-center justify-between">
                            <div>
                                <h2 className="text-xl font-extrabold text-blue-900">
                                    Chi tiết đơn hàng
                                </h2>
                                <p className="text-sm text-slate-500 mt-1">
                                    Thông tin đơn hàng và sản phẩm đã đặt.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setSelectedOrder(null)}
                                className="w-9 h-9 rounded-lg flex items-center justify-center text-slate-400"
                            >
                                <span className="material-symbols-outlined">close</span>
                            </button>
                        </div>

                        {isLoadingDetail || !selectedOrder ? (
                            <div className="p-12 text-center text-slate-500">
                                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary mx-auto mb-4"></div>
                                Đang tải chi tiết đơn hàng...
                            </div>
                        ) : (
                            <>
                                <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                        <InfoCard label="Mã đơn" value={`#${selectedOrder.id}`} />
                                        <InfoCard
                                            label="Ngày tạo"
                                            value={formatDate(selectedOrder.createdAt)}
                                        />
                                        <InfoCard
                                            label="Tổng tiền"
                                            value={formatCurrency(selectedOrder.total)}
                                        />

                                        <div className="bg-surface-container-low rounded-xl px-4 py-2">
                                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">
                                                Trạng thái
                                            </p>
                                            <span
                                                className={`inline-flex px-2.5 py-1 border text-[10px] font-bold uppercase tracking-wider rounded-full ${getStatusClass(
                                                    selectedOrder.status
                                                )}`}
                                            >
                        {selectedOrder.status}
                      </span>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="bg-surface-container-low rounded-xl px-4 py-2">
                                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
                                                Khách hàng
                                            </p>
                                            <p className="text-sm font-bold text-blue-900">
                                                {selectedOrder.customerName ||
                                                    selectedOrder.receiverName ||
                                                    `User #${selectedOrder.userId}`}
                                            </p>
                                            <p className="text-sm text-slate-600">
                                                {selectedOrder.customerEmail || "-"}
                                            </p>
                                            <p className="text-sm text-slate-600">
                                                {selectedOrder.customerPhone ||
                                                    selectedOrder.receiverPhone ||
                                                    "-"}
                                            </p>
                                        </div>

                                        <div className="bg-surface-container-low rounded-xl p-4">
                                            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-2">
                                                Giao hàng
                                            </p>
                                            <p className="text-sm text-slate-700">
                                                {selectedOrder.shippingAddress || "-"}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="bg-white rounded-xl border border-outline-variant/10 overflow-hidden">
                                        <div className="px-5 py-4 border-b border-outline-variant/10">
                                            <h3 className="text-base font-bold text-blue-900">
                                                Sản phẩm trong đơn
                                            </h3>
                                        </div>

                                        <table className="w-full text-left border-collapse">
                                            <thead>
                                            <tr className="bg-surface-container-low">
                                                <th className="px-5 py-3 text-[10px] uppercase tracking-widest text-slate-500 font-bold">
                                                    Sản phẩm
                                                </th>
                                                <th className="px-5 py-3 text-[10px] uppercase tracking-widest text-slate-500 font-bold text-right">
                                                    Giá
                                                </th>
                                                <th className="px-5 py-3 text-[10px] uppercase tracking-widest text-slate-500 font-bold text-right">
                                                    SL
                                                </th>
                                                <th className="px-5 py-3 text-[10px] uppercase tracking-widest text-slate-500 font-bold text-right">
                                                    Tổng
                                                </th>
                                            </tr>
                                            </thead>

                                            <tbody className="divide-y divide-outline-variant/10">
                                            {selectedOrder.items?.length ? (
                                                selectedOrder.items.map((item) => (
                                                    <tr key={item.id}>
                                                        <td className="px-5 py-4">
                                                            <div className="flex items-center gap-3">
                                                                <div className="w-10 h-10 bg-surface-container-low rounded-lg overflow-hidden flex-shrink-0">
                                                                    {item.productImage ? (
                                                                        <img
                                                                            src={item.productImage}
                                                                            alt={item.productName}
                                                                            className="w-full h-full object-cover"
                                                                        />
                                                                    ) : (
                                                                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <span className="material-symbols-outlined text-[18px]">
                                          inventory_2
                                        </span>
                                                                        </div>
                                                                    )}
                                                                </div>

                                                                <div>
                                                                    <p className="text-sm font-bold text-blue-900">
                                                                        {item.productName}
                                                                    </p>
                                                                    <p className="text-xs text-slate-400">
                                                                        SKU #{item.productSkuId}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                        </td>

                                                        <td className="px-5 py-4 text-right text-sm">
                                                            {formatCurrency(item.price)}
                                                        </td>

                                                        <td className="px-5 py-4 text-right text-sm">
                                                            {item.quantity}
                                                        </td>

                                                        <td className="px-5 py-4 text-right text-sm font-bold text-blue-900">
                                                            {formatCurrency(
                                                                item.totalPrice || item.price * item.quantity
                                                            )}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td
                                                        colSpan={4}
                                                        className="px-5 py-8 text-center text-slate-500"
                                                    >
                                                        Không có dữ liệu sản phẩm.
                                                    </td>
                                                </tr>
                                            )}
                                            </tbody>
                                        </table>
                                    </div>


                                </div>

                                <div className="px-6 py-4 border-t border-outline-variant/10 flex justify-end gap-3 bg-surface-container-low">
                                    <button
                                        type="button"
                                        onClick={() => setSelectedOrder(null)}
                                        className="px-5 py-2 rounded-lg border border-outline-variant text-slate-600 text-sm font-bold bg-white"
                                    >
                                        Đóng
                                    </button>

                                    {selectedOrder.status === "PENDING" && (
                                        <button
                                            type="button"
                                            onClick={() => setOrderToConfirm(selectedOrder)}
                                            className="px-5 py-2 rounded-lg text-sm font-bold text-white"
                                            style={{
                                                backgroundColor: "#10b981",
                                            }}
                                        >
                                            Xác nhận đơn
                                        </button>
                                    )}
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

function InfoCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-surface-container-low rounded-xl p-4">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 font-bold mb-1">
                {label}
            </p>
            <p className="text-sm font-bold text-blue-900">{value}</p>
        </div>
    );
}