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

interface ApiResponse<T> {
    code: number;
    data: T;
}

const API_URL = 'http://localhost:8080';

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