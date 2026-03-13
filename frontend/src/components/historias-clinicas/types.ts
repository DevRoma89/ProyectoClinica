import type { Consulta } from '../consultas/types';

export interface AntecedenteMedico {
  id: number;
  tipo: string;
  descripcion: string;
  fechaRegistro: string;
}

export interface HistoriaClinica {
  id: number;
  paciente: string;
  fechaCreacion: string;
  observacionesGenerales: string;
  antecedentesMedicos: AntecedenteMedico[];
  consultas: Consulta[];
}
