import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import Especialidades from './Especialidades';

vi.mock('../../utils/authFetch', () => ({
  authFetch: vi.fn(),
}));

vi.mock('../navBar/navBar', () => ({
  default: () => <nav data-testid="navbar" />,
}));

import { authFetch } from '../../utils/authFetch';
const mockAuthFetch = vi.mocked(authFetch);

const okResponse = (data: unknown) =>
  Promise.resolve(new Response(JSON.stringify(data), { status: 200 }));

const errorResponse = (message: string) =>
  Promise.resolve(new Response(JSON.stringify({ title: message }), { status: 400 }));

beforeEach(() => vi.clearAllMocks());

describe('Especialidades', () => {
  it('muestra el estado de carga inicial', () => {
    mockAuthFetch.mockReturnValue(new Promise(() => {}));
    render(<Especialidades />);
    expect(screen.getByText('Cargando...')).toBeInTheDocument();
  });

  it('muestra mensaje cuando no hay especialidades', async () => {
    mockAuthFetch.mockReturnValue(okResponse([]));
    render(<Especialidades />);
    await waitFor(() =>
      expect(screen.getByText('No hay especialidades registradas')).toBeInTheDocument()
    );
  });

  it('renderiza las especialidades en la tabla', async () => {
    mockAuthFetch.mockReturnValue(okResponse([
      { id: 1, nombre: 'Cardiologia', descripcion: 'Corazon' },
      { id: 2, nombre: 'Neurologia', descripcion: 'Cerebro' },
    ]));
    render(<Especialidades />);
    await waitFor(() => {
      expect(screen.getByText('Cardiologia')).toBeInTheDocument();
      expect(screen.getByText('Neurologia')).toBeInTheDocument();
    });
  });

  it('muestra el formulario de nueva especialidad por defecto', () => {
    mockAuthFetch.mockReturnValue(new Promise(() => {}));
    render(<Especialidades />);
    expect(screen.getByText('Nueva especialidad')).toBeInTheDocument();
  });

  it('cambia al modo edicion y carga los datos al hacer click en Editar', async () => {
    mockAuthFetch.mockReturnValue(okResponse([
      { id: 1, nombre: 'Cardiologia', descripcion: 'Especialidad del corazon' },
    ]));
    render(<Especialidades />);
    await waitFor(() => screen.getByText('Cardiologia'));

    fireEvent.click(screen.getByTitle('Editar'));

    expect(screen.getByText('Editar especialidad')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Cardiologia')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Especialidad del corazon')).toBeInTheDocument();
    expect(screen.getByText('Actualizar')).toBeInTheDocument();
  });

  it('cancela la edicion y vuelve al formulario de creacion', async () => {
    mockAuthFetch.mockReturnValue(okResponse([
      { id: 1, nombre: 'Cardiologia', descripcion: 'Desc' },
    ]));
    render(<Especialidades />);
    await waitFor(() => screen.getByText('Cardiologia'));

    fireEvent.click(screen.getByTitle('Editar'));
    expect(screen.getByText('Editar especialidad')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancelar'));
    expect(screen.getByText('Nueva especialidad')).toBeInTheDocument();
  });

  it('muestra el popup de confirmacion al hacer click en Eliminar', async () => {
    mockAuthFetch.mockReturnValue(okResponse([
      { id: 1, nombre: 'Cardiologia', descripcion: 'Desc' },
    ]));
    render(<Especialidades />);
    await waitFor(() => screen.getByText('Cardiologia'));

    fireEvent.click(screen.getByTitle('Eliminar'));

    expect(screen.getByText('Eliminar especialidad')).toBeInTheDocument();
    expect(screen.getByText('Eliminar')).toBeInTheDocument();
  });

  it('cierra el popup de eliminacion al cancelar', async () => {
    mockAuthFetch.mockReturnValue(okResponse([
      { id: 1, nombre: 'Cardiologia', descripcion: 'Desc' },
    ]));
    render(<Especialidades />);
    await waitFor(() => screen.getByText('Cardiologia'));

    fireEvent.click(screen.getByTitle('Eliminar'));
    expect(screen.getByText('Eliminar especialidad')).toBeInTheDocument();

    fireEvent.click(screen.getByText('Cancelar'));
    await waitFor(() =>
      expect(screen.queryByText('Eliminar especialidad')).not.toBeInTheDocument()
    );
  });

  it('muestra el popup de error cuando el POST falla', async () => {
    mockAuthFetch
      .mockReturnValueOnce(okResponse([]))
      .mockReturnValueOnce(errorResponse('El nombre ya existe'));

    render(<Especialidades />);
    await waitFor(() => screen.getByText('No hay especialidades registradas'));

    fireEvent.change(screen.getByPlaceholderText('Ej: Cardiologia'), {
      target: { value: 'Cardiologia' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ej: Especialidad del corazon.'), {
      target: { value: 'Desc' },
    });
    fireEvent.click(screen.getByText('Crear'));

    await waitFor(() =>
      expect(screen.getByText('El nombre ya existe')).toBeInTheDocument()
    );
  });

  it('llama a POST con los datos del formulario al crear', async () => {
    mockAuthFetch
      .mockReturnValueOnce(okResponse([]))
      .mockReturnValueOnce(Promise.resolve(new Response('', { status: 200 })))
      .mockReturnValueOnce(okResponse([]));

    render(<Especialidades />);
    await waitFor(() => screen.getByText('No hay especialidades registradas'));

    fireEvent.change(screen.getByPlaceholderText('Ej: Cardiologia'), {
      target: { value: 'Traumatologia' },
    });
    fireEvent.change(screen.getByPlaceholderText('Ej: Especialidad del corazon.'), {
      target: { value: 'Huesos y articulaciones' },
    });
    fireEvent.click(screen.getByText('Crear'));

    await waitFor(() => {
      const postCall = mockAuthFetch.mock.calls[1][0];
      expect(postCall.method).toBe('POST');
      expect(postCall.body).toContain('Traumatologia');
    });
  });
});
