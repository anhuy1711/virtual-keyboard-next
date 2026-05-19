export interface UserResponse {
    id: number;
    username: string;
    email: string;
    phone?: string | null;
    fullName?: string | null;
    address?: string | null;
    birthday?: string | null;
    role: string;
    isActive: boolean;
}

export interface AdminCreateUserRequest {
    username: string;
    email: string;
    password: string;
    fullName?: string;
    phone?: string;
    address?: string;
    birthday?: string;
    role: Role;
}

interface ApiResponse<T> {
    code: number;
    data: T;
}
export type Role = 'ADMIN' | 'STAFF' | 'CUSTOMER';

export interface CustomerResponse {
    id: number;
    username: string;
    email: string;
    phone?: string | null;
    fullName?: string | null;
    address?: string | null;
    birthday?: string | null;
    role?: Role;
    isActive?: boolean;
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

export interface FilterUserRequest {
    fullName?: string;
    username?: string;
    email?: string;
    phone?: string;
    role?: Role;
}

const API_URL = 'http://localhost:8080';

export const getCustomersAPI = async (
    filters: Omit<FilterUserRequest, 'role'>,
    page = 0,
    size = 20
): Promise<SimplePage<CustomerResponse>> => {
    const token = localStorage.getItem('accessToken');

    const request: FilterUserRequest = {
        fullName: filters.fullName?.trim() || undefined,
        username: filters.username?.trim() || undefined,
        email: filters.email?.trim() || undefined,
        phone: filters.phone?.trim() || undefined,
        role: 'CUSTOMER',
    };

    const response = await fetch(
        `${API_URL}/user/admin/list?page=${page}&size=${size}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify(request),
        }
    );

    const result: ApiResponse<SimplePage<CustomerResponse>> =
        await response.json();

    if (!response.ok || result.code !== 200) {
        throw new Error(result.message || 'Không thể tải danh sách khách hàng');
    }

    return result.data;
};

export const getUserInfoAPI = async (): Promise<UserResponse> => {
    const token = localStorage.getItem('accessToken');

    const response = await fetch(`${API_URL}/user/info`, {
        method: 'GET',
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to get user info: ${response.status}`);
    }

    const result: ApiResponse<UserResponse> = await response.json();

    return result.data;
};

export const createUserByAdminAPI = async (
    request: AdminCreateUserRequest
): Promise<CustomerResponse> => {
    const token = localStorage.getItem('accessToken');

    const response = await fetch('http://localhost:8080/user/admin/create', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(request),
    });

    const result: ApiResponse<CustomerResponse> = await response.json();

    if (!response.ok || result.code !== 200) {
        throw new Error(result.message || 'Tạo tài khoản thất bại');
    }

    return result.data;
};

export const getStaffsAPI = async (
    filters: Omit<FilterUserRequest, 'role'>,
    page = 0,
    size = 20
): Promise<SimplePage<CustomerResponse>> => {
    const token = localStorage.getItem('accessToken');

    const request: FilterUserRequest = {
        fullName: filters.fullName?.trim() || undefined,
        username: filters.username?.trim() || undefined,
        email: filters.email?.trim() || undefined,
        phone: filters.phone?.trim() || undefined,
        role: 'STAFF',
    };

    const response = await fetch(
        `${API_URL}/user/admin/list?page=${page}&size=${size}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                ...(token && { Authorization: `Bearer ${token}` }),
            },
            body: JSON.stringify(request),
        }
    );

    const result: ApiResponse<SimplePage<CustomerResponse>> =
        await response.json();

    if (!response.ok || result.code !== 200) {
        throw new Error(result.message || 'Không thể tải danh sách khách hàng');
    }

    return result.data;
};