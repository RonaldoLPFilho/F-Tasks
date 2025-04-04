import { JSX, useContext } from "react";
import { AuthContext } from "../contexts/AuthContext";
import { Navigate } from "react-router-dom";

export function PrivateRoute({children}: {children: JSX.Element}){
    const {isAuthenticated} = useContext(AuthContext);

    if(isAuthenticated){
        return (
            children
        )
    }else{
        return <Navigate to="/login"/>
    }
}