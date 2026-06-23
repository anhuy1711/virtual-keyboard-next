export interface GhnProvince {
    provinceId: number;
    provinceName: string;
    code?: string | null;
}

export interface GhnDistrict {
    districtId: number;
    provinceId: number;
    districtName: string;
    code?: string | null;
}

export interface GhnWard {
    wardCode: string;
    districtId: number;
    wardName: string;
}

export interface GhnFeeRequest {
    toDistrictId: number;
    toWardCode: string;
    serviceId?: number;
    weight?: number;
    length?: number;
    width?: number;
    height?: number;
    insuranceValue?: number;
}

export interface GhnFeeResponse {
    serviceId: number;
    total: number;
    serviceFee?: number | null;
    insuranceFee?: number | null;
    codFee?: number | null;
}

interface ApiResponse<T> {
    code: number;
    message?: string;
    data: T;
}

const API_URL = "http://localhost:8080";

const parseApiResponse = async <T,>(
    response: Response,
    fallbackMessage: string
): Promise<T> => {
    const result: ApiResponse<T> = await response.json();

    if (!response.ok || result.code !== 200) {
        throw new Error(result.message || fallbackMessage);
    }

    return result.data;
};

export const getGhnProvincesAPI = async (): Promise<GhnProvince[]> => {
    const response = await fetch(`${API_URL}/ghn/provinces`);
    return parseApiResponse<GhnProvince[]>(response, "Khong the tai danh sach tinh thanh");
};

export const getGhnDistrictsAPI = async (
    provinceId: number
): Promise<GhnDistrict[]> => {
    const response = await fetch(`${API_URL}/ghn/districts?provinceId=${provinceId}`);
    return parseApiResponse<GhnDistrict[]>(response, "Khong the tai danh sach quan huyen");
};

export const getGhnWardsAPI = async (
    districtId: number
): Promise<GhnWard[]> => {
    const response = await fetch(`${API_URL}/ghn/wards?districtId=${districtId}`);
    return parseApiResponse<GhnWard[]>(response, "Khong the tai danh sach phuong xa");
};

export const calculateGhnFeeAPI = async (
    request: GhnFeeRequest
): Promise<GhnFeeResponse> => {
    const response = await fetch(`${API_URL}/ghn/fee`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(request),
    });

    return parseApiResponse<GhnFeeResponse>(response, "Khong the tinh phi van chuyen GHN");
};
