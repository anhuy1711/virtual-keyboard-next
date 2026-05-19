export type OrderStatus =
    | "PENDING"
    | "CONFIRMED"
    | "SHIPPING"
    | "COMPLETED"
    | "CANCELLED";

export interface OrderItemResponse {
    id: number;
    productId?: number;
    productSkuId: number;
    productName: string;
    productImage?: string | null;
    quantity: number;
    price: number;
    totalPrice?: number;
}

export interface PaymentResponse {
    id: number;
    amount: number;
    paymentMethod: string;
    provider: string;
    status: string;
    transactionCode?: string | null;
    paymentUrl?: string | null;
}

export interface OrderResponse {
    id: number;
    userId?: number | null;

    orderCode?: string | null;

    customerName?: string | null;
    customerEmail?: string | null;
    customerPhone?: string | null;

    receiverName?: string | null;
    receiverPhone?: string | null;
    receiverAddress?: string | null;

    note?: string | null;

    total: number;
    status: OrderStatus;

    payment?: PaymentResponse | null;

    createdAt?: string | null;
    updatedAt?: string | null;

    items?: OrderItemResponse[];
}

export interface SimplePage<T> {
    content: T[];
    totalElements: number;
    page: number;
    size: number;
    totalPages: number;
}

export interface FilterOrderRequest {
    orderId?: number;
    userId?: number;
    status?: OrderStatus;
}

interface ApiResponse<T> {
    code: number;
    data: T;
    message?: string;
}

const API_URL = "http://localhost:8080";

const getToken = () => {
    return localStorage.getItem("accessToken");
};

export const getAdminOrdersAPI = async (
    status?: OrderStatus,
    page = 0,
    size = 20
): Promise<SimplePage<OrderResponse>> => {
    const token = localStorage.getItem("accessToken");

    const query = new URLSearchParams();

    if (status) {
        query.append("status", status);
    }

    query.append("page", String(page));
    query.append("size", String(size));

    const response = await fetch(
        `${API_URL}/orders/admin/list?${query.toString()}`,
        {
            method: "GET",
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        }
    );

    const result: ApiResponse<SimplePage<OrderResponse>> = await response.json();

    if (!response.ok || result.code !== 200) {
        throw new Error(result.message || "Không thể tải danh sách đơn hàng");
    }

    return result.data;
};

export const getAdminOrderDetailAPI = async (
    id: number
): Promise<OrderResponse> => {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(`${API_URL}/orders/${id}`, {
        method: "GET",
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });

    const result: ApiResponse<OrderResponse> = await response.json();

    if (!response.ok || result.code !== 200) {
        throw new Error(result.message || "Không thể tải chi tiết đơn hàng");
    }

    return result.data;
};

export const updateOrderStatusAPI = async (
    id: number,
    status: OrderStatus
): Promise<OrderResponse> => {
    const token = getToken();

    const response = await fetch(
        `${API_URL}/orders/admin/${id}/status?status=${status}`,
        {
            method: "PUT",
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        }
    );

    const result: ApiResponse<OrderResponse> = await response.json();

    if (!response.ok || result.code !== 200) {
        throw new Error(result.message || "Cập nhật trạng thái thất bại");
    }

    return result.data;
};

export const confirmOrderAPI = async (
    id: number
): Promise<OrderResponse> => {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(`${API_URL}/orders/admin/${id}/confirm`, {
        method: "PUT",
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });

    const result: ApiResponse<OrderResponse> = await response.json();

    if (!response.ok || result.code !== 200) {
        throw new Error(result.message || "Xác nhận đơn hàng thất bại");
    }

    return result.data;
};