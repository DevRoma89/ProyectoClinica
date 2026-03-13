export interface Medico {
  id: number;
  nombre: string;
  apellido: string;
  matricula: string;
  especialidadId: number;
  especialidad: string;
  telefono: string;
  email: string;
  activo: boolean;
}

export interface MedicoForm {
  nombre: string;
  apellido: string;
  matricula: string;
  especialidadId: number | '';
  telefono: string;
  email: string;
}
