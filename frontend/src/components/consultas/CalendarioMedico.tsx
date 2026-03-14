import { useEffect, useState, useMemo } from 'react';
import type { Turno } from '../turnos/types';
import type { ConsultaForm } from './types';
import type { HistoriaClinica } from '../historias-clinicas/types';
import type { Medico } from '../medicos/types';
import { METHODS, ENDPOINTS, GENERIC_ERROR } from '../../constants';
import { authFetch } from '../../utils/authFetch';
import { parseApiError } from '../../utils/parseApiError';
import { getEmail } from '../../utils/isTokenValid';

interface CalendarioMedicoProps {
  onConsultaCreated: () => void;
  showError: (message: string) => void;
}

const INITIAL_FORM: ConsultaForm = {
  historiaClinicaId: '',
  medicoId: '',
  turnoId: '',
  fechaConsulta: '',
  motivoConsulta: '',
  diagnostico: '',
  tratamiento: '',
  observaciones: '',
};

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

const CalendarioMedico = ({ onConsultaCreated, showError }: CalendarioMedicoProps) => {
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [historias, setHistorias] = useState<{ id: number; paciente: string; pacienteId?: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedTurno, setSelectedTurno] = useState<Turno | null>(null);
  const [formData, setFormData] = useState<ConsultaForm>(INITIAL_FORM);
  const [submitting, setSubmitting] = useState(false);

  const miMedico = useMemo(() => {
    const email = getEmail();
    return medicos.find(m => m.email.toLowerCase() === email?.toLowerCase());
  }, [medicos]);

  const fetchData = async () => {
    try {
      const [turnosRes, medicosRes, historiasRes] = await Promise.all([
        authFetch({ endpoint: ENDPOINTS.TURNO, method: METHODS.GET }),
        authFetch({ endpoint: ENDPOINTS.MEDICO, method: METHODS.GET }),
        authFetch({ endpoint: ENDPOINTS.HISTORIA_CLINICA, method: METHODS.GET }),
      ]);

      const allTurnos: Turno[] = await turnosRes.json();
      const allMedicos: Medico[] = await medicosRes.json();
      const allHistorias: HistoriaClinica[] = await historiasRes.json();

      setMedicos(allMedicos);
      setHistorias(allHistorias.map(h => ({ id: h.id, paciente: h.paciente })));

      // Filtrar turnos del médico logueado
      const email = getEmail();
      const medicoLogueado = allMedicos.find(m => m.email.toLowerCase() === email?.toLowerCase());
      if (medicoLogueado) {
        const misTurnos = allTurnos.filter(t => t.medicoId === medicoLogueado.id);
        setTurnos(misTurnos);
      } else {
        setTurnos(allTurnos);
      }
    } catch {
      showError(GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Calendario helpers
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  const startDay = firstDayOfMonth.getDay();
  const daysInMonth = lastDayOfMonth.getDate();

  const prevMonth = () => setCurrentDate(new Date(year, month - 1, 1));
  const nextMonth = () => setCurrentDate(new Date(year, month + 1, 1));
  const goToToday = () => setCurrentDate(new Date());

  // Generar días del calendario
  const calendarDays = useMemo(() => {
    const days: (number | null)[] = [];

    // Días vacíos antes del primer día del mes
    for (let i = 0; i < startDay; i++) {
      days.push(null);
    }

    // Días del mes
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }, [startDay, daysInMonth]);

  // Obtener turnos para un día específico
  const getTurnosForDay = (day: number) => {
    const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    return turnos.filter(t => t.fecha.startsWith(dateStr));
  };

  // Estado del turno para colores
  const getEstadoColor = (estado: string) => {
    const estadoUpper = estado.toUpperCase();
    switch (estadoUpper) {
      case 'PENDIENTE': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
      case 'CONFIRMADO': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'COMPLETADO': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'CANCELADO': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    }
  };

  // Manejar clic en turno
  const handleTurnoClick = (turno: Turno) => {
    const estadoUpper = turno.estado.toUpperCase();
    if (estadoUpper === 'COMPLETADO' || estadoUpper === 'CANCELADO') {
      return; // No permitir crear consulta para turnos completados o cancelados
    }

    // Buscar historia clínica del paciente
    const historiaDelPaciente = historias.find(h =>
      h.paciente.toLowerCase() === turno.paciente.toLowerCase()
    );

    setSelectedTurno(turno);
    setFormData({
      ...INITIAL_FORM,
      turnoId: turno.id,
      medicoId: turno.medicoId,
      historiaClinicaId: historiaDelPaciente?.id || '',
      fechaConsulta: turno.fecha.split('T')[0],
    });
  };

  const closeModal = () => {
    setSelectedTurno(null);
    setFormData(INITIAL_FORM);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const completarTurno = async (turnoId: number) => {
    const turno = turnos.find(t => t.id === turnoId);
    if (!turno) return;
    try {
      await authFetch({
        endpoint: ENDPOINTS.TURNO,
        method: METHODS.PUT,
        body: JSON.stringify({
          id: turno.id,
          medicoId: turno.medicoId,
          pacienteId: turno.pacienteId,
          fecha: turno.fecha,
          horaInicio: turno.horaInicio,
          horaFin: turno.horaFin,
          estado: 'Completado',
          observaciones: turno.observaciones,
        }),
      });
    } catch {
      // silently fail
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.historiaClinicaId) {
      showError('Debe seleccionar un paciente con historia clínica');
      return;
    }
    setSubmitting(true);
    try {
      const body = {
        historiaClinicaId: Number(formData.historiaClinicaId),
        medicoId: Number(formData.medicoId),
        turnoId: formData.turnoId ? Number(formData.turnoId) : null,
        fechaConsulta: formData.fechaConsulta,
        motivoConsulta: formData.motivoConsulta,
        diagnostico: formData.diagnostico,
        tratamiento: formData.tratamiento,
        observaciones: formData.observaciones,
        numeroSecuencia: 0,
      };

      const res = await authFetch({
        endpoint: ENDPOINTS.CONSULTA,
        method: METHODS.POST,
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const errorMsg = await parseApiError(res);
        showError(errorMsg);
        return;
      }

      // Marcar turno como completado
      if (formData.turnoId) {
        await completarTurno(Number(formData.turnoId));
      }

      closeModal();
      fetchData();
      onConsultaCreated();
    } catch {
      showError(GENERIC_ERROR);
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass = "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

  const today = new Date();
  const isToday = (day: number) =>
    day === today.getDate() && month === today.getMonth() && year === today.getFullYear();

  if (loading) {
    return (
      <div className="bg-slate-800 rounded-xl border border-slate-700 p-6">
        <p className="text-slate-400 text-center">Cargando calendario...</p>
      </div>
    );
  }

  return (
    <>
      <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
        {/* Header del calendario */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold">
              {MESES[month]} {year}
            </h2>
            {miMedico && (
              <span className="text-sm text-slate-400">
                Dr/a. {miMedico.nombre} {miMedico.apellido}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button onClick={goToToday} className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg transition">
              Hoy
            </button>
            <button onClick={prevMonth} className="p-2 hover:bg-slate-700 rounded-lg transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button onClick={nextMonth} className="p-2 hover:bg-slate-700 rounded-lg transition">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Días de la semana */}
        <div className="grid grid-cols-7 border-b border-slate-700">
          {DIAS_SEMANA.map(dia => (
            <div key={dia} className="py-3 text-center text-sm font-medium text-slate-400">
              {dia}
            </div>
          ))}
        </div>

        {/* Días del mes */}
        <div className="grid grid-cols-7">
          {calendarDays.map((day, index) => {
            const turnosDelDia = day ? getTurnosForDay(day) : [];

            return (
              <div
                key={index}
                className={`min-h-[120px] border-b border-r border-slate-700 p-2 ${day === null ? 'bg-slate-800/50' : 'bg-slate-800'
                  }`}
              >
                {day !== null && (
                  <>
                    <div className={`text-sm font-medium mb-1 w-7 h-7 flex items-center justify-center rounded-full ${isToday(day) ? 'bg-blue-600 text-white' : 'text-slate-300'
                      }`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {turnosDelDia.slice(0, 3).map(turno => (
                        <button
                          key={turno.id}
                          onClick={() => handleTurnoClick(turno)}
                          disabled={turno.estado.toUpperCase() === 'COMPLETADO' || turno.estado.toUpperCase() === 'CANCELADO'}
                          className={`w-full text-left px-2 py-1 rounded text-xs border truncate transition ${getEstadoColor(turno.estado)} ${turno.estado.toUpperCase() !== 'COMPLETADO' && turno.estado.toUpperCase() !== 'CANCELADO'
                              ? 'hover:opacity-80 cursor-pointer'
                              : 'opacity-60 cursor-not-allowed'
                            }`}
                          title={`${turno.paciente} - ${turno.horaInicio.substring(0, 5)} (${turno.estado})`}
                        >
                          <span className="font-medium">{turno.horaInicio.substring(0, 5)}</span>
                          <span className="ml-1">{turno.paciente.split(' ')[0]}</span>
                        </button>
                      ))}
                      {turnosDelDia.length > 3 && (
                        <div className="text-xs text-slate-500 pl-2">
                          +{turnosDelDia.length - 3} más
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>

        {/* Leyenda */}
        <div className="px-6 py-3 border-t border-slate-700 flex items-center gap-4 text-xs">
          <span className="text-slate-400">Leyenda:</span>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-amber-500/40"></div>
            <span className="text-slate-400">Pendiente</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500/40"></div>
            <span className="text-slate-400">Confirmado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-emerald-500/40"></div>
            <span className="text-slate-400">Completado</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500/40"></div>
            <span className="text-slate-400">Cancelado</span>
          </div>
        </div>
      </div>

      {/* Modal para crear consulta */}
      {selectedTurno && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-slate-800 rounded-xl border border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
              <div>
                <h2 className="text-lg font-semibold">Registrar Consulta</h2>
                <p className="text-sm text-slate-400 mt-0.5">
                  Turno: {selectedTurno.paciente} - {new Date(selectedTurno.fecha).toLocaleDateString()} {selectedTurno.horaInicio.substring(0, 5)}
                </p>
              </div>
              <button onClick={closeModal} className="p-2 hover:bg-slate-700 rounded-lg transition">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Info del turno */}
              <div className="bg-slate-700/30 rounded-lg p-4 border border-slate-600">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-slate-400">Paciente:</span>
                    <span className="ml-2 text-white">{selectedTurno.paciente}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Fecha:</span>
                    <span className="ml-2 text-white">{new Date(selectedTurno.fecha).toLocaleDateString()}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Hora:</span>
                    <span className="ml-2 text-white">{selectedTurno.horaInicio.substring(0, 5)} - {selectedTurno.horaFin.substring(0, 5)}</span>
                  </div>
                  <div>
                    <span className="text-slate-400">Estado:</span>
                    <span className={`ml-2 px-2 py-0.5 rounded text-xs ${getEstadoColor(selectedTurno.estado)}`}>
                      {selectedTurno.estado}
                    </span>
                  </div>
                </div>
              </div>

              {/* Historia clínica */}
              {!formData.historiaClinicaId && (
                <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                  <p className="text-sm text-amber-400">
                    ⚠️ No se encontró una historia clínica para este paciente.
                    Debe crear una historia clínica primero.
                  </p>
                </div>
              )}

              {/* Campos del formulario */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm text-slate-400 mb-1">Motivo de consulta *</label>
                  <input
                    name="motivoConsulta"
                    value={formData.motivoConsulta}
                    onChange={handleChange}
                    placeholder="¿Por qué consulta el paciente?"
                    className={inputClass}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Diagnóstico</label>
                  <textarea
                    name="diagnostico"
                    value={formData.diagnostico}
                    onChange={handleChange}
                    placeholder="Diagnóstico del paciente"
                    rows={3}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Tratamiento</label>
                  <textarea
                    name="tratamiento"
                    value={formData.tratamiento}
                    onChange={handleChange}
                    placeholder="Tratamiento indicado"
                    rows={3}
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="block text-sm text-slate-400 mb-1">Observaciones</label>
                  <textarea
                    name="observaciones"
                    value={formData.observaciones}
                    onChange={handleChange}
                    placeholder="Observaciones adicionales"
                    rows={2}
                    className={inputClass}
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submitting || !formData.historiaClinicaId}
                  className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-600 disabled:cursor-not-allowed text-white font-medium rounded-lg transition"
                >
                  {submitting ? 'Guardando...' : 'Registrar Consulta'}
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  className="px-4 py-2.5 bg-slate-600 hover:bg-slate-500 text-white font-medium rounded-lg transition"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default CalendarioMedico;
