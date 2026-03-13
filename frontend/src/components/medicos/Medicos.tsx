import { useEffect, useState } from 'react';
import NavBar from '../navBar/navBar';
import Popup from '../popup/Popup';
import type { Medico, MedicoForm } from './types';
import type { Specialty } from '../especialidades/types';
import type { PopupState } from '../popup/types';
import { METHODS, ENDPOINTS, GENERIC_ERROR } from '../../constants';
import { authFetch } from '../../utils/authFetch';
import { parseApiError } from '../../utils/parseApiError';

const INITIAL_FORM: MedicoForm = {
  nombre: '',
  apellido: '',
  matricula: '',
  especialidadId: '',
  telefono: '',
  email: '',
};

const Medicos = () => {
  const [medicos, setMedicos] = useState<Medico[]>([]);
  const [especialidades, setEspecialidades] = useState<Specialty[]>([]);
  const [formData, setFormData] = useState<MedicoForm>(INITIAL_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [popup, setPopup] = useState<PopupState | null>(null);
  const [espOpen, setEspOpen] = useState(false);

  const showError = (message: string) => {
    setPopup({ title: 'Error', message, variant: 'danger' });
  };

  const fetchMedicos = async () => {
    try {
      const res = await authFetch({ endpoint: ENDPOINTS.MEDICO, method: METHODS.GET });
      const data = await res.json();
      setMedicos(data);
    } catch {
      showError(GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  };

  const fetchEspecialidades = async () => {
    try {
      const res = await authFetch({ endpoint: ENDPOINTS.ESPECIALIDAD, method: METHODS.GET });
      const data = await res.json();
      setEspecialidades(data);
    } catch {
      showError(GENERIC_ERROR);
    }
  };

  useEffect(() => {
    fetchMedicos();
    fetchEspecialidades();
  }, []);

  const resetForm = () => {
    setFormData(INITIAL_FORM);
    setEditingId(null);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const body = {
        nombre: formData.nombre,
        apellido: formData.apellido,
        matricula: formData.matricula,
        especialidadId: Number(formData.especialidadId),
        telefono: formData.telefono,
        email: formData.email,
      };

      const res = editingId
        ? await authFetch({
            endpoint: ENDPOINTS.MEDICO,
            method: METHODS.PUT,
            body: JSON.stringify({ id: editingId, ...body }),
          })
        : await authFetch({
            endpoint: ENDPOINTS.MEDICO,
            method: METHODS.POST,
            body: JSON.stringify(body),
          });

      if (!res.ok) {
        const errorMsg = await parseApiError(res);
        showError(errorMsg);
        return;
      }

      resetForm();
      fetchMedicos();
    } catch {
      showError(GENERIC_ERROR);
    }
  };

  const handleEdit = (med: Medico) => {
    setEditingId(med.id);
    setFormData({
      nombre: med.nombre,
      apellido: med.apellido,
      matricula: med.matricula,
      especialidadId: med.especialidadId,
      telefono: med.telefono,
      email: med.email,
    });
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await authFetch({ endpoint: `${ENDPOINTS.MEDICO}/${deleteId}`, method: METHODS.DELETE });
      if (!res.ok) {
        const errorMsg = await parseApiError(res);
        showError(errorMsg);
      } else {
        fetchMedicos();
      }
    } catch {
      showError(GENERIC_ERROR);
    } finally {
      setDeleteId(null);
    }
  };

  const inputClass = "w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500";

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <NavBar />
      {deleteId && (
        <Popup
          title="Eliminar medico"
          message="Seguro que deseas eliminar este medico? Esta accion no se puede deshacer."
          confirmText="Eliminar"
          cancelText="Cancelar"
          variant="danger"
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
        />
      )}
      {popup && (
        <Popup
          title={popup.title}
          message={popup.message}
          confirmText="Aceptar"
          variant={popup.variant}
          showCancel={false}
          onConfirm={() => setPopup(null)}
        />
      )}
      <div className="max-w-6xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Medicos</h1>

        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl p-6 mb-8 border border-slate-700">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Editar medico' : 'Nuevo medico'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Nombre</label>
              <input name="nombre" value={formData.nombre} onChange={handleChange} placeholder="Ej: Juan" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Apellido</label>
              <input name="apellido" value={formData.apellido} onChange={handleChange} placeholder="Ej: Perez" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Matricula</label>
              <input name="matricula" value={formData.matricula} onChange={handleChange} placeholder="Ej: MP12345" className={inputClass} />
            </div>
            <div className="relative">
              <label className="block text-sm text-slate-400 mb-1">Especialidad</label>
              <button
                type="button"
                onClick={() => setEspOpen(!espOpen)}
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-left text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {formData.especialidadId
                  ? especialidades.find((e) => e.id === formData.especialidadId)?.nombre || 'Seleccionar'
                  : <span className="text-slate-500">Seleccionar especialidad</span>}
              </button>
              {espOpen && (
                <div className="absolute z-20 mt-1 w-full bg-slate-800 border border-slate-700 rounded-lg shadow-xl overflow-hidden max-h-48 overflow-y-auto">
                  {especialidades.map((esp) => (
                    <button
                      key={esp.id}
                      type="button"
                      onClick={() => {
                        setFormData({ ...formData, especialidadId: esp.id });
                        setEspOpen(false);
                      }}
                      className={`w-full px-4 py-2.5 text-left text-sm transition ${
                        formData.especialidadId === esp.id
                          ? 'bg-blue-600 text-white'
                          : 'text-slate-300 hover:bg-slate-700'
                      }`}
                    >
                      {esp.nombre}
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Telefono</label>
              <input name="telefono" value={formData.telefono} onChange={handleChange} placeholder="Ej: 3511234567" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Email</label>
              <input name="email" value={formData.email} onChange={handleChange} placeholder="Ej: medico@email.com" className={inputClass} />
            </div>
          </div>
          <div className="flex gap-2">
            <button type="submit" className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition">
              {editingId ? 'Actualizar' : 'Crear'}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white font-medium rounded-lg transition">
                Cancelar
              </button>
            )}
          </div>
        </form>

        {loading ? (
          <p className="text-slate-400 text-center">Cargando...</p>
        ) : medicos.length === 0 ? (
          <p className="text-slate-400 text-center">No hay medicos registrados</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-700">
            <table className="w-full">
              <thead className="bg-slate-800">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Nombre</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Apellido</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Matricula</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Especialidad</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Telefono</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Email</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-slate-400">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {medicos.map((med) => (
                  <tr key={med.id} className="hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3 text-sm">{med.nombre}</td>
                    <td className="px-4 py-3 text-sm">{med.apellido}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{med.matricula}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{med.especialidad}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{med.telefono}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{med.email}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => handleEdit(med)} className="p-2 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition" title="Editar">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button onClick={() => setDeleteId(med.id)} className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition" title="Eliminar">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </td>
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

export default Medicos;
