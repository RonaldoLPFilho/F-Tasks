import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate
} from "react-router-dom";
import { LoginPage } from "../pages/LoginPage";
import { PrivateRoute } from "./PrivateRoute";
import { TaskPage } from "../pages/TaskPage";
import { RegisterPage } from "../pages/RegisterPage";


export function AppRoutes(){
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage/>} />
                <Route path="/register" element={<RegisterPage/> } />

                <Route
                    path="/tasks"
                    element={
                        <PrivateRoute>
                            <TaskPage />
                        </PrivateRoute>
                    }
                />
    
                <Route path="*" element={<Navigate to="/login" replace/>}/>
            </Routes>
        </Router>
    );
}