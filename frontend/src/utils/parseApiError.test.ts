import { describe, it, expect } from 'vitest';
import { parseApiError } from './parseApiError';
import { GENERIC_ERROR } from '../constants';

const makeResponse = (body: string, status = 400) =>
  new Response(body, { status });

describe('parseApiError', () => {
  it('retorna GENERIC_ERROR cuando el body esta vacio', async () => {
    expect(await parseApiError(makeResponse(''))).toBe(GENERIC_ERROR);
  });

  it('concatena los errores de validacion de ASP.NET', async () => {
    const body = JSON.stringify({
      errors: {
        Nombre: ['El nombre es requerido', 'Maximo 100 caracteres'],
        Descripcion: ['La descripcion es requerida'],
      },
    });
    const result = await parseApiError(makeResponse(body));
    expect(result).toContain('El nombre es requerido');
    expect(result).toContain('Maximo 100 caracteres');
    expect(result).toContain('La descripcion es requerida');
  });

  it('retorna json.title cuando esta presente', async () => {
    const body = JSON.stringify({ title: 'No encontrado' });
    expect(await parseApiError(makeResponse(body))).toBe('No encontrado');
  });

  it('retorna json.message si no hay title', async () => {
    const body = JSON.stringify({ message: 'Recurso no encontrado' });
    expect(await parseApiError(makeResponse(body))).toBe('Recurso no encontrado');
  });

  it('retorna el texto plano si la respuesta no es JSON', async () => {
    expect(await parseApiError(makeResponse('No autorizado'))).toBe('No autorizado');
  });

  it('prefiere title sobre message cuando ambos estan presentes', async () => {
    const body = JSON.stringify({ title: 'Error', message: 'Detalle' });
    expect(await parseApiError(makeResponse(body))).toBe('Error');
  });
});
