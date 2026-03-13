export interface RegisterFormData {
  userName: string;
  email: string;
  password: string;
  confirmarPassword: string;
  rol: string;
}

export const ROLES = [
  { value: 'Administrador', label: 'Administrador' },
  { value: 'Medico', label: 'Medico' },
  { value: 'Recepcionista', label: 'Recepcionista' },
  { value: 'Paciente', label: 'Paciente' },
] as const;
