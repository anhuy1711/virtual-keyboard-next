// Product Service - Handle API calls for products

export interface ProductSearchRequest {
  name?: string;
  categoryId?: number;
  sortBy?: string;
}

export interface SimplePage<T> {
  content: T[];
  pageNumber: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
}

export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  summary: string;
  cover: string;
  categoryId: number;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Get filtered products
 * @param request - Search criteria (name, categoryId, sortBy)
 * @param page - Page number (0-indexed)
 * @param size - Page size
 * @returns List of products with pagination info
 */
export const filterProductsAPI = async (
  request: ProductSearchRequest = {},
  page: number = 0,
  size: number = 12
): Promise<SimplePage<ProductResponse>> => {
  try {
    // Get token from localStorage (client-side only)
    const token =
      typeof window !== "undefined" ? localStorage.getItem("token") : null;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add Authorization header if token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_BASE_URL}/products/filter?page=${page}&size=${size}`,
      {
        method: "POST",
        headers,
        body: JSON.stringify(request),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch products");
    }

    const data: ApiResponse<SimplePage<ProductResponse>> =
      await response.json();

    if (data.code !== 200) {
      throw new Error(data.message || "Failed to fetch products");
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching products:", error);
    throw error;
  }
};
