import { useContext } from "react";
import { AuthContext } from "../features/auth/contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import { Header } from "../layout/Header";

export function PrivateRoute() {
    const { isAuthenticated } = useContext(AuthContext);

    if (!isAuthenticated) {
        return <Navigate to="/login" />;
    }
    
    return (
        <>
            <Header />
            <Outlet />
        </>
    );
}
