import "./styles/global.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import Dashboard from "./features/journal/pages/Dashboard";
import Settings from "./features/settings/pages/Settings";
import ResetAuth from "./features/auth/pages/ResetAuth";
import Login from "./features/auth/pages/Login";
import SignUp from "./features/auth/pages/SignUp";
import Layout from "./components/layout/Layout";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Dashboard />} />
            <Route path="login" element={<Login />} />
            <Route path="reset" element={<ResetAuth />} />
            <Route path="signup" element={<SignUp />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
