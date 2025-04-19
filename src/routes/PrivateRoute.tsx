import { useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Navigate, Outlet } from "react-router-dom";
import { Header } from "../components/Header";

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
