import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./features/journal/pages/Dashboard";
import Settings from "./features/settings/pages/Settings";
import PasswordReset from "./features/auth/pages/PasswordReset";
import Login from "./features/auth/pages/Login";
import SignUp from "./features/auth/pages/SignUp";
import Onboarding from "./features/onboarding/pages/Onboarding";
import Layout from "./shared/components/Layout";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="login" element={<Login />} />
            <Route path="reset" element={<PasswordReset />} />
            <Route path="signup" element={<SignUp />} />
            <Route path="onboarding" element={<Onboarding />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
