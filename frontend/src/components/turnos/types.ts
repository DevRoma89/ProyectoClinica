export interface Turno {
  id: number;
  medicoId: number;
  medico: string;
  pacienteId: number;
  paciente: string;
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: string;
  observaciones: string;
  fechaCreacion: string;
  fechaCancelacion: string | null;
}

export interface TurnoForm {
  medicoId: number | '';
  pacienteId: number | '';
  fecha: string;
  horaInicio: string;
  horaFin: string;
  estado: string;
  observaciones: string;
}

export const ESTADOS_TURNO = [
  { value: 'Pendiente', label: 'Pendiente' },
  { value: 'Confirmado', label: 'Confirmado' },
  { value: 'Cancelado', label: 'Cancelado' },
  { value: 'Completado', label: 'Completado' },
] as const;
