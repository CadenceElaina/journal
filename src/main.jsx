import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./styles/global.css";
import App from "./App.jsx";
import { ThemeProvider } from "./features/theme/ThemeContext.jsx";
import { AuthProvider } from "./features/auth/context/AuthContext.jsx";
import { PasswordResetProvider } from "./features/auth/context/PasswordResetContext.jsx";
import { EmailVerificationProvider } from "./features/auth/context/EmailVerificationContext.jsx";
import { JournalsProvider } from "./features/journal/context/JournalsContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <JournalsProvider>
          <PasswordResetProvider>
            <EmailVerificationProvider>
              <App />
            </EmailVerificationProvider>
          </PasswordResetProvider>
        </JournalsProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
