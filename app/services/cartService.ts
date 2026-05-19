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
    message?: string;
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

const getErrorMessage = (message?: string) => {
    switch (message) {
        case "PRODUCT_OUT_OF_STOCK":
            return "Số lượng sản phẩm trong kho không đủ";
        case "QUANTITY_EXCEEDS_STOCK":
            return "Số lượng vượt quá tồn kho";
        case "CART_ITEM_NOT_FOUND":
            return "Không tìm thấy sản phẩm trong giỏ hàng";
        case "SKU_NOT_FOUND":
            return "Không tìm thấy phiên bản sản phẩm";
        default:
            return message || "Cập nhật số lượng thất bại";
    }
};

export const updateCartItemQuantityAPI = async (
    cartItemId: number,
    quantity: number
): Promise<void> => {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(`${API_URL}/cart/items/${cartItemId}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify({
            quantity,
        }),
    });

    let result: ApiResponse<void> | null = null;

    try {
        result = await response.json();
    } catch {
        result = null;
    }

    if (!response.ok || result?.code !== 200) {
        throw new Error(
            getErrorMessage(result?.message) || `HTTP ${response.status}`
        );
    }
};