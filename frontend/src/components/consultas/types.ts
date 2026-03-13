export interface EstudioMedico {
  id: number;
  consultaId: number;
  tipoEstudio: string;
  resultado: string;
  archivoAdjuntoURL: string;
  fechaEstudio: string;
}

export interface EstudioMedicoForm {
  tipoEstudio: string;
  resultado: string;
  archivoAdjuntoURL: string;
  fechaEstudio: string;
}

export interface Consulta {
  id: number;
  fechaConsulta: string;
  motivoConsulta: string;
  diagnostico: string;
  tratamiento: string;
  observaciones: string;
  fechaRegistro: string;
}

export interface ConsultaForm {
  historiaClinicaId: number | '';
  medicoId: number | '';
  turnoId: number | '';
  fechaConsulta: string;
  motivoConsulta: string;
  diagnostico: string;
  tratamiento: string;
  observaciones: string;
}
