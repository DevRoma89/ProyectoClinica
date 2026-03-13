import { Navigate } from 'react-router-dom';
import { isTokenValid, canManage } from '../../utils/isTokenValid';

const AdminRoute = ({ children }: { children: React.ReactNode }) => {
  if (!isTokenValid()) return <Navigate to="/login" replace />;
  if (!canManage()) return <Navigate to="/inicio" replace />;
  return <>{children}</>;
};

export default AdminRoute;
