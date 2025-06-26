import { useState } from "react";
import { AuthContext } from "./AuthContext";

export function AuthProvider({children}: {children: React.ReactNode}){
    const [token, setToken] = useState(localStorage.getItem("token") || "");
    const [username, setUsername] = useState(localStorage.getItem("username") || "");


    const login = (newToken: string, username: string) => {
        localStorage.setItem("token", newToken);
        localStorage.setItem("username", username)
        console.log("auth provider newToken: " + newToken);
        setToken(newToken);
        setUsername(username);
    }

    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("username");
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