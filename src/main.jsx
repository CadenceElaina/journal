import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import App from "./App.jsx";
import { ThemeProvider } from "./features/theme/ThemeContext.jsx";
import { AuthProvider } from "./features/auth/context/AuthContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <App />
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
