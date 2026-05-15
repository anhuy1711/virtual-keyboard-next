export interface BannerResponse {
    id: number;
    title: string;
    description: string;
    imageUrl: string;
    buttonText: string;
    link: string;
    position: "HERO" | "SECONDARY";
    displayOrder: number;
    isActive: boolean;
}

interface ApiResponse<T> {
    code: number;
    data: T;
}

const API_URL = "http://localhost:8080";

export const getBannersByPositionAPI = async (
    position: "HERO" | "SECONDARY"
): Promise<BannerResponse[]> => {
    const response = await fetch(`${API_URL}/banners/position/${position}`, {
        method: "GET",
        headers: {
            "Content-Type": "application/json",
        },
    });

    if (!response.ok) {
        throw new Error("Failed to fetch banners");
    }

    const result: ApiResponse<BannerResponse[]> = await response.json();

    return result.data;
};