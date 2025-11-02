import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import AuthRoutes from "./routes/AuthRoutes";
import ProtectedRoutes from "./routes/ProtectedRoutes";
import Onboarding from "./features/onboarding/pages/Onboarding";

function App() {
  return (
    <Router>
      <Routes>
        {/* Auth routes - login, signup, etc. */}
        <Route path="/auth/*" element={<AuthRoutes />} />

        {/* Onboarding - special case, needs to be accessible after signup */}
        <Route path="/onboarding" element={<Onboarding />} />

        {/* Protected routes - journals, settings, etc. */}
        <Route path="/*" element={<ProtectedRoutes />} />
      </Routes>
    </Router>
  );
}

export default App;
