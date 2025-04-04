import { createContext } from "react";

interface AuthContextType{
    isAuthenticated: boolean; 
    token: string;
    login: (token: string) => void;
    logout: () => void;
}

export const AuthContext = createContext<AuthContextType>({
    isAuthenticated: false,
    token: "",
    login: () => {},
    logout: () => {}
});