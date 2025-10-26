import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.jsx";
import "./shared/styles/global.css";
import { ThemeProvider } from "./shared/theme/ThemeContext.jsx";
import { AuthProvider } from "./features/auth/context/AuthContext.jsx";
import { PasswordResetProvider } from "./features/auth/context/PasswordResetContext.jsx";
import { EmailVerificationProvider } from "./features/auth/context/EmailVerificationContext.jsx";
import { OnboardingProvider } from "./features/onboarding/context/OnboardingContext.jsx";
import { JournalsProvider } from "./features/journal/context/JournalsContext.jsx";

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <ThemeProvider>
      <AuthProvider>
        <JournalsProvider>
          <PasswordResetProvider>
            <EmailVerificationProvider>
              <OnboardingProvider>
                <App />
              </OnboardingProvider>
            </EmailVerificationProvider>
          </PasswordResetProvider>
        </JournalsProvider>
      </AuthProvider>
    </ThemeProvider>
  </StrictMode>
);
