import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate
} from "react-router-dom";
import { LoginPage } from "../features/auth/pages/LoginPage";
import { PrivateRoute } from "../routes/PrivateRoute";
import { TaskPage } from "../features/tasks/pages/TaskPage";
import { RegisterPage } from "../features/auth/pages/RegisterPage";
import { ResetPasswordPage } from "../features/auth/pages/ResetPasswordPage";


export function AppRoutes(){
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage/>} />
                <Route path="/register" element={<RegisterPage/> } />


                <Route element={<PrivateRoute />}>
                    <Route path="/tasks" element={<TaskPage />} />
                </Route>

                <Route 
                    path="/reset-password/:token" 
                    element={
                        <ResetPasswordPage/>
                    } 
                />
    
                <Route path="*" element={<Navigate to="/login" replace/>}/>
            </Routes>
        </Router>
    );
}