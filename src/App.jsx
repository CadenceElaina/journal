import { useState } from "react";

import "./App.css";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  useLocation,
} from "react-router-dom";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Settings from "./pages/Settings";

function App() {
  return (
    <>
      <Router>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route index element={<Home />} />
          <Route path="home" element={<Home />} />
          <Route path="settings" element={<Settings />} />
        </Routes>
      </Router>
    </>
  );
}

export default App;
