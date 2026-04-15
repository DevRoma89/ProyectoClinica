import { describe, it, expect, beforeEach } from 'vitest';
import { isTokenValid, getUsername, getEmail, getUserRole, canManage } from './isTokenValid';

const ROLE_CLAIM = 'http://schemas.microsoft.com/ws/2008/06/identity/claims/role';

function makeToken(payload: object): string {
  const encoded = btoa(JSON.stringify(payload));
  return `header.${encoded}.signature`;
}

const futureExp = () => Math.floor(Date.now() / 1000) + 3600;
const pastExp = () => Math.floor(Date.now() / 1000) - 3600;

beforeEach(() => localStorage.clear());

describe('isTokenValid', () => {
  it('retorna false cuando no hay token', () => {
    expect(isTokenValid()).toBe(false);
  });

  it('retorna true para un token valido no expirado', () => {
    localStorage.setItem('token', makeToken({ exp: futureExp() }));
    expect(isTokenValid()).toBe(true);
  });

  it('retorna false para un token expirado', () => {
    localStorage.setItem('token', makeToken({ exp: pastExp() }));
    expect(isTokenValid()).toBe(false);
  });

  it('retorna false para un token malformado', () => {
    localStorage.setItem('token', 'esto.no.es.un.jwt.valido');
    expect(isTokenValid()).toBe(false);
  });
});

describe('getUsername', () => {
  it('retorna null cuando no hay token', () => {
    expect(getUsername()).toBeNull();
  });

  it('retorna el claim UserName del token', () => {
    localStorage.setItem('token', makeToken({ exp: futureExp(), UserName: 'juan' }));
    expect(getUsername()).toBe('juan');
  });

  it('retorna null si el token no tiene UserName', () => {
    localStorage.setItem('token', makeToken({ exp: futureExp() }));
    expect(getUsername()).toBeNull();
  });
});

describe('getEmail', () => {
  it('retorna null cuando no hay token', () => {
    expect(getEmail()).toBeNull();
  });

  it('retorna el claim Email del token', () => {
    localStorage.setItem('token', makeToken({ exp: futureExp(), Email: 'juan@test.com' }));
    expect(getEmail()).toBe('juan@test.com');
  });
});

describe('getUserRole', () => {
  it('retorna null cuando no hay token', () => {
    expect(getUserRole()).toBeNull();
  });

  it('retorna el rol del claim de Microsoft Identity', () => {
    localStorage.setItem('token', makeToken({ exp: futureExp(), [ROLE_CLAIM]: 'Medico' }));
    expect(getUserRole()).toBe('Medico');
  });
});

describe('canManage', () => {
  it('retorna false cuando no hay token', () => {
    expect(canManage()).toBe(false);
  });

  it('retorna true para Administrador', () => {
    localStorage.setItem('token', makeToken({ exp: futureExp(), [ROLE_CLAIM]: 'Administrador' }));
    expect(canManage()).toBe(true);
  });

  it('retorna true para Recepcionista', () => {
    localStorage.setItem('token', makeToken({ exp: futureExp(), [ROLE_CLAIM]: 'Recepcionista' }));
    expect(canManage()).toBe(true);
  });

  it('retorna false para Medico', () => {
    localStorage.setItem('token', makeToken({ exp: futureExp(), [ROLE_CLAIM]: 'Medico' }));
    expect(canManage()).toBe(false);
  });

  it('retorna false para Paciente', () => {
    localStorage.setItem('token', makeToken({ exp: futureExp(), [ROLE_CLAIM]: 'Paciente' }));
    expect(canManage()).toBe(false);
  });
});
