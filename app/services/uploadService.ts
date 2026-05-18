const API_URL = "http://localhost:8080";

export const uploadProductImageAPI = async (file: File): Promise<string> => {
    const token = localStorage.getItem("accessToken");

    const formData = new FormData();
    formData.append("file", file);

    const response = await fetch(`${API_URL}/upload/image`, {
        method: "POST",
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`Upload image failed: ${response.status}`);
    }

    return await response.text();
};