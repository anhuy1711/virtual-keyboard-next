// Auth Service - Handle API calls for authentication

export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  username: string;
  role: string;
}

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8080";

/**
 * Login user with username and password
 * @param username - User email or username
 * @param password - User password
 * @returns LoginResponse with access token and user info
 */
export const loginAPI = async (
  username: string,
  password: string
): Promise<LoginResponse> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      } as LoginRequest),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || `Login failed with status ${response.status}`
      );
    }

    const apiResponse: ApiResponse<LoginResponse> = await response.json();

    console.log("Login API Response:", apiResponse);
    console.log("Response data:", apiResponse.data);
    console.log("Token:", apiResponse.data?.token);

    if (!apiResponse.data) {
      throw new Error("Invalid response format from server");
    }

    // Store token in localStorage - backend uses 'token' field
    if (apiResponse.data.token) {
      console.log("Storing token:", apiResponse.data.token);
      localStorage.setItem("accessToken", apiResponse.data.token);
      
      // Store user info
      localStorage.setItem("user", JSON.stringify({
        username: apiResponse.data.username,
        email: apiResponse.data.username,
        role: apiResponse.data.role,
      }));
    } else {
      console.warn("No token in response!");
    }

    return apiResponse.data;
  } catch (error) {
    console.error("Login API error:", error);
    throw error;
  }
};

/**
 * Register new user with email and password
 * @param username - User email
 * @param password - User password
 * @returns User object with id, username, email
 */
export const registerAPI = async (
  username: string,
  password: string
): Promise<any> => {
  try {
    const response = await fetch(`${API_BASE_URL}/user/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        username,
        password,
      } as RegisterRequest),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || `Register failed with status ${response.status}`
      );
    }

    const apiResponse: ApiResponse<any> = await response.json();

    if (!apiResponse.data) {
      throw new Error("Invalid response format from server");
    }

    return apiResponse.data;
  } catch (error) {
    console.error("Register API error:", error);
    throw error;
  }
};

/**
 * Logout user - clear stored tokens
 */
export const logoutAPI = (): void => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

/**
 * Get stored access token
 */
export const getAccessToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("accessToken");
  }
  return null;
};

/**
 * Check if user is authenticated
 */
export const isAuthenticated = (): boolean => {
  return getAccessToken() !== null;
};

/**
 * Get user profile from backend
 * @returns User profile with all details
 */
export const getUserProfile = async (): Promise<any> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("No token available");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/user/info`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch profile: ${response.status}`);
    }

    const apiResponse: ApiResponse<any> = await response.json();
    
    if (!apiResponse.data) {
      throw new Error("Invalid profile response");
    }

    // Store full user profile
    localStorage.setItem("user", JSON.stringify(apiResponse.data));
    
    return apiResponse.data;
  } catch (error) {
    console.log("Get profile error:", error);
    throw error;
  }
};

/**
 * Update user profile information
 * @param updateData - User update request data
 * @returns Updated user profile
 */
export const updateUserInfo = async (updateData: {
  fullName?: string;
  email?: string;
  phone?: string;
  birthday?: string;
  address?: string;
}): Promise<any> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("No token available");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/user/update-info`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify(updateData),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || `Update failed with status ${response.status}`
      );
    }

    const apiResponse: ApiResponse<any> = await response.json();

    if (!apiResponse.data) {
      throw new Error("Invalid response format");
    }

    // Update stored user profile
    localStorage.setItem("user", JSON.stringify(apiResponse.data));

    return apiResponse.data;
  } catch (error) {
    console.error("Update profile error:", error);
    throw error;
  }
};

/**
 * Update user password
 * @param currentPassword - Current password
 * @param newPassword - New password
 * @returns Success message
 */
export const updatePassword = async (
  currentPassword: string,
  newPassword: string
): Promise<string> => {
  const token = getAccessToken();
  if (!token) {
    throw new Error("No token available");
  }

  try {
    const response = await fetch(`${API_BASE_URL}/user/update-password`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${token}`,
      },
      body: JSON.stringify({
        currentPassword,
        newPassword,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(
        error.message || `Update password failed with status ${response.status}`
      );
    }

    const apiResponse: ApiResponse<string> = await response.json();

    if (!apiResponse.data) {
      throw new Error("Invalid response format");
    }

    return apiResponse.data;
  } catch (error) {
    console.error("Update password error:", error);
    throw error;
  }
};

