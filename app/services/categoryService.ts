export interface CategoryResponse {
    id: number;
    name: string;
    description?: string | null;
}

export interface SimplePage<T> {
    content: T[];
    page: number;
    size: number;
    totalElements: number;
    totalPages: number;
    last?: boolean;
    first?: boolean;
}

interface ApiResponse<T> {
    code: number;
    data: T;
}

const API_URL = "http://localhost:8080";

export const getCategoriesAPI = async (
    keyword?: string,
    page: number = 0,
    size: number = 20
): Promise<SimplePage<CategoryResponse>> => {
    const token = localStorage.getItem("accessToken");

    const params = new URLSearchParams();

    if (keyword && keyword.trim()) {
        params.append("keyword", keyword.trim());
    }

    params.append("page", String(page));
    params.append("size", String(size));

    const response = await fetch(`${API_URL}/categories/list?${params.toString()}`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to fetch categories: ${response.status}`);
    }

    const result: ApiResponse<SimplePage<CategoryResponse>> = await response.json();

    return result.data;
};