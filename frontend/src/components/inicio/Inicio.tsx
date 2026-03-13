import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import NavBar from '../navBar/navBar';
import { getUsername, getUserRole } from '../../utils/isTokenValid';

interface DashboardCard {
  title: string;
  description: string;
  to: string;
  icon: ReactNode;
  color: string;
}

const adminCards: DashboardCard[] = [
  {
    title: 'Especialidades',
    description: 'Gestionar especialidades medicas disponibles en la clinica.',
    to: '/especialidades',
    color: 'blue',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
      </svg>
    ),
  },
  {
    title: 'Medicos',
    description: 'Administrar el plantel de medicos y sus especialidades.',
    to: '/medicos',
    color: 'emerald',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  {
    title: 'Pacientes',
    description: 'Registrar y gestionar la informacion de los pacientes.',
    to: '/pacientes',
    color: 'violet',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
      </svg>
    ),
  },
  {
    title: 'Turnos',
    description: 'Programar y gestionar los turnos de atencion.',
    to: '/turnos',
    color: 'amber',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
    ),
  },
  {
    title: 'Consultas',
    description: 'Ver y gestionar las consultas medicas realizadas.',
    to: '/consultas',
    color: 'rose',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    title: 'Historias Clinicas',
    description: 'Consultar las historias clinicas de los pacientes.',
    to: '/historias-clinicas',
    color: 'cyan',
    icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
      </svg>
    ),
  },
];

const recepcionistaCards: DashboardCard[] = [
  adminCards[2], // Pacientes
  adminCards[3], // Turnos
  {
    ...adminCards[1], // Medicos (solo ver)
    description: 'Consultar el plantel de medicos y sus especialidades.',
  },
];

const medicoCards: DashboardCard[] = [
  { ...adminCards[3], description: 'Ver tus turnos de atencion programados.' }, // Turnos
  adminCards[4], // Consultas
  adminCards[5], // Historias Clinicas
];

const pacienteCards: DashboardCard[] = [
  { ...adminCards[3], description: 'Ver tus turnos programados.', title: 'Mis Turnos' },
  { ...adminCards[4], description: 'Ver el resultado de tus consultas medicas.', title: 'Mis Consultas' },
  { ...adminCards[5], description: 'Consultar tu historial clinico completo.', title: 'Mi Historia Clinica' },
];

const colorMap: Record<string, { bg: string; border: string; iconBg: string; text: string; hover: string }> = {
  blue:    { bg: 'bg-blue-500/10',    border: 'border-blue-500/20',    iconBg: 'bg-blue-500/20',    text: 'text-blue-400',    hover: 'hover:border-blue-500/40' },
  emerald: { bg: 'bg-emerald-500/10', border: 'border-emerald-500/20', iconBg: 'bg-emerald-500/20', text: 'text-emerald-400', hover: 'hover:border-emerald-500/40' },
  violet:  { bg: 'bg-violet-500/10',  border: 'border-violet-500/20',  iconBg: 'bg-violet-500/20',  text: 'text-violet-400',  hover: 'hover:border-violet-500/40' },
  amber:   { bg: 'bg-amber-500/10',   border: 'border-amber-500/20',   iconBg: 'bg-amber-500/20',   text: 'text-amber-400',   hover: 'hover:border-amber-500/40' },
  rose:    { bg: 'bg-rose-500/10',    border: 'border-rose-500/20',    iconBg: 'bg-rose-500/20',    text: 'text-rose-400',    hover: 'hover:border-rose-500/40' },
  cyan:    { bg: 'bg-cyan-500/10',    border: 'border-cyan-500/20',    iconBg: 'bg-cyan-500/20',    text: 'text-cyan-400',    hover: 'hover:border-cyan-500/40' },
};

const getCardsForRole = (role: string | null): DashboardCard[] => {
  switch (role) {
    case 'Administrador': return adminCards;
    case 'Recepcionista': return recepcionistaCards;
    case 'Medico': return medicoCards;
    case 'Paciente': return pacienteCards;
    default: return [];
  }
};

const getRoleGreeting = (role: string | null): string => {
  switch (role) {
    case 'Administrador': return 'Tienes acceso completo al sistema.';
    case 'Recepcionista': return 'Gestiona pacientes y turnos de la clinica.';
    case 'Medico': return 'Accede a tus turnos, consultas e historias clinicas.';
    case 'Paciente': return 'Consulta tus turnos programados.';
    default: return 'Bienvenido al sistema.';
  }
};

const Inicio = () => {
  const username = getUsername();
  const role = getUserRole();
  const cards = getCardsForRole(role);

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <NavBar />
      <div className="max-w-6xl mx-auto w-full px-4 py-10">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold mb-2">
            Hola, <span className="text-blue-400">{username}</span>
          </h1>
          <p className="text-slate-400 text-lg">{getRoleGreeting(role)}</p>
        </div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {cards.map((card) => {
            const colors = colorMap[card.color];
            return (
              <Link
                key={card.to}
                to={card.to}
                className={`group relative rounded-2xl border ${colors.border} ${colors.bg} p-6 transition-all duration-200 ${colors.hover} hover:shadow-lg hover:shadow-slate-900/50 hover:-translate-y-0.5`}
              >
                <div className={`inline-flex items-center justify-center w-14 h-14 rounded-xl ${colors.iconBg} ${colors.text} mb-4`}>
                  {card.icon}
                </div>
                <h2 className="text-lg font-semibold text-white mb-1">{card.title}</h2>
                <p className="text-sm text-slate-400 leading-relaxed">{card.description}</p>
                <div className={`absolute top-6 right-6 ${colors.text} opacity-0 group-hover:opacity-100 transition-opacity`}>
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </div>
              </Link>
            );
          })}
        </div>

        {/* Empty state */}
        {cards.length === 0 && (
          <div className="text-center py-20">
            <svg className="w-16 h-16 text-slate-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <p className="text-slate-500 text-lg">No tienes modulos asignados a tu rol.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inicio;
