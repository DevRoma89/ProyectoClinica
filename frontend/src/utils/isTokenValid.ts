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

export const getEmail = (): string | null => {
  return getTokenPayload()?.Email ?? null;
};

const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

export const getUserRole = (): string | null => {
  return getTokenPayload()?.[ROLE_CLAIM] ?? null;
};

const MANAGEMENT_ROLES = ['Administrador', 'Recepcionista'];

export const canManage = (): boolean => {
  const role = getUserRole();
  return role !== null && MANAGEMENT_ROLES.includes(role);
};
