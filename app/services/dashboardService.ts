export interface RevenueByMonthResponse {
    month: string;
    revenue: number;
}

export interface OrderStatusCountResponse {
    status: string;
    value: number;
}

export interface RecentOrderResponse {
    id: number;
    userId: number;
    total: number;
    status: string;
    createdAt: string;
}

export interface TopProductResponse {
    productId: number;
    productName: string;
    sold: number;
    revenue: number;
}

export interface DashboardResponse {
    totalRevenue: number;
    totalOrders: number;
    totalProducts: number;
    totalUsers: number;
    revenueByMonth: RevenueByMonthResponse[];
    ordersByStatus: OrderStatusCountResponse[];
    recentOrders: RecentOrderResponse[];
    topProducts: TopProductResponse[];
}

interface ApiResponse<T> {
    code: number;
    data: T;
    message?: string;
}

const API_URL = "http://localhost:8080";

export const getDashboardAPI = async (): Promise<DashboardResponse> => {
    const token = localStorage.getItem("accessToken");

    const response = await fetch(`${API_URL}/admin/dashboard`, {
        method: "GET",
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });

    const result: ApiResponse<DashboardResponse> = await response.json();

    if (!response.ok || result.code !== 200) {
        throw new Error(result.message || "Không thể tải dữ liệu dashboard");
    }

    return result.data;
};