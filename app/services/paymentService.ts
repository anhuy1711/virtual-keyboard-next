export type PaymentStatus =
    | "UNPAID"
    | "PAID"
    | "FAILED"
    | "CANCELED"
    | "REFUNDED";

export interface VnPayPaymentResponse {
    orderId: number;
    paymentId: number;
    amount: number;
    paymentMethod: "COD" | "ONLINE";
    status: PaymentStatus;
    transactionCode: string;
    paymentUrl: string;
}

interface ApiResponse<T> {
    code: number;
    message?: string;
    data: T;
}

const API_URL = "http://localhost:8080";

const getToken = () => localStorage.getItem("accessToken");

const parseApiResponse = async <T,>(
    response: Response,
    fallbackMessage: string
): Promise<T> => {
    const text = await response.text();

    if (!text) {
        throw new Error(`API không trả dữ liệu. HTTP ${response.status}`);
    }

    let result: ApiResponse<T>;

    try {
        result = JSON.parse(text);
    } catch {
        throw new Error("Response từ server không phải JSON hợp lệ");
    }

    if (!response.ok || result.code !== 200) {
        throw new Error(result.message || fallbackMessage);
    }

    return result.data;
};

export const createVnPayPaymentAPI = async (
    orderId: number
): Promise<VnPayPaymentResponse> => {
    const token = getToken();

    const response = await fetch(`${API_URL}/orders/online-create/${orderId}`, {
        method: "POST",
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });

    return parseApiResponse<VnPayPaymentResponse>(
        response,
        "Tạo thanh toán VNPay thất bại"
    );
};

export const handleVnPayResultAPI = async (
    transactionCode: string,
    success: boolean
): Promise<VnPayPaymentResponse> => {
    const token = getToken();

    const endpoint = success
        ? `${API_URL}/orders/vnpay/success?transactionCode=${encodeURIComponent(
            transactionCode
        )}`
        : `${API_URL}/orders/vnpay/failed?transactionCode=${encodeURIComponent(
            transactionCode
        )}`;

    const response = await fetch(endpoint, {
        method: "POST",
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });

    return parseApiResponse<VnPayPaymentResponse>(
        response,
        "Xử lý kết quả thanh toán thất bại"
    );
};

export const getVnPayPaymentStatusAPI = async (
    transactionCode: string
): Promise<VnPayPaymentResponse> => {
    const token = getToken();

    const response = await fetch(
        `${API_URL}/orders/vnpay-status?transactionCode=${encodeURIComponent(
            transactionCode
        )}`,
        {
            method: "GET",
            headers: {
                ...(token && { Authorization: `Bearer ${token}` }),
            },
        }
    );

    return parseApiResponse<VnPayPaymentResponse>(
        response,
        "Không thể tải thông tin thanh toán"
    );
};