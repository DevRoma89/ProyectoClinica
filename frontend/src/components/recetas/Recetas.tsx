import { useEffect, useState } from 'react';
import NavBar from '../navBar/navBar';
import Popup from '../popup/Popup';
import type { Receta, RecetaForm, DetalleReceta, DetalleRecetaForm } from './types';
import type { Consulta } from '../consultas/types';
import type { PopupState } from '../popup/types';
import { METHODS, ENDPOINTS, GENERIC_ERROR } from '../../constants';
import { authFetch } from '../../utils/authFetch';
import { parseApiError } from '../../utils/parseApiError';
import { getUserRole } from '../../utils/isTokenValid';

const INITIAL_FORM: RecetaForm = {
  consultaId: '',
  fechaEmision: new Date().toISOString().split('T')[0],
  indicacionesGenerales: '',
};

const INITIAL_DETALLE: DetalleRecetaForm = {
  medicamento: '',
  dosis: '',
  frecuencia: '',
  duracion: '',
};

const Recetas = () => {
  const role = getUserRole();
  const canEdit = role !== 'Paciente';

  const [recetas, setRecetas] = useState<Receta[]>([]);
  const [consultas, setConsultas] = useState<Consulta[]>([]);
  const [formData, setFormData] = useState<RecetaForm>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [popup, setPopup] = useState<PopupState | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [consultaOpen, setConsultaOpen] = useState(false);
  const [expandedRecetaId, setExpandedRecetaId] = useState<number | null>(null);

  // Detalles state
  const [detalleForm, setDetalleForm] = useState<DetalleRecetaForm>(INITIAL_DETALLE);
  const [editingDetalleId, setEditingDetalleId] = useState<number | null>(null);
  const [showDetalleForm, setShowDetalleForm] = useState(false);
  const [deleteDetalleId, setDeleteDetalleId] = useState<number | null>(null);

  const showError = (message: string) => {
    setPopup({ title: 'Error', message, variant: 'danger' });
  };

  const fetchRecetas = async () => {
    try {
      const res = await authFetch({ endpoint: ENDPOINTS.RECETA, method: METHODS.GET });
      if (res.ok) {
        setRecetas(await res.json());
      }
    } catch {
      showError(GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const fetchConsultas = async () => {
    try {
      const res = await authFetch({ endpoint: ENDPOINTS.CONSULTA, method: METHODS.GET });
      if (res.ok) {
        setConsultas(await res.json());
      }
    } catch {
      // silently fail
    }
  };

  useEffect(() => {
    fetchRecetas();
    if (canEdit) fetchConsultas();
  }, []);

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setEditingId(null);
    setShowForm(false);
    setConsultaOpen(false);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.consultaId) {
      showError('Debe seleccionar una consulta');
      return;
    }
    try {
      const body = {
        consultaId: Number(formData.consultaId),
        fechaEmision: formData.fechaEmision,
        indicacionesGenerales: formData.indicacionesGenerales,
      };

      const res = editingId
        ? await authFetch({
          endpoint: ENDPOINTS.RECETA,
          method: METHODS.PUT,
          body: JSON.stringify({ id: editingId, ...body }),
        })
        : await authFetch({
          endpoint: ENDPOINTS.RECETA,
          method: METHODS.POST,
          body: JSON.stringify(body),
        });

      if (!res.ok) {
        showError(await parseApiError(res));
        return;
      }

      resetForm();
      fetchRecetas();
    } catch {
      showError(GENERIC_ERROR);
    }
  };

  const handleEdit = (r: Receta) => {
    setEditingId(r.id);
    setFormData({
      consultaId: r.consultaId,
      fechaEmision: r.fechaEmision.split('T')[0],
      indicacionesGenerales: r.indicacionesGenerales,
    });
    setShowForm(true);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await authFetch({ endpoint: `${ENDPOINTS.RECETA}/${deleteId}`, method: METHODS.DELETE });
      if (!res.ok) {
        showError(await parseApiError(res));
      } else {
        if (expandedRecetaId === deleteId) setExpandedRecetaId(null);
        fetchRecetas();
      }
    } catch {
      showError(GENERIC_ERROR);
    } finally {
      setDeleteId(null);
    }
  };

  // Detalles handlers
  const resetDetalleForm = () => {
    setDetalleForm(INITIAL_DETALLE);
    setEditingDetalleId(null);
    setShowDetalleForm(false);
  };

  const handleDetalleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDetalleForm({ ...detalleForm, [e.target.name]: e.target.value });
  };

  const handleDetalleSubmit = async (recetaId: number) => {
    if (!detalleForm.medicamento.trim()) {
      showError('El nombre del medicamento es obligatorio');
      return;
    }
    try {
      const body = {
        recetaId,
        medicamento: detalleForm.medicamento,
        dosis: detalleForm.dosis,
        frecuencia: detalleForm.frecuencia,
        duracion: detalleForm.duracion,
      };

      const res = editingDetalleId
        ? await authFetch({
          endpoint: ENDPOINTS.DETALLE_RECETA,
          method: METHODS.PUT,
          body: JSON.stringify({ id: editingDetalleId, ...body }),
        })
        : await authFetch({
          endpoint: ENDPOINTS.DETALLE_RECETA,
          method: METHODS.POST,
          body: JSON.stringify(body),
        });

      if (!res.ok) {
        showError(await parseApiError(res));
        return;
      }

      resetDetalleForm();
      fetchRecetas();
    } catch {
      showError(GENERIC_ERROR);
    }
  };

  const handleEditDetalle = (d: DetalleReceta) => {
    setEditingDetalleId(d.id);
    setDetalleForm({
      medicamento: d.medicamento,
      dosis: d.dosis,
      frecuencia: d.frecuencia,
      duracion: d.duracion,
    });
    setShowDetalleForm(true);
  };

  const handleDeleteDetalle = async () => {
    if (!deleteDetalleId) return;
    try {
      const res = await authFetch({ endpoint: `${ENDPOINTS.DETALLE_RECETA}/${deleteDetalleId}`, method: METHODS.DELETE });
      if (!res.ok) {
        showError(await parseApiError(res));
      } else {
        fetchRecetas();
      }
    } catch {
      showError(GENERIC_ERROR);
    } finally {
      setDeleteDetalleId(null);
    }
  };

  const getConsultaLabel = (consultaId: number) => {
    const c = consultas.find(c => c.id === consultaId);
    if (!c) return `Consulta #${consultaId}`;
    return `${c.motivoConsulta} — ${new Date(c.fechaConsulta).toLocaleDateString()}`;
  };

  const inputClass = "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-violet-500";

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <NavBar />

      {deleteId && (
        <Popup title="Eliminar receta" message="¿Seguro que deseas eliminar esta receta?" confirmText="Eliminar" cancelText="Cancelar" variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
      )}
      {deleteDetalleId && (
        <Popup title="Eliminar medicamento" message="¿Seguro que deseas eliminar este medicamento?" confirmText="Eliminar" cancelText="Cancelar" variant="danger" onConfirm={handleDeleteDetalle} onCancel={() => setDeleteDetalleId(null)} />
      )}
      {popup && (
        <Popup title={popup.title} message={popup.message} confirmText="Aceptar" variant={popup.variant} showCancel={false} onConfirm={() => setPopup(null)} />
      )}

      <div className="max-w-4xl mx-auto w-full px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">{canEdit ? 'Recetas' : 'Mis Recetas'}</h1>
          {canEdit && !showForm && (
            <button
              onClick={() => { resetForm(); setShowForm(true); }}
              className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-lg transition"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Nueva receta
            </button>
          )}
        </div>

        {/* Formulario */}
        {canEdit && showForm && (
          <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl p-6 mb-8 border border-slate-700">
            <h2 className="text-lg font-semibold mb-4">{editingId ? 'Editar receta' : 'Nueva receta'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">

              {/* Consulta dropdown */}
              <div className="md:col-span-2 relative">
                <label className="block text-sm text-slate-400 mb-1">Consulta asociada</label>
                <button
                  type="button"
                  onClick={() => setConsultaOpen(!consultaOpen)}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-left text-white focus:outline-none focus:ring-2 focus:ring-violet-500"
                >
                  {formData.consultaId
                    ? getConsultaLabel(Number(formData.consultaId))
                    : <span className="text-slate-500">Seleccionar consulta</span>}
                </button>
                {consultaOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                    {consultas.length === 0 ? (
                      <p className="px-4 py-3 text-sm text-slate-400">No hay consultas disponibles</p>
                    ) : consultas.map(c => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => { setFormData({ ...formData, consultaId: c.id }); setConsultaOpen(false); }}
                        className={`w-full px-4 py-2.5 text-left text-sm transition ${formData.consultaId === c.id ? 'bg-violet-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}
                      >
                        {c.motivoConsulta} — {new Date(c.fechaConsulta).toLocaleDateString()}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Fecha de emisión</label>
                <input name="fechaEmision" type="date" value={formData.fechaEmision} onChange={handleChange} className={inputClass} required />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm text-slate-400 mb-1">Indicaciones generales</label>
                <textarea
                  name="indicacionesGenerales"
                  value={formData.indicacionesGenerales}
                  onChange={handleChange}
                  placeholder="Indicaciones generales para el paciente..."
                  rows={3}
                  className={inputClass}
                />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white font-medium rounded-lg transition">
                {editingId ? 'Actualizar' : 'Guardar'}
              </button>
              <button type="button" onClick={resetForm} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white font-medium rounded-lg transition">
                Cancelar
              </button>
            </div>
          </form>
        )}

        {/* Lista de recetas */}
        {loading ? (
          <p className="text-slate-400 text-center">Cargando...</p>
        ) : recetas.length === 0 ? (
          <p className="text-slate-400 text-center">No hay recetas registradas</p>
        ) : (
          <div className="space-y-3">
            {recetas.map(r => {
              const isExpanded = expandedRecetaId === r.id;
              const detalles: DetalleReceta[] = r.detalles ?? [];

              return (
                <div key={r.id} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
                  {/* Header */}
                  <div className="flex items-center justify-between px-5 py-4">
                    <div
                      className="flex items-center gap-4 cursor-pointer flex-1"
                      onClick={() => { setExpandedRecetaId(isExpanded ? null : r.id); resetDetalleForm(); }}
                    >
                      <div className="w-10 h-10 rounded-full bg-violet-500/20 flex items-center justify-center flex-shrink-0">
                        <svg className="w-5 h-5 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm">{getConsultaLabel(r.consultaId)}</p>
                        <div className="flex items-center gap-3 mt-0.5">
                          <span className="text-xs text-slate-400">Emitida: {new Date(r.fechaEmision).toLocaleDateString()}</span>
                          {detalles.length > 0 && (
                            <span className="text-xs text-violet-400">{detalles.length} medicamento{detalles.length !== 1 ? 's' : ''}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {canEdit && (
                        <>
                          <button
                            onClick={() => handleEdit(r)}
                            className="p-2 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition"
                            title="Editar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                            </svg>
                          </button>
                          <button
                            onClick={() => setDeleteId(r.id)}
                            className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
                            title="Eliminar"
                          >
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </>
                      )}
                      <svg
                        className={`w-5 h-5 text-slate-400 transition-transform ml-1 cursor-pointer ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        onClick={() => { setExpandedRecetaId(isExpanded ? null : r.id); resetDetalleForm(); }}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Detalle expandido */}
                  {isExpanded && (
                    <div className="border-t border-slate-700 px-5 py-4 space-y-5">
                      {/* Indicaciones generales */}
                      {r.indicacionesGenerales && (
                        <div>
                          <p className="text-xs text-slate-500 mb-1">Indicaciones generales</p>
                          <p className="text-sm text-slate-300">{r.indicacionesGenerales}</p>
                        </div>
                      )}

                      {/* Medicamentos */}
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <h3 className="text-sm font-medium text-slate-400 flex items-center gap-2">
                            <svg className="w-4 h-4 text-violet-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                            </svg>
                            Medicamentos
                          </h3>
                          {canEdit && !showDetalleForm && (
                            <button
                              onClick={() => { resetDetalleForm(); setShowDetalleForm(true); }}
                              className="text-xs px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white rounded-lg transition flex items-center gap-1"
                            >
                              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                              Agregar medicamento
                            </button>
                          )}
                        </div>

                        {/* Form inline de detalle */}
                        {showDetalleForm && (
                          <div className="bg-slate-700/30 rounded-lg p-4 mb-3 border border-slate-600">
                            <h4 className="text-sm font-medium mb-3">{editingDetalleId ? 'Editar medicamento' : 'Nuevo medicamento'}</h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                              <div className="md:col-span-2">
                                <label className="block text-xs text-slate-400 mb-1">Medicamento</label>
                                <input
                                  name="medicamento"
                                  value={detalleForm.medicamento}
                                  onChange={handleDetalleChange}
                                  placeholder="Nombre del medicamento"
                                  className={inputClass}
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-slate-400 mb-1">Dosis</label>
                                <input
                                  name="dosis"
                                  value={detalleForm.dosis}
                                  onChange={handleDetalleChange}
                                  placeholder="Ej: 500mg"
                                  className={inputClass}
                                />
                              </div>
                              <div>
                                <label className="block text-xs text-slate-400 mb-1">Frecuencia</label>
                                <input
                                  name="frecuencia"
                                  value={detalleForm.frecuencia}
                                  onChange={handleDetalleChange}
                                  placeholder="Ej: Cada 8 horas"
                                  className={inputClass}
                                />
                              </div>
                              <div className="md:col-span-2">
                                <label className="block text-xs text-slate-400 mb-1">Duración</label>
                                <input
                                  name="duracion"
                                  value={detalleForm.duracion}
                                  onChange={handleDetalleChange}
                                  placeholder="Ej: 7 días"
                                  className={inputClass}
                                />
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <button
                                type="button"
                                onClick={() => handleDetalleSubmit(r.id)}
                                className="px-3 py-1.5 bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium rounded-lg transition"
                              >
                                {editingDetalleId ? 'Actualizar' : 'Guardar'}
                              </button>
                              <button
                                type="button"
                                onClick={resetDetalleForm}
                                className="px-3 py-1.5 bg-slate-600 hover:bg-slate-500 text-white text-sm rounded-lg transition"
                              >
                                Cancelar
                              </button>
                            </div>
                          </div>
                        )}

                        {/* Lista de medicamentos */}
                        {detalles.length === 0 ? (
                          <p className="text-sm text-slate-500">Sin medicamentos registrados</p>
                        ) : (
                          <div className="space-y-2">
                            {detalles.map(d => (
                              <div key={d.id} className="bg-slate-700/40 rounded-lg px-4 py-3">
                                <div className="flex items-start justify-between">
                                  <div className="flex-1 min-w-0">
                                    <p className="font-medium text-sm text-white mb-1">{d.medicamento}</p>
                                    <div className="flex flex-wrap gap-3 text-xs text-slate-400">
                                      {d.dosis && (
                                        <span className="flex items-center gap-1">
                                          <span className="text-slate-500">Dosis:</span>
                                          <span className="text-slate-300">{d.dosis}</span>
                                        </span>
                                      )}
                                      {d.frecuencia && (
                                        <span className="flex items-center gap-1">
                                          <span className="text-slate-500">Frecuencia:</span>
                                          <span className="text-slate-300">{d.frecuencia}</span>
                                        </span>
                                      )}
                                      {d.duracion && (
                                        <span className="flex items-center gap-1">
                                          <span className="text-slate-500">Duración:</span>
                                          <span className="text-slate-300">{d.duracion}</span>
                                        </span>
                                      )}
                                    </div>
                                  </div>
                                  {canEdit && (
                                    <div className="flex items-center gap-1 ml-2 flex-shrink-0">
                                      <button
                                        onClick={() => handleEditDetalle(d)}
                                        className="p-1.5 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition"
                                        title="Editar"
                                      >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                                        </svg>
                                      </button>
                                      <button
                                        onClick={() => setDeleteDetalleId(d.id)}
                                        className="p-1.5 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
                                        title="Eliminar"
                                      >
                                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                        </svg>
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
        )}
      </div>
    </div>
  );
};

export default Recetas;
