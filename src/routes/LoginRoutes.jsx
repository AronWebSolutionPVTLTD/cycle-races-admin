import { lazy } from 'react';
import AuthLayout from 'layout/Auth';
import Loadable from 'components/Loadable';
const LoginPage = Loadable(lazy(() => import('pages/auth/Login')));
const RegisterPage = Loadable(lazy(() => import('pages/auth/Register')));

const LoginRoutes = {
  path: '/',
  children: [
    {
      path: '/',
      element: <AuthLayout />,
      children: [
        {
          path: '/login',
          element: <LoginPage />
        },
        {
          path: '/register',
          element: <RegisterPage />
        }
      ]
    }
  ]
};

export default LoginRoutes;
