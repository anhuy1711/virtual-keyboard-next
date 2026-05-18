export type AuditAction =
    | 'CREATE'
    | 'UPDATE'
    | 'DELETE'
    | 'LOGIN'
    | 'LOGOUT'
    | 'CHECKOUT'
    | 'CANCEL_ORDER'
    | 'UPDATE_STATUS';

export interface AuditLogResponse {
    id: number;
    performedAt: string;
    actorId?: number | null;
    actorName?: string | null;
    action: AuditAction;
    target: string;
    description?: string | null;
    ipAddress?: string | null;
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
}

const API_URL = 'http://localhost:8080';

export interface GetAuditLogsParams {
    action?: AuditAction;
    actorName?: string;
    from?: string;
    to?: string;
    page?: number;
    size?: number;
}

export const getAuditLogsAPI = async (
    params: GetAuditLogsParams
): Promise<SimplePage<AuditLogResponse>> => {
    const token = localStorage.getItem('accessToken');

    const query = new URLSearchParams();

    if (params.action) query.append('action', params.action);
    if (params.actorName) query.append('actorName', params.actorName);
    if (params.from) query.append('from', params.from);
    if (params.to) query.append('to', params.to);

    query.append('page', String(params.page ?? 0));
    query.append('size', String(params.size ?? 10));

    const response = await fetch(`${API_URL}/audit-logs?${query.toString()}`, {
        method: 'GET',
        headers: {
            ...(token && { Authorization: `Bearer ${token}` }),
        },
    });

    if (!response.ok) {
        throw new Error(`Failed to get audit logs: ${response.status}`);
    }

    const result: ApiResponse<SimplePage<AuditLogResponse>> =
        await response.json();

    return result.data;
};