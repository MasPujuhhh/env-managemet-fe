export function useApiError() {
  return {
    message(error: unknown, fallback = 'Something went wrong.', opts: { expiredMessage?: string | null } = {}) {
      const response = (error as { response?: { status?: number; data?: { message?: string; errors?: unknown } } })
        ?.response;
      const data = response?.data;
      if (response?.status === 401 && data?.message) {
        // Login attempts also return 401: show the real BE message there,
        // but keep the friendly text for mid-session expiry (default).
        if (opts.expiredMessage === null) return data.message;
        return opts.expiredMessage ?? 'Session expired. Please sign in again.';
      }
      if (!data?.message) return fallback;
      const details = Array.isArray(data.errors) && data.errors.length
        ? `: ${data.errors.map(String).join(', ')}`
        : '';
      return `${data.message}${details}`;
    },
  };
}
