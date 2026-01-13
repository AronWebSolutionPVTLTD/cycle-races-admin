import { createBrowserRouter, Navigate } from 'react-router-dom';
import MainRoutes from './MainRoutes';
import LoginRoutes from './LoginRoutes';
const router = createBrowserRouter(
  [
    // {
    //   path: '/',
    //   element: <Navigate to="/login" />
    // },
    MainRoutes,
    LoginRoutes
  ],
  {
    basename: import.meta.env.VITE_APP_BASE_NAME
  }
);

export default router;
