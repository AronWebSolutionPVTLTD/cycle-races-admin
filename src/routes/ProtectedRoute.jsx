import { Navigate } from 'react-router-dom';
import { getToken } from '../api/auth-utils';

const ProtectedRoute = ({ children }) => {
  const { token, adminInfo } = getToken();

  const isAuthenticated = !!token && !!adminInfo;

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

export default ProtectedRoute;
