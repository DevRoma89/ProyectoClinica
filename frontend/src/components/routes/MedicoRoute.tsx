import { Navigate } from 'react-router-dom';
import { isTokenValid, getUserRole } from '../../utils/isTokenValid';

const ALLOWED_ROLES = ['Administrador', 'Medico'];

const MedicoRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isTokenValid()) return <Navigate to="/login" replace />;
  const role = getUserRole();
  if (!role || !ALLOWED_ROLES.includes(role)) return <Navigate to="/inicio" replace />;
  return <>{children}</>;
};

export default MedicoRoute;
