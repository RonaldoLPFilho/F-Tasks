import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate
} from "react-router-dom";
import { LoginPage } from "../components/LoginPage";

export function AppRoutes(){
    return (
        <Router>
            <Routes>
                <Route path="/login" element={<LoginPage/>} />
                <Route path="/tasks" element={<div>Task page teporary</div>} />
                <Route path="*" element={<Navigate to="/login" replace/>}/>
            </Routes>
        </Router>
    );
}