import { useState } from "react";
import { FloatingLabelInput } from "../components/FloatingLabelInput";
import { PasswordStrengthBar } from "../components/PasswordStrengthBar";


export function RegisterPage() {
    const [password, setPassword] = useState("")
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-purple-100">
        <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
            <div className="flex flex-col items-center mb-6">
            <div className="bg-purple-100 text-purple-700 rounded-full p-3 mb-2">
                📱
            </div>
            <h1 className="text-2xl font-semibold text-gray-800">Criar conta</h1>
            <p className="text-sm text-gray-500 text-center mt-1">
                Entre com seus dados para criar sua conta
            </p>
            </div>
    
            <form className="space-y-6">
            <FloatingLabelInput
                id="username"
                label="Nome completo"
                autoComplete="name"
                required
            />
    
            <FloatingLabelInput
                id="email"
                label="Email"
                type="email"
                autoComplete="email"
                required
            />
    
            <FloatingLabelInput
                id="password"
                label="Senha"
                showPasswordToggle
                required
                onChange={(e) => setPassword(e.target.value) }
            />

            <div className="mt-[-1rem] mb-2">
            <PasswordStrengthBar password={password} />
            </div>
    
            <button
                type="submit"
                className="w-full bg-purple-400 text-white py-3 rounded-lg hover:bg-purple-700 transition"
            >
                <strong>Criar conta</strong> 
            </button>
            </form>
        </div>
        </div>
    );
}
