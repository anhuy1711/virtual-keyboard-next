export type PaymentMethod = 'COD' | 'ONLINE';

export interface CheckoutRequest {
    receiverName: string;
    receiverPhone: string;
    receiverAddress: string;
    note?: string;
    paymentMethod: PaymentMethod;
}

export interface OrderItemResponse {
    id: number;
    productId: number;
    productSkuId: number;
    productName: string;
    productImage?: string | null;
    quantity: number;
    price: number;
    totalPrice: number;
    reviewed?: boolean;
}

export interface PaymentDetailResponse {
    id: number;
    amount: number;
    paymentMethod: PaymentMethod;
    status: string;
    transactionCode?: string | null;
    paymentUrl?: string | null;
}

export interface OrderResponse {
    id: number;
    orderCode: string;
    total: number;
    status: string;
    receiverName: string;
    receiverPhone: string;
    receiverAddress: string;
    note?: string | null;

    // thêm dòng này
    items: OrderItemResponse[];

    payment?: PaymentDetailResponse | null;
}

interface ApiResponse<T> {
    code: number;
    data: T;
}

const API_URL = 'http://localhost:8080';

export const checkoutAPI = async (request: CheckoutRequest): Promise<OrderResponse> => {
    const token = localStorage.getItem("accessToken");

    const response = await fetch("http://localhost:8080/orders/checkout", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(request),
    });

    const result = await response.json();

    if (!response.ok || result.code !== 200) {
        throw new Error(result.message || "Đặt hàng thất bại");
    }

    return result.data;
};

export const getMyOrdersAPI = async (): Promise<OrderResponse[]> => {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${API_URL}/orders/my-orders`, {
        method: 'GET',
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to get my orders: ${response.status}`);
    }

    const result: ApiResponse<OrderResponse[]> = await response.json();

    return result.data;
};

export const getMyOrderDetailAPI = async (
    id: number
): Promise<OrderResponse> => {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${API_URL}/orders/${id}`, {
        method: 'GET',
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to get order detail: ${response.status}`);
    }

    const result: ApiResponse<OrderResponse> = await response.json();

    return result.data;
};

export const cancelMyOrderAPI = async (
    id: number
): Promise<OrderResponse> => {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${API_URL}/orders/${id}/cancel`, {
        method: 'PUT',
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });

    if (!response.ok) {
        throw new Error(`Cancel order failed: ${response.status}`);
    }

    const result: ApiResponse<OrderResponse> = await response.json();

    return result.data;
};