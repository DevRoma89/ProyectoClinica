import { useEffect, useState } from 'react';
import NavBar from '../navBar/navBar';
import Popup from '../popup/Popup';
import type { HistoriaClinica, AntecedenteMedico } from './types';
import type { PopupState } from '../popup/types';
import { METHODS, ENDPOINTS, GENERIC_ERROR } from '../../constants';
import { authFetch } from '../../utils/authFetch';
import { parseApiError } from '../../utils/parseApiError';
import { getUserRole, getEmail } from '../../utils/isTokenValid';
import type { Paciente } from '../pacientes/types';

interface AntecedenteForm {
  tipo: string;
  descripcion: string;
}

const INITIAL_ANTECEDENTE: AntecedenteForm = { tipo: '', descripcion: '' };

const TIPOS_ANTECEDENTE = [
  'Alergia',
  'Enfermedad cronica',
  'Cirugia previa',
  'Medicacion habitual',
  'Antecedente familiar',
  'Otro',
];

const HistoriasClinicas = () => {
  const role = getUserRole();
  const canEdit = role !== 'Paciente';

  const [historias, setHistorias] = useState<HistoriaClinica[]>([]);
  const [loading, setLoading] = useState(true);
  const [popup, setPopup] = useState<PopupState | null>(null);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [editingObsId, setEditingObsId] = useState<number | null>(null);
  const [observaciones, setObservaciones] = useState('');
  const [deleteId, setDeleteId] = useState<number | null>(null);

  // Antecedentes state
  const [antecedenteForm, setAntecedenteForm] = useState<AntecedenteForm>(INITIAL_ANTECEDENTE);
  const [editingAntecedenteId, setEditingAntecedenteId] = useState<number | null>(null);
  const [showAntecedenteForm, setShowAntecedenteForm] = useState<number | null>(null); // historiaId where form is shown
  const [deleteAntecedenteId, setDeleteAntecedenteId] = useState<number | null>(null);
  const [tipoOpen, setTipoOpen] = useState(false);

  const showError = (message: string) => {
    setPopup({ title: 'Error', message, variant: 'danger' });
  };

  const fetchData = async () => {
    try {
      const res = await authFetch({ endpoint: ENDPOINTS.HISTORIA_CLINICA, method: METHODS.GET });
      const allHistorias: HistoriaClinica[] = await res.json();

      if (canEdit) {
        setHistorias(allHistorias);
      } else {
        // Paciente: filtrar solo su historia clinica
        const email = getEmail();
        const pacientesRes = await authFetch({ endpoint: ENDPOINTS.PACIENTE, method: METHODS.GET });
        const allPacientes: Paciente[] = await pacientesRes.json();
        const miPaciente = allPacientes.find(p => p.email.toLowerCase() === email?.toLowerCase());
        if (miPaciente) {
          setHistorias(allHistorias.filter(h => h.paciente === `${miPaciente.nombre} ${miPaciente.apellido}`));
        } else {
          setHistorias([]);
        }
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

  const toggleExpand = (id: number) => {
    setExpandedId(expandedId === id ? null : id);
    resetAntecedenteForm();
  };

  // Observaciones handlers
  const handleEditObs = (h: HistoriaClinica) => {
    setEditingObsId(h.id);
    setObservaciones(h.observacionesGenerales);
  };

  const handleSaveObs = async () => {
    if (!editingObsId) return;
    try {
      const res = await authFetch({
        endpoint: ENDPOINTS.HISTORIA_CLINICA,
        method: METHODS.PUT,
        body: JSON.stringify({ id: editingObsId, observacionesGenerales: observaciones }),
      });
      if (!res.ok) {
        const errorMsg = await parseApiError(res);
        showError(errorMsg);
      } else {
        setEditingObsId(null);
        fetchData();
      }
    } catch {
      showError(GENERIC_ERROR);
    }
  };

  const handleDeleteHistoria = async () => {
    if (!deleteId) return;
    try {
      const res = await authFetch({ endpoint: `${ENDPOINTS.HISTORIA_CLINICA}/${deleteId}`, method: METHODS.DELETE });
      if (!res.ok) {
        const errorMsg = await parseApiError(res);
        showError(errorMsg);
      } else {
        if (expandedId === deleteId) setExpandedId(null);
        fetchData();
      }
    } catch {
      showError(GENERIC_ERROR);
    } finally {
      setDeleteId(null);
    }
  };

  // Antecedentes handlers
  const resetAntecedenteForm = () => {
    setAntecedenteForm(INITIAL_ANTECEDENTE);
    setEditingAntecedenteId(null);
    setShowAntecedenteForm(null);
    setTipoOpen(false);
  };

  const handleAntecedenteSubmit = async (historiaClinicaId: number) => {
    try {
      const res = editingAntecedenteId
        ? await authFetch({
            endpoint: ENDPOINTS.ANTECEDENTE_MEDICO,
            method: METHODS.PUT,
            body: JSON.stringify({
              id: editingAntecedenteId,
              tipo: antecedenteForm.tipo,
              descripcion: antecedenteForm.descripcion,
              fechaRegistro: new Date().toISOString(),
            }),
          })
        : await authFetch({
            endpoint: ENDPOINTS.ANTECEDENTE_MEDICO,
            method: METHODS.POST,
            body: JSON.stringify({
              historiaClinicaId,
              tipo: antecedenteForm.tipo,
              descripcion: antecedenteForm.descripcion,
            }),
          });

      if (!res.ok) {
        const errorMsg = await parseApiError(res);
        showError(errorMsg);
        return;
      }

      resetAntecedenteForm();
      fetchData();
    } catch {
      showError(GENERIC_ERROR);
    }
  };

  const handleEditAntecedente = (a: AntecedenteMedico, historiaId: number) => {
    setEditingAntecedenteId(a.id);
    setAntecedenteForm({ tipo: a.tipo, descripcion: a.descripcion });
    setShowAntecedenteForm(historiaId);
  };

  const handleDeleteAntecedente = async () => {
    if (!deleteAntecedenteId) return;
    try {
      const res = await authFetch({ endpoint: `${ENDPOINTS.ANTECEDENTE_MEDICO}/${deleteAntecedenteId}`, method: METHODS.DELETE });
      if (!res.ok) {
        const errorMsg = await parseApiError(res);
        showError(errorMsg);
      } else {
        fetchData();
      }
    } catch {
      showError(GENERIC_ERROR);
    } finally {
      setDeleteAntecedenteId(null);
    }
  };

  const inputClass = "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <NavBar />
      {deleteId && (
        <Popup title="Eliminar historia clinica" message="Se eliminara la historia clinica y todos sus datos asociados. Esta seguro?" confirmText="Eliminar" cancelText="Cancelar" variant="danger" onConfirm={handleDeleteHistoria} onCancel={() => setDeleteId(null)} />
      )}
      {deleteAntecedenteId && (
        <Popup title="Eliminar antecedente" message="Seguro que deseas eliminar este antecedente medico?" confirmText="Eliminar" cancelText="Cancelar" variant="danger" onConfirm={handleDeleteAntecedente} onCancel={() => setDeleteAntecedenteId(null)} />
      )}
      {popup && (
        <Popup title={popup.title} message={popup.message} confirmText="Aceptar" variant={popup.variant} showCancel={false} onConfirm={() => setPopup(null)} />
      )}
      <div className="max-w-6xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{canEdit ? 'Historias Clinicas' : 'Mi Historia Clinica'}</h1>

        {loading ? (
          <p className="text-slate-400 text-center">Cargando...</p>
        ) : historias.length === 0 ? (
          <p className="text-slate-400 text-center">No hay historias clinicas registradas</p>
        ) : (
          <div className="space-y-4">
            {historias.map(h => (
              <div key={h.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 cursor-pointer hover:bg-slate-700/30 transition" onClick={() => toggleExpand(h.id)}>
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-full bg-cyan-500/20 flex items-center justify-center">
                      <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                    </div>
                    <div>
                      <p className="font-semibold">{h.paciente}</p>
                      <p className="text-sm text-slate-400">Creada: {new Date(h.fechaCreacion).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2">
                      {h.consultas.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-rose-500/20 text-rose-400">
                          {h.consultas.length} consulta{h.consultas.length !== 1 ? 's' : ''}
                        </span>
                      )}
                      {h.antecedentesMedicos.length > 0 && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-violet-500/20 text-violet-400">
                          {h.antecedentesMedicos.length} antecedente{h.antecedentesMedicos.length !== 1 ? 's' : ''}
                        </span>
                      )}
                    </div>
                    <svg className={`w-5 h-5 text-slate-400 transition-transform ${expandedId === h.id ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {/* Contenido expandido */}
                {expandedId === h.id && (
                  <div className="border-t border-slate-700">
                    {/* Observaciones generales */}
                    <div className="px-6 py-4 border-b border-slate-700/50">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-sm font-medium text-slate-400">Observaciones generales</h3>
                        <div className="flex gap-2">
                          {canEdit && (editingObsId === h.id ? (
                            <>
                              <button onClick={handleSaveObs} className="text-xs px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded-lg transition">Guardar</button>
                              <button onClick={() => setEditingObsId(null)} className="text-xs px-3 py-1 bg-slate-600 hover:bg-slate-500 rounded-lg transition">Cancelar</button>
                            </>
                          ) : (
                            <>
                              <button onClick={() => handleEditObs(h)} className="text-xs px-3 py-1 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition">Editar</button>
                              <button onClick={(e) => { e.stopPropagation(); setDeleteId(h.id); }} className="text-xs px-3 py-1 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition">Eliminar HC</button>
                            </>
                          ))}
                        </div>
                      </div>
                      {editingObsId === h.id ? (
                        <textarea value={observaciones} onChange={e => setObservaciones(e.target.value)} rows={3} className={inputClass} placeholder="Observaciones generales del paciente" />
                      ) : (
                        <p className="text-sm text-slate-300">{h.observacionesGenerales || 'Sin observaciones'}</p>
                      )}
                    </div>

                    {/* Antecedentes medicos */}
                    <div className="px-6 py-4 border-b border-slate-700/50">
                      <div className="flex items-center justify-between mb-3">
                        <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                          <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                          </svg>
                          Antecedentes medicos
                        </h3>
                        {canEdit && showAntecedenteForm !== h.id && (
                          <button onClick={() => { resetAntecedenteForm(); setShowAntecedenteForm(h.id); }} className="text-xs px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                            Agregar
                          </button>
                        )}
                      </div>

                      {/* Form inline para antecedente */}
                      {canEdit && showAntecedenteForm === h.id && (
                        <div className="bg-slate-700/30 rounded-lg p-4 mb-3 border border-slate-600">
                          <h4 className="text-sm font-medium mb-3">{editingAntecedenteId ? 'Editar antecedente' : 'Nuevo antecedente medico'}</h4>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                            {/* Tipo dropdown */}
                            <div className="relative">
                              <label className="block text-xs text-slate-400 mb-1">Tipo</label>
                              <button type="button" onClick={() => setTipoOpen(!tipoOpen)}
                                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-left text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500">
                                {antecedenteForm.tipo || <span className="text-slate-500">Seleccionar tipo</span>}
                              </button>
                              {tipoOpen && (
                                <div className="absolute z-20 mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
                                  {TIPOS_ANTECEDENTE.map(t => (
                                    <button key={t} type="button" onClick={() => { setAntecedenteForm({ ...antecedenteForm, tipo: t }); setTipoOpen(false); }}
                                      className={`w-full px-4 py-2.5 text-left text-sm transition ${antecedenteForm.tipo === t ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                                      {t}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div>
                              <label className="block text-xs text-slate-400 mb-1">Descripcion</label>
                              <input value={antecedenteForm.descripcion} onChange={e => setAntecedenteForm({ ...antecedenteForm, descripcion: e.target.value })} placeholder="Descripcion del antecedente" className={inputClass} />
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <button type="button" onClick={() => handleAntecedenteSubmit(h.id)} className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition">
                              {editingAntecedenteId ? 'Actualizar' : 'Guardar'}
                            </button>
                            <button type="button" onClick={resetAntecedenteForm} className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded-lg transition">Cancelar</button>
                          </div>
                        </div>
                      )}

                      {/* Lista de antecedentes */}
                      {h.antecedentesMedicos.length === 0 ? (
                        <p className="text-sm text-slate-500">Sin antecedentes registrados</p>
                      ) : (
                        <div className="space-y-2">
                          {h.antecedentesMedicos.map(a => (
                            <div key={a.id} className="bg-slate-700/40 rounded-lg px-4 py-3">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-violet-500/20 text-violet-400">{a.tipo}</span>
                                    <span className="text-xs text-slate-500">{new Date(a.fechaRegistro).toLocaleDateString()}</span>
                                  </div>
                                  <p className="text-sm text-slate-300">{a.descripcion}</p>
                                </div>
                                {canEdit && (
                                  <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                    <button onClick={() => handleEditAntecedente(a, h.id)} className="p-1.5 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition" title="Editar">
                                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                                    </button>
                                    <button onClick={() => setDeleteAntecedenteId(a.id)} className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition" title="Eliminar">
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

                    {/* Consultas del paciente */}
                    <div className="px-6 py-4">
                      <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2 mb-3">
                        <svg className="w-4 h-4 text-rose-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        Historial de consultas
                      </h3>
                      {h.consultas.length === 0 ? (
                        <p className="text-sm text-slate-500">Sin consultas registradas</p>
                      ) : (
                        <div className="space-y-2">
                          {h.consultas.map(c => (
                            <div key={c.id} className="bg-slate-700/40 rounded-lg px-4 py-3">
                              <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs text-slate-500">{new Date(c.fechaConsulta).toLocaleDateString()}</span>
                                <span className="text-sm font-medium">{c.motivoConsulta}</span>
                              </div>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                <div>
                                  <p className="text-xs text-slate-500">Diagnostico</p>
                                  <p className="text-sm text-slate-300">{c.diagnostico || '-'}</p>
                                </div>
                                <div>
                                  <p className="text-xs text-slate-500">Tratamiento</p>
                                  <p className="text-sm text-slate-300">{c.tratamiento || '-'}</p>
                                </div>
                                {c.observaciones && (
                                  <div className="md:col-span-2">
                                    <p className="text-xs text-slate-500">Observaciones</p>
                                    <p className="text-sm text-slate-300">{c.observaciones}</p>
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
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default HistoriasClinicas;
