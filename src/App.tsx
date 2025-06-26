import './App.css'
import { AuthProvider } from './features/auth/contexts/AuthProvider';

import { AppRoutes } from "./routes/AppRoutes";

function App() {
    return (
        <AuthProvider>
            <AppRoutes />
        </AuthProvider>
    );
}

export default App;