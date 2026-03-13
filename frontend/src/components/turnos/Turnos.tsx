import { useEffect, useState } from 'react';
import NavBar from '../navBar/navBar';
import Popup from '../popup/Popup';
import type { Turno, TurnoForm } from './types';
import { ESTADOS_TURNO } from './types';
import type { Medico } from '../medicos/types';
import type { Paciente } from '../pacientes/types';
import type { PopupState } from '../popup/types';
import { METHODS, ENDPOINTS, GENERIC_ERROR } from '../../constants';
import { authFetch } from '../../utils/authFetch';
import { parseApiError } from '../../utils/parseApiError';
import { getUserRole, getEmail } from '../../utils/isTokenValid';

const INITIAL_FORM: TurnoForm = {
  medicoId: '',
  pacienteId: '',
  fecha: '',
  horaInicio: '',
  horaFin: '',
  estado: 'Pendiente',
  observaciones: '',
};

const Turnos = () => {
  const role = getUserRole();
  const canEdit = role !== 'Paciente';

  const [turnos, setTurnos] = useState<Turno[]>([]);
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [pacientes, setPacientes] = useState<Paciente[]>([]);
  const [formData, setFormData] = useState<TurnoForm>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [popup, setPopup] = useState<PopupState | null>(null);
  const [medicoOpen, setMedicoOpen] = useState(false);
  const [pacienteOpen, setPacienteOpen] = useState(false);
  const [estadoOpen, setEstadoOpen] = useState(false);

  const showError = (message: string) => {
    setPopup({ title: 'Error', message, variant: 'danger' });
  };

  const fetchData = async () => {
    try {
      const requests = [
        authFetch({ endpoint: ENDPOINTS.TURNO, method: METHODS.GET }),
        authFetch({ endpoint: ENDPOINTS.PACIENTE, method: METHODS.GET }),
      ];
      if (canEdit) {
        requests.push(authFetch({ endpoint: ENDPOINTS.MEDICO, method: METHODS.GET }));
      }
      const responses = await Promise.all(requests);
      const allTurnos: Turno[] = await responses[0].json();
      const allPacientes: Paciente[] = await responses[1].json();

      if (canEdit) {
        setMedicos(await responses[2].json());
        setPacientes(allPacientes);
        setTurnos(allTurnos);
      } else {
        // Paciente: filtrar solo sus turnos
        const email = getEmail();
        const miPaciente = allPacientes.find(p => p.email.toLowerCase() === email?.toLowerCase());
        setTurnos(miPaciente ? allTurnos.filter(t => t.pacienteId === miPaciente.id) : []);
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

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setEditingId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const closeDropdowns = () => {
    setMedicoOpen(false);
    setPacienteOpen(false);
    setEstadoOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const body = {
        medicoId: Number(formData.medicoId),
        pacienteId: Number(formData.pacienteId),
        fecha: formData.fecha,
        horaInicio: formData.horaInicio,
        horaFin: formData.horaFin,
        estado: formData.estado,
        observaciones: formData.observaciones,
      };

      const res = editingId
        ? await authFetch({
            endpoint: ENDPOINTS.TURNO,
            method: METHODS.PUT,
            body: JSON.stringify({ id: editingId, ...body }),
          })
        : await authFetch({
            endpoint: ENDPOINTS.TURNO,
            method: METHODS.POST,
            body: JSON.stringify(body),
          });

      if (!res.ok) {
        const errorMsg = await parseApiError(res);
        showError(errorMsg);
        return;
      }

      resetForm();
      fetchData();
    } catch {
      showError(GENERIC_ERROR);
    }
  };

  const handleEdit = (t: Turno) => {
    setEditingId(t.id);
    setFormData({
      medicoId: t.medicoId,
      pacienteId: t.pacienteId,
      fecha: t.fecha.split('T')[0],
      horaInicio: t.horaInicio.substring(0, 5),
      horaFin: t.horaFin.substring(0, 5),
      estado: t.estado,
      observaciones: t.observaciones,
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await authFetch({ endpoint: `${ENDPOINTS.TURNO}/${deleteId}`, method: METHODS.DELETE });
      if (!res.ok) {
        const errorMsg = await parseApiError(res);
        showError(errorMsg);
      } else {
        fetchData();
      }
    } catch {
      showError(GENERIC_ERROR);
    } finally {
      setDeleteId(null);
    }
  };

  const handleChangeEstado = async (turno: Turno, nuevoEstado: string) => {
    try {
      const res = await authFetch({
        endpoint: ENDPOINTS.TURNO,
        method: METHODS.PUT,
        body: JSON.stringify({
          id: turno.id,
          medicoId: turno.medicoId,
          pacienteId: turno.pacienteId,
          fecha: turno.fecha,
          horaInicio: turno.horaInicio,
          horaFin: turno.horaFin,
          estado: nuevoEstado,
          observaciones: turno.observaciones,
        }),
      });
      if (!res.ok) {
        const errorMsg = await parseApiError(res);
        showError(errorMsg);
      } else {
        fetchData();
      }
    } catch {
      showError(GENERIC_ERROR);
    }
  };

  const getAvailableActions = (estado: string) => {
    const e = estado.toUpperCase();
    if (e === 'PENDIENTE') return [
      { label: 'Confirmar', estado: 'Confirmado', color: 'text-emerald-400 hover:bg-emerald-500/10' },
      { label: 'Cancelar', estado: 'Cancelado', color: 'text-red-400 hover:bg-red-500/10' },
    ];
    if (e === 'CONFIRMADO') return [
      { label: 'Completar', estado: 'Completado', color: 'text-blue-400 hover:bg-blue-500/10' },
      { label: 'Cancelar', estado: 'Cancelado', color: 'text-red-400 hover:bg-red-500/10' },
    ];
    return [];
  };

  const inputClass = "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <NavBar />
      {deleteId && (
        <Popup title="Eliminar turno" message="Seguro que deseas eliminar este turno?" confirmText="Eliminar" cancelText="Cancelar" variant="danger" onConfirm={handleDelete} onCancel={() => setDeleteId(null)} />
      )}
      {popup && (
        <Popup title={popup.title} message={popup.message} confirmText="Aceptar" variant={popup.variant} showCancel={false} onConfirm={() => setPopup(null)} />
      )}
      <div className="max-w-6xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">{role === 'Paciente' ? 'Mis Turnos' : 'Turnos'}</h1>

        {canEdit && (
          <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl p-6 mb-8 border border-slate-700">
            <h2 className="text-lg font-semibold mb-4">{editingId ? 'Editar turno' : 'Nuevo turno'}</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
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

              {/* Paciente dropdown */}
              <div className="relative">
                <label className="block text-sm text-slate-400 mb-1">Paciente</label>
                <button type="button" onClick={() => { closeDropdowns(); setPacienteOpen(!pacienteOpen); }}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-left text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {formData.pacienteId ? pacientes.find(p => p.id === formData.pacienteId)?.nombre + ' ' + pacientes.find(p => p.id === formData.pacienteId)?.apellido : <span className="text-slate-500">Seleccionar paciente</span>}
                </button>
                {pacienteOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                    {pacientes.map(p => (
                      <button key={p.id} type="button" onClick={() => { setFormData({ ...formData, pacienteId: p.id }); setPacienteOpen(false); }}
                        className={`w-full px-4 py-2.5 text-left text-sm transition ${formData.pacienteId === p.id ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                        {p.nombre} {p.apellido} - {p.documento}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm text-slate-400 mb-1">Fecha</label>
                <input name="fecha" type="date" value={formData.fecha} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Hora inicio</label>
                <input name="horaInicio" type="time" value={formData.horaInicio} onChange={handleChange} className={inputClass} />
              </div>
              <div>
                <label className="block text-sm text-slate-400 mb-1">Hora fin</label>
                <input name="horaFin" type="time" value={formData.horaFin} onChange={handleChange} className={inputClass} />
              </div>

              {/* Estado dropdown */}
              <div className="relative">
                <label className="block text-sm text-slate-400 mb-1">Estado</label>
                <button type="button" onClick={() => { closeDropdowns(); setEstadoOpen(!estadoOpen); }}
                  className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-left text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                  {formData.estado || <span className="text-slate-500">Seleccionar</span>}
                </button>
                {estadoOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden">
                    {ESTADOS_TURNO.map(e => (
                      <button key={e.value} type="button" onClick={() => { setFormData({ ...formData, estado: e.value }); setEstadoOpen(false); }}
                        className={`w-full px-4 py-2.5 text-left text-sm transition ${formData.estado === e.value ? 'bg-blue-600 text-white' : 'text-slate-300 hover:bg-slate-700'}`}>
                        {e.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="md:col-span-3">
                <label className="block text-sm text-slate-400 mb-1">Observaciones</label>
                <input name="observaciones" value={formData.observaciones} onChange={handleChange} placeholder="Observaciones opcionales" className={inputClass} />
              </div>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition">
                {editingId ? 'Actualizar' : 'Crear'}
              </button>
              {editingId && (
                <button type="button" onClick={resetForm} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white font-medium rounded-lg transition">Cancelar</button>
              )}
            </div>
          </form>
        )}

        {loading ? (
          <p className="text-slate-400 text-center">Cargando...</p>
        ) : turnos.length === 0 ? (
          <p className="text-slate-400 text-center">No hay turnos registrados</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-700">
            <table className="w-full">
              <thead className="bg-slate-800">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Paciente</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Medico</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Fecha</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Horario</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Estado</th>
                  {canEdit && <th className="text-right px-4 py-3 text-sm font-medium text-slate-400">Acciones</th>}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {turnos.map(t => (
                  <tr key={t.id} className="hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3 text-sm">{t.paciente}</td>
                    <td className="px-4 py-3 text-sm">{t.medico}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{new Date(t.fecha).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{t.horaInicio.substring(0, 5)} - {t.horaFin.substring(0, 5)}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        t.estado === 'CONFIRMADO' ? 'bg-emerald-500/20 text-emerald-400' :
                        t.estado === 'CANCELADO' ? 'bg-red-500/20 text-red-400' :
                        t.estado === 'COMPLETADO' ? 'bg-blue-500/20 text-blue-400' :
                        'bg-amber-500/20 text-amber-400'
                      }`}>{t.estado}</span>
                    </td>
                    {canEdit && (
                      <td className="px-4 py-3 text-sm text-right">
                        <div className="flex items-center justify-end gap-1">
                          {getAvailableActions(t.estado).map(action => (
                            <button key={action.estado} onClick={() => handleChangeEstado(t, action.estado)} className={`px-2.5 py-1 rounded-lg text-xs font-medium transition ${action.color}`}>
                              {action.label}
                            </button>
                          ))}
                          <button onClick={() => handleEdit(t)} className="p-2 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition" title="Editar">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" /></svg>
                          </button>
                          <button onClick={() => setDeleteId(t.id)} className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition" title="Eliminar">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                          </button>
                        </div>
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default Turnos;
