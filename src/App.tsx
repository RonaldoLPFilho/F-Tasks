import './App.css'
import { ToastProvider } from './components/ToastProvider';
import { AuthProvider } from './features/auth/contexts/AuthProvider';

import { AppRoutes } from "./routes/AppRoutes";

function App() {
    return (
        <ToastProvider>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </ToastProvider>

    );
}

export default App;