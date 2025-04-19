import { createContext } from "react";

interface AuthContextType{
    isAuthenticated: boolean; 
    token: string;
    username: string;
    login: (token: string, username: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    token: "",
    username: "",
    login: () => {},
    logout: () => {}
});