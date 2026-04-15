export interface DetalleReceta {
  id: number;
  recetaId: number;
  medicamento: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
}

export interface DetalleRecetaForm {
  medicamento: string;
  dosis: string;
  frecuencia: string;
  duracion: string;
}

export interface Receta {
  id: number;
  consultaId: number;
  consulta?: string;
  fechaEmision: string;
  indicacionesGenerales: string;
  detalles: DetalleReceta[];
}

export interface RecetaForm {
  consultaId: number | '';
  fechaEmision: string;
  indicacionesGenerales: string;
}
