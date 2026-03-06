import { Routes, Route, Navigate } from 'react-router-dom'
import Login from './components/login/login'
import Dashboard from './components/dashboard/Dashboard'
import Especialidades from './components/especialidades/Especialidades'

function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/especialidades" element={<Especialidades />} />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  )
}

export default App
