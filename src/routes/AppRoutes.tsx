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
import { ResetPasswordPage } from "../pages/ResetPasswordPage";


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