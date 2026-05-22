export interface CreateReviewRequest {
    productId: number;
    orderItemId: number;
    rating: number;
    comment: string;
}

export interface ReviewResponse {
    id: number;
    productId: number;
    orderItemId: number;
    userId: number;
    rating: number;
    comment: string;
    createdAt?: string;
}

interface ApiResponse<T> {
    code: number;
    message?: string;
    data: T;
}

const API_URL = "http://localhost:8080";

const getToken = () => localStorage.getItem("accessToken");

export const createReviewAPI = async (
    request: CreateReviewRequest
): Promise<ReviewResponse> => {
    const token = getToken();

    const response = await fetch(`${API_URL}/product-reviews`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(request),
    });

    const result: ApiResponse<ReviewResponse> = await response.json();

    if (!response.ok || result.code !== 200) {
        throw new Error(result.message || "Đánh giá sản phẩm thất bại");
    }

    return result.data;
};