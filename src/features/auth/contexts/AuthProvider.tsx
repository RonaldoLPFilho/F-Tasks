import { useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import {
    clearAuthSession,
    readAuthSession,
    saveAuthSession,
} from "../storage/authStorage";

export function AuthProvider({children}: {children: React.ReactNode}){
    const [token, setToken] = useState(() => readAuthSession().token);
    const [username, setUsername] = useState(() => readAuthSession().username);

    useEffect(() => {
        const handleUnauthorized = () => {
            clearAuthSession();
            setToken("");
            setUsername("");
        };

        window.addEventListener("tasks:unauthorized", handleUnauthorized);
        return () => window.removeEventListener("tasks:unauthorized", handleUnauthorized);
    }, []);

    const login = (newToken: string, username: string) => {
        saveAuthSession({ token: newToken, username });
        setToken(newToken);
        setUsername(username);
    }

    const logout = () => {
        clearAuthSession();
        setToken("");
        setUsername("");
    } 

    return(
        <AuthContext.Provider 
            value={{
                isAuthenticated: !!token, 
                token,
                username, 
                login, 
                logout}}
        >
            {children}
        </AuthContext.Provider>
    )
}
