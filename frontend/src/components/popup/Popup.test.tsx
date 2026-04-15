import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import Popup from './Popup';

const base = {
  title: 'Titulo prueba',
  message: 'Mensaje de prueba',
  onConfirm: vi.fn(),
};

describe('Popup', () => {
  it('muestra el titulo y el mensaje', () => {
    render(<Popup {...base} />);
    expect(screen.getByText('Titulo prueba')).toBeInTheDocument();
    expect(screen.getByText('Mensaje de prueba')).toBeInTheDocument();
  });

  it('muestra el texto de confirmacion por defecto', () => {
    render(<Popup {...base} />);
    expect(screen.getByText('Confirmar')).toBeInTheDocument();
  });

  it('muestra el texto de confirmacion personalizado', () => {
    render(<Popup {...base} confirmText="Eliminar" />);
    expect(screen.getByText('Eliminar')).toBeInTheDocument();
  });

  it('llama a onConfirm al hacer click en confirmar', () => {
    const onConfirm = vi.fn();
    render(<Popup {...base} onConfirm={onConfirm} />);
    fireEvent.click(screen.getByText('Confirmar'));
    expect(onConfirm).toHaveBeenCalledOnce();
  });

  it('muestra el boton cancelar por defecto', () => {
    render(<Popup {...base} onCancel={vi.fn()} />);
    expect(screen.getByText('Cancelar')).toBeInTheDocument();
  });

  it('oculta el boton cancelar cuando showCancel es false', () => {
    render(<Popup {...base} showCancel={false} />);
    expect(screen.queryByText('Cancelar')).not.toBeInTheDocument();
  });

  it('llama a onCancel al hacer click en cancelar', () => {
    const onCancel = vi.fn();
    render(<Popup {...base} onCancel={onCancel} showCancel={true} />);
    fireEvent.click(screen.getByText('Cancelar'));
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('llama a onCancel al hacer click en el overlay', () => {
    const onCancel = vi.fn();
    render(<Popup {...base} onCancel={onCancel} />);
    const overlay = document.querySelector('.absolute.inset-0');
    expect(overlay).not.toBeNull();
    fireEvent.click(overlay!);
    expect(onCancel).toHaveBeenCalledOnce();
  });

  it('aplica estilos de variante danger al boton confirmar', () => {
    render(<Popup {...base} variant="danger" confirmText="Eliminar" />);
    const btn = screen.getByText('Eliminar');
    expect(btn.className).toContain('bg-red-600');
  });

  it('aplica estilos de variante success al boton confirmar', () => {
    render(<Popup {...base} variant="success" confirmText="Guardar" />);
    const btn = screen.getByText('Guardar');
    expect(btn.className).toContain('bg-green-600');
  });

  it('aplica estilos de variante info al boton confirmar', () => {
    render(<Popup {...base} variant="info" confirmText="Aceptar" />);
    const btn = screen.getByText('Aceptar');
    expect(btn.className).toContain('bg-blue-600');
  });
});
