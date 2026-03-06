import { useEffect, useState } from 'react';
import NavBar from '../navBar/navBar';
import Popup from '../popup/Popup';
import type { Especialidad } from './types';
import { METHODS } from '../../constants';

const API_URL = `${import.meta.env.VITE_API_URL}/api/Especialidad`;

export default function Especialidades() {
  const [especialidades, setEspecialidades] = useState<Especialidad[]>([]);
  const [nombre, setNombre] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const [popup, setPopup] = useState<{ title: string; message: string; variant: 'danger' | 'info' | 'success' } | null>(null);

  const showError = (message: string) => {
    setPopup({ title: 'Error', message, variant: 'danger' });
  };

  const fetchEspecialidades = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setEspecialidades(data);
    } catch {
      showError('Error al cargar especialidades');
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
        ? await fetch(API_URL, {
            method: METHODS.PUT,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id: editingId, nombre, descripcion }),
          })
        : await fetch(API_URL, {
            method: METHODS.POST,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre, descripcion }),
          });

      if (!res.ok) {
        const errorMsg = await res.text();
        showError(errorMsg);
        return;
      }

      resetForm();
      fetchEspecialidades();
    } catch {
      showError('Error de conexion con el servidor');
    }
  };

  const handleEdit = (esp: Especialidad) => {
    setEditingId(esp.id);
    setNombre(esp.nombre);
    setDescripcion(esp.descripcion);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      const res = await fetch(`${API_URL}/${deleteId}`, { method: METHODS.DELETE });
      if (!res.ok) {
        const errorMsg = await res.text();
        showError(errorMsg);
      } else {
        fetchEspecialidades();
      }
    } catch {
      showError('Error de conexion con el servidor');
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
                placeholder="Ej: Especialidad del corazon"
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
                      <button
                        onClick={() => handleEdit(esp)}
                        className="text-blue-400 hover:text-blue-300 mr-3 transition"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => setDeleteId(esp.id)}
                        className="text-red-400 hover:text-red-300 transition"
                      >
                        Eliminar
                      </button>
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
