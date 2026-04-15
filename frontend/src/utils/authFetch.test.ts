import { describe, it, expect, vi, beforeEach } from 'vitest';
import { authFetch } from './authFetch';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

beforeEach(() => {
  localStorage.clear();
  mockFetch.mockReset();
});

describe('authFetch', () => {
  it('llama a fetch con la URL del endpoint', async () => {
    mockFetch.mockResolvedValue(new Response('', { status: 200 }));
    await authFetch({ endpoint: '/api/Test', method: 'GET' });
    expect(mockFetch).toHaveBeenCalledOnce();
    const [url] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('/api/Test');
  });

  it('incluye el header Authorization cuando hay token en localStorage', async () => {
    localStorage.setItem('token', 'mi-token');
    mockFetch.mockResolvedValue(new Response('', { status: 200 }));
    await authFetch({ endpoint: '/api/Test', method: 'GET' });
    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect((options.headers as Record<string, string>).Authorization).toBe('Bearer mi-token');
  });

  it('no incluye Authorization cuando no hay token', async () => {
    mockFetch.mockResolvedValue(new Response('', { status: 200 }));
    await authFetch({ endpoint: '/api/Test', method: 'GET' });
    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect((options.headers as Record<string, string>).Authorization).toBeUndefined();
  });

  it('incluye el body en la peticion', async () => {
    mockFetch.mockResolvedValue(new Response('', { status: 200 }));
    await authFetch({ endpoint: '/api/Test', method: 'POST', body: '{"nombre":"Test"}' });
    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(options.body).toBe('{"nombre":"Test"}');
  });

  it('incluye el header Content-Type application/json', async () => {
    mockFetch.mockResolvedValue(new Response('', { status: 200 }));
    await authFetch({ endpoint: '/api/Test', method: 'GET' });
    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect((options.headers as Record<string, string>)['Content-Type']).toBe('application/json');
  });

  it('elimina el token y redirige a /login ante una respuesta 401', async () => {
    localStorage.setItem('token', 'token-expirado');
    Object.defineProperty(window, 'location', { value: { href: '' }, writable: true });
    mockFetch.mockResolvedValue(new Response('', { status: 401 }));
    await authFetch({ endpoint: '/api/Test', method: 'GET' });
    expect(localStorage.getItem('token')).toBeNull();
    expect(window.location.href).toBe('/login');
  });

  it('retorna la respuesta sin modificar para status 200', async () => {
    mockFetch.mockResolvedValue(new Response('ok', { status: 200 }));
    const res = await authFetch({ endpoint: '/api/Test', method: 'GET' });
    expect(res.status).toBe(200);
  });
});
