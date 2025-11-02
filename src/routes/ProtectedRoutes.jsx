import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "../features/auth/context/AuthContext";
import Layout from "../shared/components/Layout";
import Dashboard from "../features/journal/pages/Dashboard";
import JournalListPage from "../features/journal/pages/JournalListPage";
import JournalCreatePage from "../features/journal/pages/JournalCreatePage";
import JournalViewPage from "../features/journal/pages/JournalViewPage";
import JournalEditPage from "../features/journal/pages/JournalEditPage";
import Settings from "../features/settings/pages/Settings";

const ProtectedRoutes = () => {
  const { user, status } = useAuth();

  // If not logged in, redirect to auth
  if (!user || status === "loggedOut") {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Dashboard />} />
        <Route path="journals" element={<JournalListPage />} />
        <Route path="journals/new" element={<JournalCreatePage />} />
        <Route path="journals/:id" element={<JournalViewPage />} />
        <Route path="journals/:id/edit" element={<JournalEditPage />} />
        <Route path="settings" element={<Settings />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default ProtectedRoutes;
