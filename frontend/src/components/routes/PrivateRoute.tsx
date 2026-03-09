import { Navigate } from 'react-router-dom';
import { isTokenValid } from '../../utils/isTokenValid';

const PrivateRoute = ({ children }: { children: React.ReactNode }) => {
  return isTokenValid() ? <>{children}</> : <Navigate to="/login" replace />;
};

export default PrivateRoute;
