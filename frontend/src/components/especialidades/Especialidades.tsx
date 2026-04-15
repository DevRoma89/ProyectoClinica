import { useEffect, useState } from 'react';
import NavBar from '../navBar/navBar';
import Popup from '../popup/Popup';
import type { Specialty } from './types';
import type { PopupState } from '../popup/types';
import { METHODS, ENDPOINTS, GENERIC_ERROR } from '../../constants';
import { authFetch } from '../../utils/authFetch';
import { parseApiError } from '../../utils/parseApiError';

const Especialidades = () => {
  const [especialidades, setEspecialidades] = useState<Specialty[]>([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [popup, setPopup] = useState<PopupState | null>(null);

  const showError = (message: string) => {
    setPopup({ title: 'Error', message, variant: 'danger' });
  };

  const fetchEspecialidades = async () => {
    try {
      const res = await authFetch({ endpoint: ENDPOINTS.ESPECIALIDAD, method: METHODS.GET });
      const data = await res.json();
      setEspecialidades(data);
    } catch {
      showError(GENERIC_ERROR);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEspecialidades();
  }, []);

  const resetForm = () => {
    setNombre('');
    setDescripcion('');
    setEditingId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const res = editingId
        ? await authFetch({
            endpoint: ENDPOINTS.ESPECIALIDAD,
            method: METHODS.PUT,
            body: JSON.stringify({ id: editingId, nombre, descripcion }),
          })
        : await authFetch({
            endpoint: ENDPOINTS.ESPECIALIDAD,
            method: METHODS.POST,
            body: JSON.stringify({ nombre, descripcion }),
          });

      if (!res.ok) {
        const errorMsg = await parseApiError(res);
        showError(errorMsg);
        return;
      }

      resetForm();
      fetchEspecialidades();
    } catch {
      showError(GENERIC_ERROR);
    }
  };

  const handleEdit = (esp: Specialty) => {
    setEditingId(esp.id);
    setNombre(esp.nombre);
    setDescripcion(esp.descripcion);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await authFetch({ endpoint: `${ENDPOINTS.ESPECIALIDAD}/${deleteId}`, method: METHODS.DELETE });
      if (!res.ok) {
        const errorMsg = await parseApiError(res);
        showError(errorMsg);
      } else {
        fetchEspecialidades();
      }
    } catch {
      showError(GENERIC_ERROR);
    } finally {
      setDeleteId(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      <NavBar />
      {deleteId && (
        <Popup
          title="Eliminar especialidad"
          message="Seguro que deseas eliminar esta especialidad? Esta accion no se puede deshacer."
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
      <div className="max-w-4xl mx-auto w-full px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Especialidades</h1>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="bg-slate-800 rounded-xl p-6 mb-8 border border-slate-700">
          <h2 className="text-lg font-semibold mb-4">
            {editingId ? 'Editar especialidad' : 'Nueva especialidad'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm text-slate-400 mb-1">Nombre</label>
              <input
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Ej: Cardiologia"
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-400 mb-1">Descripcion</label>
              <input
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                placeholder="Ej: Especialidad del corazon."
                className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-lg transition"
            >
              {editingId ? 'Actualizar' : 'Crear'}
            </button>
            {editingId && (
              <button
                type="button"
                onClick={resetForm}
                className="px-4 py-2 bg-slate-600 hover:bg-slate-500 text-white font-medium rounded-lg transition"
              >
                Cancelar
              </button>
            )}
          </div>
        </form>

        {/* Tabla */}
        {loading ? (
          <p className="text-slate-400 text-center">Cargando...</p>
        ) : especialidades.length === 0 ? (
          <p className="text-slate-400 text-center">No hay especialidades registradas</p>
        ) : (
          <div className="overflow-x-auto rounded-xl border border-slate-700">
            <table className="w-full">
              <thead className="bg-slate-800">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Nombre</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-slate-400">Descripcion</th>
                  <th className="text-right px-4 py-3 text-sm font-medium text-slate-400">Acciones</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-700">
                {especialidades.map((esp) => (
                  <tr key={esp.id} className="hover:bg-slate-800/50 transition">
                    <td className="px-4 py-3 text-sm">{esp.nombre}</td>
                    <td className="px-4 py-3 text-sm text-slate-300">{esp.descripcion}</td>
                    <td className="px-4 py-3 text-sm text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => handleEdit(esp)}
                          className="p-2 rounded-lg text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 transition"
                          title="Editar"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                          </svg>
                        </button>
                        <button
                          onClick={() => setDeleteId(esp.id)}
                          className="p-2 rounded-lg text-red-400 hover:text-red-300 hover:bg-red-500/10 transition"
                          title="Eliminar"
                        >
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
}

export default Especialidades;
