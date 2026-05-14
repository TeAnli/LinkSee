import apiClient from '@linksee/api-client';

type SWRKey =
    | string
    | [string, Record<string, unknown> | undefined];

export const fetcher = async <T = unknown>(key: SWRKey): Promise<T> => {
    if (Array.isArray(key)) {
        const [url, params] = key;
        const res = await apiClient.get<{ code: number; data: T }>(url, { params });
        return res.data.data;
    }
    const res = await apiClient.get<{ code: number; data: T }>(key);
    return res.data.data;
};

export const swrConfig = {
    fetcher,
    dedupingInterval: 2000,
    errorRetryCount: 3,
    revalidateOnFocus: true,
    revalidateOnReconnect: true,
    shouldRetryOnError: (err: { response?: { status?: number } }) => {
        const status = err?.response?.status;
        if (status === 401 || status === 403 || status === 404) return false;
        return true;
    },
};