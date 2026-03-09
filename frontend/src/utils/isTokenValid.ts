const getTokenPayload = (): Record<string, string> | null => {
  const token = localStorage.getItem('token');
  if (!token) return null;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    if (payload.exp * 1000 <= Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
};

export const isTokenValid = (): boolean => {
  return getTokenPayload() !== null;
};

export const getUsername = (): string | null => {
  return getTokenPayload()?.UserName ?? null;
};
