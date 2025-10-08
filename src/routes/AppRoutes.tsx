import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate
  } from "react-router-dom";
  
import { LoginPage } from "../features/auth/pages/LoginPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { ResetPasswordPage } from "../features/auth/pages/ResetPasswordPage";
import { TaskPage } from "../features/tasks/pages/TaskPage";


import { PrivateRoute } from "../routes/PrivateRoute";
import { AppLayout } from "../layout/AppLayout";
import { SettingsPage } from "../features/settings/SettingsPage";
  
  export function AppRoutes() {
    return (
      <Router>
        <Routes>
          {/* Rotas públicas */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
  
          {/* Rotas privadas com layout */}
          <Route element={<PrivateRoute />}>
            <Route element={<AppLayout />}>
              <Route path="/tasks" element={<TaskPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>
  
          {/* Rota fallback */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Router>
    );
  }
  