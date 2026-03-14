import { useEffect, useState, useMemo } from 'react';
import NavBar from '../navBar/navBar';
import Popup from '../popup/Popup';
import CalendarioMedico from './CalendarioMedico';
import type { Consulta, ConsultaForm, EstudioMedico, EstudioMedicoForm } from './types';
import type { Medico } from '../medicos/types';
import type { Turno } from '../turnos/types';
import type { HistoriaClinica } from '../historias-clinicas/types';
import type { PopupState } from '../popup/types';
import { METHODS, ENDPOINTS, GENERIC_ERROR } from '../../constants';
import { authFetch } from '../../utils/authFetch';
import { parseApiError } from '../../utils/parseApiError';
import { getUserRole, getEmail } from '../../utils/isTokenValid';
import type { Paciente } from '../pacientes/types';

type ViewMode = 'lista' | 'calendario' | 'turnos';

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

const INITIAL_ESTUDIO: EstudioMedicoForm = {
  tipoEstudio: '',
  resultado: '',
  archivoAdjuntoURL: '',
  fechaEstudio: '',
};

const Consultas = () => {
  const role = getUserRole();
  const canEdit = role !== 'Paciente';
  const isMedico = role === 'Medico';
  const [viewMode, setViewMode] = useState<ViewMode>(isMedico ? 'calendario' : 'lista');

  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [historias, setHistorias] = useState<{ id: number; paciente: string }[]>([]);
  const [formData, setFormData] = useState<ConsultaForm>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [popup, setPopup] = useState<PopupState | null>(null);
  const [medicoOpen, setMedicoOpen] = useState(false);
  const [historiaOpen, setHistoriaOpen] = useState(false);
  const [turnoOpen, setTurnoOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);

  // Estudios medicos state
  const [expandedConsultaId, setExpandedConsultaId] = useState<number | null>(null);
  const [estudios, setEstudios] = useState<EstudioMedico[]>([]);
  const [estudioForm, setEstudioForm] = useState<EstudioMedicoForm>(INITIAL_ESTUDIO);
  const [editingEstudioId, setEditingEstudioId] = useState<number | null>(null);
  const [showEstudioForm, setShowEstudioForm] = useState(false);
  const [deleteEstudioId, setDeleteEstudioId] = useState<number | null>(null);
  const [loadingEstudios, setLoadingEstudios] = useState(false);

  // Estado para filtro de turnos por fecha
  const [filtroFechaTurnos, setFiltroFechaTurnos] = useState(() => new Date().toISOString().split('T')[0]);
  const [turnosPorFecha, setTurnosPorFecha] = useState<Turno[]>([]);
  const [loadingTurnos, setLoadingTurnos] = useState(false);

  // Ordenar consultas: primero las del día actual, luego por fecha descendente
  const consultasOrdenadas = useMemo(() => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);
    const hoyStr = hoy.toISOString().split('T')[0];

    return [...consultas].sort((a, b) => {
      const fechaA = a.fechaConsulta.split('T')[0];
      const fechaB = b.fechaConsulta.split('T')[0];
      const esHoyA = fechaA === hoyStr;
      const esHoyB = fechaB === hoyStr;

      // Primero las del día actual
      if (esHoyA && !esHoyB) return -1;
      if (!esHoyA && esHoyB) return 1;

      // Luego ordenar por fecha descendente (más recientes primero)
      return new Date(b.fechaConsulta).getTime() - new Date(a.fechaConsulta).getTime();
    });
  }, [consultas]);

  const showError = (message: string) => {
    setPopup({ title: 'Error', message, variant: 'danger' });
  };

  // Cargar turnos por fecha desde el endpoint
  const fetchTurnosPorFecha = async (fecha: string) => {
    setLoadingTurnos(true);
    try {
      const res = await authFetch({
        endpoint: `${ENDPOINTS.TURNO}/${fecha}`,
        method: METHODS.GET
      });
      if (res.ok) {
        const data: Turno[] = await res.json();
        // Filtrar solo los turnos del médico logueado
        const email = getEmail();
        const miMedico = medicos.find(m => m.email.toLowerCase() === email?.toLowerCase());
        if (miMedico) {
          const misTurnos = data.filter(t => Number(t.medicoId) === Number(miMedico.id));
          setTurnosPorFecha(misTurnos.sort((a, b) => a.horaInicio.localeCompare(b.horaInicio)));
        } else {
          setTurnosPorFecha([]);
        }
      } else {
        setTurnosPorFecha([]);
      }
    } catch {
      showError('Error al cargar turnos');
      setTurnosPorFecha([]);
    } finally {
      setLoadingTurnos(false);
    }
  };

  // Cargar turnos cuando cambia la fecha o los médicos
  useEffect(() => {
    if (isMedico && viewMode === 'turnos' && medicos.length > 0) {
      fetchTurnosPorFecha(filtroFechaTurnos);
    }
  }, [filtroFechaTurnos, medicos, viewMode, isMedico]);

  const fetchData = async () => {
    try {
      const [consultasRes, historiasRes] = await Promise.all([
        authFetch({ endpoint: ENDPOINTS.CONSULTA, method: METHODS.GET }),
        authFetch({ endpoint: ENDPOINTS.HISTORIA_CLINICA, method: METHODS.GET }),
      ]);
      const allConsultas: Consulta[] = await consultasRes.json();
      const allHistorias: HistoriaClinica[] = await historiasRes.json();

      if (canEdit) {
        const [medicosRes, turnosRes] = await Promise.all([
          authFetch({ endpoint: ENDPOINTS.MEDICO, method: METHODS.GET }),
          authFetch({ endpoint: ENDPOINTS.TURNO, method: METHODS.GET }),
        ]);
        setMedicos(await medicosRes.json());
        setTurnos(await turnosRes.json());
        setConsultas(allConsultas);
        setHistorias(allHistorias.map(h => ({ id: h.id, paciente: h.paciente })));
      } else {
        // Paciente: filtrar solo sus consultas
        const email = getEmail();
        const pacientesRes = await authFetch({ endpoint: ENDPOINTS.PACIENTE, method: METHODS.GET });
        const allPacientes: Paciente[] = await pacientesRes.json();
        const miPaciente = allPacientes.find(p => p.email.toLowerCase() === email?.toLowerCase());
        if (miPaciente) {
          const miHistoria = allHistorias.find(h => h.paciente === `${miPaciente.nombre} ${miPaciente.apellido}`);
          if (miHistoria) {
            const misConsultaIds = new Set(miHistoria.consultas.map(c => c.id));
            setConsultas(allConsultas.filter(c => misConsultaIds.has(c.id)));
          } else {
            setConsultas([]);
          }
        } else {
          setConsultas([]);
        }
      }
    } catch {
      showError(GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const fetchEstudios = async () => {
    setLoadingEstudios(true);
    try {
      const res = await authFetch({ endpoint: ENDPOINTS.ESTUDIO_MEDICO, method: METHODS.GET });
      setEstudios(await res.json());
    } catch {
      showError(GENERIC_ERROR);
    } finally {
      setLoadingEstudios(false);
    }
  };

  useEffect(() => {
    fetchData();
    fetchEstudios();
  }, []);

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setEditingId(null);
    setShowForm(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const closeDropdowns = () => {
    setMedicoOpen(false);
    setHistoriaOpen(false);
    setTurnoOpen(false);
  };

  const availableTurnos = turnos.filter(t => {
    const estado = t.estado.toUpperCase();
    return estado !== 'COMPLETADO' && estado !== 'CANCELADO';
  });

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
      // silently fail — turno update is secondary
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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

      const res = editingId
        ? await authFetch({
          endpoint: ENDPOINTS.CONSULTA,
          method: METHODS.PUT,
          body: JSON.stringify({ id: editingId, ...body, fechaRegistro: new Date().toISOString() }),
        })
        : await authFetch({
          endpoint: ENDPOINTS.CONSULTA,
          method: METHODS.POST,
          body: JSON.stringify(body),
        });

      if (!res.ok) {
        const errorMsg = await parseApiError(res);
        showError(errorMsg);
        return;
      }

      // Si se creo una consulta nueva con turno asociado, marcar turno como Completado
      if (!editingId && formData.turnoId) {
        await completarTurno(Number(formData.turnoId));
      }

      resetForm();
      fetchData();
    } catch {
      showError(GENERIC_ERROR);
    }
  };

  const handleEdit = (c: Consulta) => {
    setEditingId(c.id);
    setFormData({
      historiaClinicaId: '',
      medicoId: '',
      turnoId: '',
      fechaConsulta: c.fechaConsulta.split('T')[0],
      motivoConsulta: c.motivoConsulta,
      diagnostico: c.diagnostico,
      tratamiento: c.tratamiento,
      observaciones: c.observaciones,
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await authFetch({ endpoint: `${ENDPOINTS.CONSULTA}/${deleteId}`, method: METHODS.DELETE });
      if (!res.ok) {
        const errorMsg = await parseApiError(res);
        showError(errorMsg);
      } else {
        if (expandedConsultaId === deleteId) setExpandedConsultaId(null);
        fetchData();
      }
    } catch {
      showError(GENERIC_ERROR);
    } finally {
      setDeleteId(null);
    }
  };

  // Estudios medicos handlers
  const getEstudiosForConsulta = (consultaId: number) =>
    estudios.filter(e => e.consultaId === consultaId);

  const resetEstudioForm = () => {
    setEstudioForm(INITIAL_ESTUDIO);
    setEditingEstudioId(null);
    setShowEstudioForm(false);
  };

  const handleEstudioChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEstudioForm({ ...estudioForm, [e.target.name]: e.target.value });
  };

  const handleEstudioSubmit = async (consultaId: number) => {
    try {
      const body = {
        consultaId,
        tipoEstudio: estudioForm.tipoEstudio,
        resultado: estudioForm.resultado,
        archivoAdjuntoURL: estudioForm.archivoAdjuntoURL,
        fechaEstudio: estudioForm.fechaEstudio,
      };

      const res = editingEstudioId
        ? await authFetch({
          endpoint: ENDPOINTS.ESTUDIO_MEDICO,
          method: METHODS.PUT,
          body: JSON.stringify({ id: editingEstudioId, ...body, visible: true }),
        })
        : await authFetch({
          endpoint: ENDPOINTS.ESTUDIO_MEDICO,
          method: METHODS.POST,
          body: JSON.stringify(body),
        });

      if (!res.ok) {
        const errorMsg = await parseApiError(res);
        showError(errorMsg);
        return;
      }

      resetEstudioForm();
      fetchEstudios();
    } catch {
      showError(GENERIC_ERROR);
    }
  };

  const handleEditEstudio = (e: EstudioMedico) => {
    setEditingEstudioId(e.id);
    setEstudioForm({
      tipoEstudio: e.tipoEstudio,
      resultado: e.resultado,
      archivoAdjuntoURL: e.archivoAdjuntoURL,
      fechaEstudio: e.fechaEstudio.split('T')[0],
    });
    setShowEstudioForm(true);
  };

  const handleDeleteEstudio = async () => {
    if (!deleteEstudioId) return;
    try {
      const res = await authFetch({ endpoint: `${ENDPOINTS.ESTUDIO_MEDICO}/${deleteEstudioId}`, method: METHODS.DELETE });
      if (!res.ok) {
        const errorMsg = await parseApiError(res);
        showError(errorMsg);
      } else {
        fetchEstudios();
      }
    } catch {
      showError(GENERIC_ERROR);
    } finally {
      setDeleteEstudioId(null);
    }
  };

  const inputClass = "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <NavBar />
      {deleteId && (
        <Popup title="Eliminar consulta" message="Seguro que deseas eliminar esta consulta?" confirmText="Eliminar" cancelText="Cancelar" variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
      )}
      {deleteEstudioId && (
        <Popup title="Eliminar estudio" message="Seguro que deseas eliminar este estudio medico?" confirmText="Eliminar" cancelText="Cancelar" variant="danger" onConfirm={handleDeleteEstudio} onCancel={() => setDeleteEstudioId(null)} />
      )}
      {popup && (
        <Popup title={popup.title} message={popup.message} confirmText="Aceptar" variant={popup.variant} showCancel={false} onConfirm={() => setPopup(null)} />
      )}
      <div className="max-w-6xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{canEdit ? 'Consultas' : 'Mis Consultas'}</h1>
          <div className="flex items-center gap-3">
            {/* Toggle de vista para médicos */}
            {isMedico && (
              <div className="flex bg-slate-700 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('calendario')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition ${viewMode === 'calendario' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Calendario
                </button>
                <button
                  onClick={() => setViewMode('turnos')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition ${viewMode === 'turnos' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Turnos
                </button>
                <button
                  onClick={() => setViewMode('lista')}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition ${viewMode === 'lista' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-white'
                    }`}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
                  </svg>
                  Consultas
                </button>
              </div>
            )}
            {canEdit && !showForm && viewMode === 'lista' && (
              <button onClick={() => { resetForm(); setShowForm(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                Nueva consulta
              </button>
            )}
          </div>
        </div>

        {/* Calendario para médicos */}
        {isMedico && viewMode === 'calendario' && (
          <div className="mb-8">
            <CalendarioMedico onConsultaCreated={fetchData} showError={showError} />
          </div>
        )}

        {/* Vista de turnos por día para médicos */}
        {isMedico && viewMode === 'turnos' && (
          <div className="mb-8">
            <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
              {/* Header con filtro de fecha */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-700">
                <h2 className="text-lg font-semibold">Mis Turnos del Día</h2>
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      const fecha = new Date(filtroFechaTurnos);
                      fecha.setDate(fecha.getDate() - 1);
                      setFiltroFechaTurnos(fecha.toISOString().split('T')[0]);
                    }}
                    className="p-2 hover:bg-slate-700 rounded-lg transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                    </svg>
                  </button>
                  <input
                    type="date"
                    value={filtroFechaTurnos}
                    onChange={(e) => setFiltroFechaTurnos(e.target.value)}
                    className="px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    onClick={() => {
                      const fecha = new Date(filtroFechaTurnos);
                      fecha.setDate(fecha.getDate() + 1);
                      setFiltroFechaTurnos(fecha.toISOString().split('T')[0]);
                    }}
                    className="p-2 hover:bg-slate-700 rounded-lg transition"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setFiltroFechaTurnos(new Date().toISOString().split('T')[0])}
                    className="px-3 py-1.5 text-sm bg-slate-700 hover:bg-slate-600 rounded-lg transition"
                  >
                    Hoy
                  </button>
                </div>
              </div>

              {/* Lista de turnos */}
              <div className="p-4">
                {loadingTurnos ? (
                  <p className="text-slate-400 text-center py-8">Cargando turnos...</p>
                ) : turnosPorFecha.length === 0 ? (
                  <p className="text-slate-400 text-center py-8">No hay turnos para esta fecha</p>
                ) : (
                  <div className="space-y-3">
                    {turnosPorFecha.map(turno => {
                      const estadoUpper = turno.estado.toUpperCase();
                      const getEstadoStyle = () => {
                        switch (estadoUpper) {
                          case 'PENDIENTE': return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
                          case 'CONFIRMADO': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
                          case 'COMPLETADO': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
                          case 'CANCELADO': return 'bg-red-500/20 text-red-400 border-red-500/30';
                          default: return 'bg-slate-500/20 text-slate-400 border-slate-500/30';
                        }
                      };
                      const puedeCrearConsulta = estadoUpper !== 'COMPLETADO' && estadoUpper !== 'CANCELADO';

                      return (
                        <div key={turno.id} className="bg-slate-700/40 rounded-xl p-4 border border-slate-600">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                              <div className="text-center min-w-[60px]">
                                <p className="text-2xl font-bold text-white">{turno.horaInicio.substring(0, 5)}</p>
                                <p className="text-xs text-slate-400">a {turno.horaFin.substring(0, 5)}</p>
                              </div>
                              <div className="border-l border-slate-600 pl-4">
                                <p className="font-semibold text-white">{turno.paciente}</p>
                                <div className="flex items-center gap-2 mt-1">
                                  <span className={`px-2 py-0.5 rounded text-xs border ${getEstadoStyle()}`}>
                                    {turno.estado}
                                  </span>
                                  {turno.observaciones && (
                                    <span className="text-xs text-slate-400 truncate max-w-[200px]" title={turno.observaciones}>
                                      {turno.observaciones}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            {puedeCrearConsulta && (
                              <button
                                onClick={() => setViewMode('calendario')}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium rounded-lg transition"
                              >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                </svg>
                                Crear consulta
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Resumen */}
              <div className="px-6 py-3 border-t border-slate-700 flex items-center gap-6 text-sm">
                <span className="text-slate-400">Total: <span className="text-white font-medium">{turnosPorFecha.length}</span> turnos</span>
                <span className="text-slate-400">Pendientes: <span className="text-amber-400 font-medium">{turnosPorFecha.filter(t => t.estado.toUpperCase() === 'PENDIENTE').length}</span></span>
                <span className="text-slate-400">Confirmados: <span className="text-blue-400 font-medium">{turnosPorFecha.filter(t => t.estado.toUpperCase() === 'CONFIRMADO').length}</span></span>
                <span className="text-slate-400">Completados: <span className="text-emerald-400 font-medium">{turnosPorFecha.filter(t => t.estado.toUpperCase() === 'COMPLETADO').length}</span></span>
              </div>
            </div>
          </div>
        )}

        {/* Formulario colapsable */}
        {canEdit && showForm && viewMode === 'lista' && (
          <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl p-6 mb-8 border border-slate-700">
            <h2 className="text-lg font-semibold mb-4">{editingId ? 'Editar consulta' : 'Registrar consulta'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              {/* Historia Clinica dropdown */}
              <div className="relative">
                <label className="block text-sm text-slate-400 mb-1">Paciente (Historia Clinica)</label>
                <button type="button" onClick={() => { closeDropdowns(); setHistoriaOpen(!historiaOpen); }}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-left text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {formData.historiaClinicaId ? historias.find(h => h.id === formData.historiaClinicaId)?.paciente : <span className="text-slate-500">Seleccionar paciente</span>}
                </button>
                {historiaOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                    {historias.map(h => (
                      <button key={h.id} type="button" onClick={() => { setFormData({ ...formData, historiaClinicaId: h.id }); setHistoriaOpen(false); }}
                        className={`w-full px-4 py-2.5 text-left text-sm transition ${formData.historiaClinicaId === h.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                        {h.paciente}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Medico dropdown */}
              <div className="relative">
                <label className="block text-sm text-slate-400 mb-1">Medico</label>
                <button type="button" onClick={() => { closeDropdowns(); setMedicoOpen(!medicoOpen); }}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-left text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {formData.medicoId ? medicos.find(m => m.id === formData.medicoId)?.nombre + ' ' + medicos.find(m => m.id === formData.medicoId)?.apellido : <span className="text-slate-500">Seleccionar medico</span>}
                </button>
                {medicoOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                    {medicos.map(m => (
                      <button key={m.id} type="button" onClick={() => { setFormData({ ...formData, medicoId: m.id }); setMedicoOpen(false); }}
                        className={`w-full px-4 py-2.5 text-left text-sm transition ${formData.medicoId === m.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                        {m.nombre} {m.apellido} - {m.especialidad}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Turno dropdown */}
              <div className="relative">
                <label className="block text-sm text-slate-400 mb-1">Turno asociado (opcional)</label>
                <button type="button" onClick={() => { closeDropdowns(); setTurnoOpen(!turnoOpen); }}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-left text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {formData.turnoId ? (() => { const t = availableTurnos.find(t => t.id === formData.turnoId); return t ? `${t.paciente} - ${new Date(t.fecha).toLocaleDateString()}` : 'Turno'; })() : <span className="text-slate-500">Sin turno asociado</span>}
                </button>
                {turnoOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                    <button type="button" onClick={() => { setFormData({ ...formData, turnoId: '' }); setTurnoOpen(false); }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition ${!formData.turnoId ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                      Sin turno
                    </button>
                    {availableTurnos.map(t => (
                      <button key={t.id} type="button" onClick={() => { setFormData({ ...formData, turnoId: t.id }); setTurnoOpen(false); }}
                        className={`w-full px-4 py-2.5 text-left text-sm transition ${formData.turnoId === t.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                        {t.paciente} - {new Date(t.fecha).toLocaleDateString()} ({t.horaInicio.substring(0, 5)}) · {t.estado}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Fecha de consulta</label>
                <input name="fechaConsulta" type="date" value={formData.fechaConsulta} onChange={handleChange} className={inputClass} />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-slate-400 mb-1">Motivo de consulta</label>
                <input name="motivoConsulta" value={formData.motivoConsulta} onChange={handleChange} placeholder="Motivo de la consulta" className={inputClass} />
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm text-slate-400 mb-1">Diagnostico</label>
                <textarea name="diagnostico" value={formData.diagnostico} onChange={handleChange} placeholder="Diagnostico del paciente" rows={2} className={inputClass} />
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm text-slate-400 mb-1">Tratamiento</label>
                <textarea name="tratamiento" value={formData.tratamiento} onChange={handleChange} placeholder="Tratamiento indicado" rows={2} className={inputClass} />
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm text-slate-400 mb-1">Observaciones</label>
                <textarea name="observaciones" value={formData.observaciones} onChange={handleChange} placeholder="Observaciones adicionales" rows={2} className={inputClass} />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition">
                {editingId ? 'Actualizar' : 'Registrar'}
              </button>
              <button type="button" onClick={resetForm} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white font-medium rounded-lg transition">Cancelar</button>
            </div>
          </form>
        )}

        {/* Lista de consultas como cards expandibles */}
        {viewMode === 'lista' && (loading ? (
          <p className="text-slate-400 text-center">Cargando...</p>
        ) : consultas.length === 0 ? (
          <p className="text-slate-400 text-center">No hay consultas registradas</p>
        ) : (
          <div className="space-y-3">
            {consultasOrdenadas.map(c => {
              const consultaEstudios = getEstudiosForConsulta(c.id);
              const isExpanded = expandedConsultaId === c.id;

              return (
                <div key={c.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                  {/* Header de consulta */}
                  <div className="flex items-center justify-between px-5 py-4">
                    <div className="flex items-center gap-4 cursor-pointer flex-1" onClick={() => { setExpandedConsultaId(isExpanded ? null : c.id); resetEstudioForm(); }}>
                      <div className="w-10 h-10 rounded-full bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm">{c.motivoConsulta}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-slate-400">{new Date(c.fechaConsulta).toLocaleDateString()}</span>
                          {consultaEstudios.length > 0 && (
                            <span className="text-xs text-emerald-400">{consultaEstudios.length} estudio{consultaEstudios.length !== 1 ? 's' : ''}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {canEdit && (
                        <>
                          <button onClick={() => handleEdit(c)} className="p-2 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition" title="Editar">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button onClick={() => setDeleteId(c.id)} className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition" title="Eliminar">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </>
                      )}
                      <svg className={`w-5 h-5 text-slate-400 transition-transform ml-1 cursor-pointer ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" onClick={() => { setExpandedConsultaId(isExpanded ? null : c.id); resetEstudioForm(); }}>
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Detalle expandido */}
                  {isExpanded && (
                    <div className="border-t border-slate-700 px-5 py-4 space-y-5">
                      {/* Info de la consulta */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Diagnostico</p>
                          <p className="text-sm text-slate-300">{c.diagnostico || 'Sin diagnostico'}</p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Tratamiento</p>
                          <p className="text-sm text-slate-300">{c.tratamiento || 'Sin tratamiento'}</p>
                        </div>
                        {c.observaciones && (
                          <div className="md:col-span-2">
                            <p className="text-xs text-slate-500 mb-1">Observaciones</p>
                            <p className="text-sm text-slate-300">{c.observaciones}</p>
                          </div>
                        )}
                      </div>

                      {/* Estudios medicos */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                            Estudios medicos
                          </h3>
                          {canEdit && !showEstudioForm && (
                            <button onClick={() => { resetEstudioForm(); setShowEstudioForm(true); }} className="text-xs px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition flex items-center gap-1">
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                              Agregar estudio
                            </button>
                          )}
                        </div>

                        {/* Form de estudio inline */}
                        {showEstudioForm && (
                          <div className="bg-slate-700/30 rounded-lg p-4 mb-3 border border-slate-600">
                            <h4 className="text-sm font-medium mb-3">{editingEstudioId ? 'Editar estudio' : 'Nuevo estudio medico'}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                              <div>
                                <label className="block text-xs text-slate-400 mb-1">Tipo de estudio</label>
                                <input name="tipoEstudio" value={estudioForm.tipoEstudio} onChange={handleEstudioChange} placeholder="Ej: Laboratorio, Radiografia, Ecografia" className={inputClass} />
                              </div>
                              <div>
                                <label className="block text-xs text-slate-400 mb-1">Fecha del estudio</label>
                                <input name="fechaEstudio" type="date" value={estudioForm.fechaEstudio} onChange={handleEstudioChange} className={inputClass} />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-xs text-slate-400 mb-1">Resultado</label>
                                <textarea name="resultado" value={estudioForm.resultado} onChange={handleEstudioChange} placeholder="Resultado del estudio" rows={2} className={inputClass} />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-xs text-slate-400 mb-1">URL archivo adjunto (opcional)</label>
                                <input name="archivoAdjuntoURL" value={estudioForm.archivoAdjuntoURL} onChange={handleEstudioChange} placeholder="https://..." className={inputClass} />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button type="button" onClick={() => handleEstudioSubmit(c.id)} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-lg transition">
                                {editingEstudioId ? 'Actualizar' : 'Guardar'}
                              </button>
                              <button type="button" onClick={resetEstudioForm} className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded-lg transition">Cancelar</button>
                            </div>
                          </div>
                        )}

                        {/* Lista de estudios */}
                        {loadingEstudios ? (
                          <p className="text-xs text-slate-500">Cargando estudios...</p>
                        ) : consultaEstudios.length === 0 ? (
                          <p className="text-sm text-slate-500">Sin estudios medicos registrados</p>
                        ) : (
                          <div className="space-y-2">
                            {consultaEstudios.map(e => (
                              <div key={e.id} className="bg-slate-700/40 rounded-lg px-4 py-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/20 text-emerald-400">{e.tipoEstudio}</span>
                                      <span className="text-xs text-slate-500">{new Date(e.fechaEstudio).toLocaleDateString()}</span>
                                    </div>
                                    <p className="text-sm text-slate-300">{e.resultado}</p>
                                    {e.archivoAdjuntoURL && (
                                      <a href={e.archivoAdjuntoURL} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-400 hover:text-blue-300 mt-1 inline-flex items-center gap-1">
                                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
                                        Ver archivo adjunto
                                      </a>
                                    )}
                                  </div>
                                  {canEdit && (
                                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                      <button onClick={() => handleEditEstudio(e)} className="p-1.5 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition" title="Editar">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                      </button>
                                      <button onClick={() => setDeleteEstudioId(e.id)} className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition" title="Eliminar">
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Consultas;
