export interface CartItemOptionResponse {
    name: string;
    value: string;
}

export interface CartItemResponse {
    id: number;
    skuId: number;
    productId: number;
    productName: string;
    image: string;
    price: number;
    quantity: number;
    options?: CartItemOptionResponse[];
}

export interface CartResponse {
    id: number;
    items: CartItemResponse[];
    totalPrice: number;
    totalItems: number;
}

interface ApiResponse<T> {
    code: number;
    data: T;
}

const API_URL = 'http://localhost:8080';

export const getMyCartAPI = async (): Promise<CartResponse> => {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${API_URL}/cart/my-cart`, {
        method: 'POST',
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to get cart: ${response.status}`);
    }

    const result: ApiResponse<CartResponse> = await response.json();

    return result.data;
};