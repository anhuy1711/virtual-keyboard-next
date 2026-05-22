export interface CustomKeyboardOption {
  id: string;
  name: string;
  priceDelta: number;
  stock: number;
}

export interface CustomKeyboardOptionGroup {
  id: string;
  name: string;
  required: boolean;
  options: CustomKeyboardOption[];
}

export interface CustomKeyboardProduct {
  productId: number;
  skuId: number;
  name: string;
  summary?: string;
  cover?: string;
  imageUrl?: string;
  price: number;
  stock: number;
  layout?: string;
  requiredSwitchCount?: number;
  supportedLayouts?: string[];
  optionGroups?: CustomKeyboardOptionGroup[];
  skus?: CustomKeyboardSku[];
}

export interface CustomKeyboardSku {
  id: number;
  sku: string;
  imageUrl?: string;
  price: number;
  stock: number;
  isActive: boolean;
  optionValueIds: number[];
}

export interface CustomKeyboardCatalog {
  kits: CustomKeyboardProduct[];
  switches: CustomKeyboardProduct[];
  keycaps: CustomKeyboardProduct[];
}

export interface CustomKeyboardBuildRequest {
  name?: string;
  kitSkuId: number;
  switchSkuId: number;
  keycapSkuId: number;
  kitOptions: Record<string, string>;
  assemblyFee?: number;
}

export interface CustomKeyboardValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

export interface CustomKeyboardQuote {
  kitPrice: number;
  kitOptionPrice: number;
  switchUnitPrice: number;
  switchQuantity: number;
  switchTotalPrice: number;
  keycapPrice: number;
  assemblyFee: number;
  totalPrice: number;
  validation: CustomKeyboardValidationResult;
}

export interface KeyboardBuild {
  id: number;
  name: string;
  kitSkuId: number;
  switchSkuId: number;
  keycapSkuId: number;
  switchQuantity: number;
  priceSnapshot: number;
  availabilityStatus: string;
  buildSnapshotJson?: string;
  createdAt: string;
}

interface ApiResponse<T> {
  code: number;
  message?: string;
  data: T;
}

const API_URL = "http://localhost:8080";

const authHeaders = () => {
  if (typeof window === "undefined") {
    return {};
  }

  const token = localStorage.getItem("accessToken");
  return token ? { Authorization: `Bearer ${token}` } : {};
};

const request = async <T>(path: string, options?: RequestInit): Promise<T> => {
  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authHeaders(),
      ...(options?.headers || {}),
    },
  });

  const result: ApiResponse<T> = await response.json();

  if (!response.ok || result.code !== 200) {
    throw new Error(result.message || `Request failed: ${response.status}`);
  }

  return result.data;
};

export const getCustomKeyboardCatalogAPI = () =>
  request<CustomKeyboardCatalog>("/custom-keyboards/catalog");

export const quoteCustomKeyboardAPI = (payload: CustomKeyboardBuildRequest) =>
  request<CustomKeyboardQuote>("/custom-keyboards/quote", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const saveCustomKeyboardBuildAPI = (payload: CustomKeyboardBuildRequest) =>
  request<KeyboardBuild>("/custom-keyboards/builds", {
    method: "POST",
    body: JSON.stringify(payload),
  });

export const getMyCustomKeyboardBuildsAPI = () =>
  request<KeyboardBuild[]>("/custom-keyboards/builds");

export const addCustomKeyboardComboToCartAPI = (payload: CustomKeyboardBuildRequest) =>
  request<void>("/custom-keyboards/cart", {
    method: "POST",
    body: JSON.stringify(payload),
  });
