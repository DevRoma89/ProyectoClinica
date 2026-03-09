import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/login/login'
import Registro from './components/registro/Registro'
import Inicio from './components/inicio/Inicio'
import Especialidades from './components/especialidades/Especialidades'
import PrivateRoute from './components/routes/PrivateRoute'
import PublicRoute from './components/routes/PublicRoute'

const App = () => {
  return (
    <Routes>
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/registro" element={<PublicRoute><Registro /></PublicRoute>} />
      <Route path="/inicio" element={<PrivateRoute><Inicio /></PrivateRoute>} />
      <Route path="/especialidades" element={<PrivateRoute><Especialidades /></PrivateRoute>} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
