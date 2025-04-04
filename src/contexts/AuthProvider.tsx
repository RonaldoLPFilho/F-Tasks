import { useState } from "react";
import { AuthContext } from "./AuthContext";

export function AuthProvider({children}: {children: React.ReactNode}){
    const [token, setToken] = useState(localStorage.getItem("token") || "");

    const login = (newToken: string) => {
        localStorage.setItem("token", newToken);
        setToken(newToken);

    }

    const logout = () => {
        localStorage.removeItem("token");
        setToken("");
    } 

    return(
        <AuthContext.Provider value={{isAuthenticated: !!token, token, login, logout}}>
            {children}
        </AuthContext.Provider>
    )
}