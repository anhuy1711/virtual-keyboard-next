export type AuditPage<T> = {
    content: T[];
    totalElements: number;
    page: number;
    size: number;
    totalPages: number;
};

export interface ProductReviewResponse {
    id: number;
    userId: number;
    username?: string | null;
    fullName?: string | null;
    productId: number;
    productSkuId?: number | null;
    orderId: number;
    orderItemId: number;
    rating: number;
    comment?: string | null;
    createdAt?: string | null;
}

export interface ProductReviewCreateRequest {
    orderItemId: number;
    rating: number;
    comment?: string;
}

interface ApiResponse<T> {
    code: number;
    data: T;
}

const API_URL = "http://localhost:8080";

export const getProductReviewsAPI = async (
    productId: number,
    page = 0,
    size = 10
): Promise<AuditPage<ProductReviewResponse>> => {
    const response = await fetch(
        `${API_URL}/product-reviews/product/${productId}?page=${page}&size=${size}`,
        {
            method: "GET",
        }
    );

    if (!response.ok) {
        throw new Error(`Failed to get reviews: ${response.status}`);
    }

    const result: ApiResponse<AuditPage<ProductReviewResponse>> =
        await response.json();

    return result.data;
};

export const createProductReviewAPI = async (
    request: ProductReviewCreateRequest
): Promise<ProductReviewResponse> => {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(`${API_URL}/product-reviews`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(request),
    });

    if (!response.ok) {
        throw new Error(`Failed to create review: ${response.status}`);
    }

    const result: ApiResponse<ProductReviewResponse> = await response.json();

    return result.data;
};