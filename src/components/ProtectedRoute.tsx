
import React from 'react';
import { Navigate } from 'react-router-dom';
import { useLogin } from '@/contexts/LoginContext';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isLoggedIn } = useLogin();

  if (!isLoggedIn) {
    return <Navigate to="/login" />;
  }

  return <>{children}</>;
};

export default ProtectedRoute;
