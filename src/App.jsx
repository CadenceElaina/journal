import { useState } from "react";

import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home";
import Settings from "./pages/Settings";
import ResetAuth from "./pages/ResetAuth";
import Layout from "./components/layout/Layout";
import Signup from "./pages/Signup";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="reset" element={<ResetAuth />} />
            <Route path="signup" element={<Signup />} />
            <Route path="settings" element={<Settings />} />
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default App;
