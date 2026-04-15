import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/login/login'
import Registro from './components/registro/Registro'
import Inicio from './components/inicio/Inicio'
import Especialidades from './components/especialidades/Especialidades'
import Medicos from './components/medicos/Medicos'
import Pacientes from './components/pacientes/Pacientes'
import Turnos from './components/turnos/Turnos'
import Consultas from './components/consultas/Consultas'
import HistoriasClinicas from './components/historias-clinicas/HistoriasClinicas'
import Recetas from './components/recetas/Recetas'
import PrivateRoute from './components/routes/PrivateRoute'
import PublicRoute from './components/routes/PublicRoute'
import AdminRoute from './components/routes/AdminRoute'

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/registro" element={<PublicRoute><Registro /></PublicRoute>} />
      <Route path="/inicio" element={<PrivateRoute><Inicio /></PrivateRoute>} />
      <Route path="/especialidades" element={<AdminRoute><Especialidades /></AdminRoute>} />
      <Route path="/medicos" element={<AdminRoute><Medicos /></AdminRoute>} />
      <Route path="/pacientes" element={<AdminRoute><Pacientes /></AdminRoute>} />
      <Route path="/turnos" element={<PrivateRoute><Turnos /></PrivateRoute>} />
      <Route path="/consultas" element={<PrivateRoute><Consultas /></PrivateRoute>} />
      <Route path="/historias-clinicas" element={<PrivateRoute><HistoriasClinicas /></PrivateRoute>} />
      <Route path="/recetas" element={<PrivateRoute><Recetas /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
