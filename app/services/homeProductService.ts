export interface HomeProductResponse {
    id: number;
    name: string;
    price: number;
    image: string;
}

interface ApiResponse<T> {
    code: number;
    data: T;
}

const API_URL = "http://localhost:8080";

export const getHomeKeyboardsAPI = async (
    tab: "in-stock" | "hot"
): Promise<HomeProductResponse[]> => {
    const response = await fetch(
        `${API_URL}/products/home/keyboards?tab=${tab}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch home keyboards");
    }

    const result: ApiResponse<HomeProductResponse[]> = await response.json();
    return result.data;
};

export const getHomeComponentsAPI = async (
    productType: "Keycap" | "Switch"
): Promise<HomeProductResponse[]> => {
    const response = await fetch(
        `${API_URL}/products/home/components?productType=${productType}`,
        {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
            },
        }
    );

    if (!response.ok) {
        throw new Error("Failed to fetch home components");
    }

    const result: ApiResponse<HomeProductResponse[]> = await response.json();
    return result.data;
};