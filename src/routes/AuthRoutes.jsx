import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/context/AuthContext";

import Login from "../features/auth/pages/Login";
import SignUp from "../features/auth/pages/SignUp";
import PasswordReset from "../features/auth/pages/PasswordReset";
import EmailVerification from "../features/auth/pages/EmailVerification";
import Demo from "../features/demo/pages/Demo";

const AuthRoutes = () => {
  const { user } = useAuth();

  // If already logged in redirect to dashboard
  if (user) return <Navigate to={"/"} replace />;

  return (
    <Routes>
      <Route path="login" element={<Login />} />
      <Route path="signup" element={<SignUp />} />
      <Route path="reset-password" element={<PasswordReset />} />
      <Route path="verify-email" element={<EmailVerification />} />
      <Route path="demo" element={<Demo />} />
      <Route path="*" element={<Navigate to="/auth/login" replace />} />
    </Routes>
  );
};

export default AuthRoutes;
