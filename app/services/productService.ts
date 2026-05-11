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

export interface Specification {
  fieldName: string;
  value: string;
}

export interface ProductSpecificationCreateRequest {
  productId?: number;
  name: string;
  value: string;
}

export interface ProductSkuCreateRequest {
  productId?: number;
  sizeAttributeId?: number;
  colorAttributeId?: number;
  layoutAttributeId?: number;
  price: number;
  quantity: number;
}

export interface SKU {
  id: number;
  name?: string;
  attributes?: Record<string, string>; // e.g., { "color": "Red", "material": "Brass" }
  price?: number;
  stock?: number;
  image?: string;
  [key: string]: any;
}

export interface ProductResponse {
  id: number;
  name: string;
  description: string;
  summary: string;
  cover: string;
  categoryId: number;
  specifications?: Specification[];
  skus?: SKU[];
}

export interface ProductSpecificationResponse {
  id: number;
  productId: number;
  name: string;
  value: string;
}

export interface ProductSkuResponse {
  id: number;
  productId: number;
  sku: string;
  price: number;
  quantity: number;
  isActive: boolean;
  optionValueIds: number[];
}

export interface OptionValueResponse {
  id: number;
  value: string;
}

export interface ProductOptionResponse {
  id: number;
  name: string;
  values: OptionValueResponse[];
}

export interface ProductDetailResponse {
  id: number;
  name: string;
  description: string;
  summary: string;
  cover: string;
  categoryId: number;
  specifications: ProductSpecificationResponse[];
  skus: ProductSkuResponse[];
  options: ProductOptionResponse[];
}

export interface CreateProductRequest {
  name: string;
  description: string;
  summary?: string;
  cover: string;
  categoryId: number;
  specifications?: ProductSpecificationCreateRequest[];
  skus?: ProductSkuCreateRequest[];
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

export interface CategoryResponse {
  id: number;
  name: string;
  description?: string;
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

/**
 * Get product details by ID
 * @param id - Product ID
 * @returns Product details with specifications, SKUs, and options
 */
export const getProductDetailAPI = async (
  id: number
): Promise<ProductDetailResponse> => {
  try {
    // Get token from localStorage (client-side only)
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || localStorage.getItem("accessToken")
        : null;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add Authorization header if token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    const response = await fetch(
      `${API_BASE_URL}/products/detail?id=${id}`,
      {
        method: "GET",
        headers,
      }
    );

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.message || `Failed to fetch product details: ${response.status}`);
    }

    const data: ApiResponse<ProductDetailResponse> = await response.json();

    if (data.code !== 200) {
      throw new Error(data.message || "Failed to fetch product details");
    }

    if (!data.data || !data.data.id) {
      throw new Error("Invalid product data received");
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching product details:", error);
    throw error;
  }
};

/**
 * Create a new product with specifications and SKUs
 * @param request - Create product request with specifications and SKUs
 * @returns Created product response
 */
export const createProductAPI = async (
  request: CreateProductRequest
): Promise<ProductDetailResponse> => {
  try {
    console.log('🔍 [createProductAPI] Started');
    console.log('🔍 [createProductAPI] API_BASE_URL:', API_BASE_URL);
    
    // Get token from localStorage (client-side only)
    // Try both 'token' and 'accessToken' keys
    const token =
      typeof window !== "undefined"
        ? localStorage.getItem("token") || localStorage.getItem("accessToken")
        : null;

    console.log('🔍 [createProductAPI] Token found:', !!token, token ? token.substring(0, 20) + '...' : 'NO TOKEN');

    if (!token) {
      throw new Error("Unauthorized: No authentication token found");
    }

    const headers: HeadersInit = {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };

    console.log('🔍 [createProductAPI] Headers prepared:', { 'Content-Type': headers['Content-Type'], 'Authorization': 'Bearer [TOKEN]' });
    console.log('🔍 [createProductAPI] Request payload:', request);
    console.log('🔍 [createProductAPI] Fetching from:', `${API_BASE_URL}/products/create`);

    const response = await fetch(`${API_BASE_URL}/products/create`, {
      method: "POST",
      headers,
      body: JSON.stringify(request),
    });

    console.log('🔍 [createProductAPI] Response status:', response.status, response.statusText);
    console.log('🔍 [createProductAPI] Response headers:', {
      'content-type': response.headers.get('content-type'),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      console.error('🔍 [createProductAPI] Error response:', error);
      throw new Error(
        error.message || `Failed to create product: ${response.status}`
      );
    }

    const data: ApiResponse<ProductDetailResponse> = await response.json();
    console.log('🔍 [createProductAPI] Response data:', data);

    if (data.code !== 200) {
      throw new Error(data.message || "Failed to create product");
    }

    if (!data.data || !data.data.id) {
      throw new Error("Invalid product data received from server");
    }

    console.log('✅ [createProductAPI] Product created successfully:', data.data);
    return data.data;
  } catch (error) {
    console.error('❌ [createProductAPI] Exception caught:', error);
    throw error;
  }
};

/**
 * Get categories list
 * @param page - Page number (0-indexed)
 * @param size - Page size
 * @param keyword - Optional search keyword
 * @returns List of categories with pagination info
 */
export const getCategoriesAPI = async (
  page: number = 0,
  size: number = 100,
  keyword?: string
): Promise<SimplePage<CategoryResponse>> => {
  try {
    const token =
      typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;

    const headers: HeadersInit = {
      "Content-Type": "application/json",
    };

    // Add Authorization header if token exists
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }

    // Build query params
    const params = new URLSearchParams({
      page: page.toString(),
      size: size.toString(),
    });

    if (keyword) {
      params.append("keyword", keyword);
    }

    const response = await fetch(
      `${API_BASE_URL}/categories/list?${params.toString()}`,
      {
        method: "POST",
        headers,
        body: JSON.stringify({}),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || "Failed to fetch categories");
    }

    const data: ApiResponse<SimplePage<CategoryResponse>> =
      await response.json();

    if (data.code !== 200) {
      throw new Error(data.message || "Failed to fetch categories");
    }

    return data.data;
  } catch (error) {
    console.error("Error fetching categories:", error);
    throw error;
  }
};

