export const METHODS = {
    GET: 'GET',
    POST: 'POST',
    PUT: 'PUT',
    DELETE: 'DELETE',
    PATCH: 'PATCH',
} as const;

export const GENERIC_ERROR = 'Ocurrio un error inesperado. Intenta de nuevo mas tarde.';

export const ENDPOINTS = {
    LOGIN: '/api/Usuario/Login',
    REGISTRO: '/api/Usuario/Registrar',
    ESPECIALIDAD: '/api/Especialidad',
} as const;