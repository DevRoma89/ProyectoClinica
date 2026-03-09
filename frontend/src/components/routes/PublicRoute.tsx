import { Navigate } from 'react-router-dom';
import { isTokenValid } from '../../utils/isTokenValid';

const PublicRoute = ({ children }: { children: React.ReactNode }) => {
  return isTokenValid() ? <Navigate to="/inicio" replace /> : <>{children}</>;
};

export default PublicRoute;
