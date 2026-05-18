export interface CategoryResponse {
    id: number;
    name: string;
    description?: string | null;
}

export interface CategoryCreateRequest {
    name: string;
    description?: string;
}

export interface SimplePage<T> {
    content: T[];
    totalElements: number;
    page: number;
    size: number;
    totalPages: number;
}

interface ApiResponse<T> {
    code: number;
    data: T;
    message?: string;
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

export const createCategoryAPI = async (
    request: CategoryCreateRequest
): Promise<CategoryResponse> => {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${API_URL}/categories/create`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(request),
    });

    const result: ApiResponse<CategoryResponse> = await response.json();

    if (!response.ok || result.code !== 200) {
        throw new Error(result.message || 'Tạo danh mục thất bại');
    }

    return result.data;
};

export const deleteCategoryAPI = async (id: number): Promise<void> => {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${API_URL}/categories/delete?id=${id}`, {
        method: 'DELETE',
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });

    const result: ApiResponse<null> = await response.json();

    if (!response.ok || result.code !== 200) {
        throw new Error(result.message || 'Xóa danh mục thất bại');
    }
};