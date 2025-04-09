import { useState } from "react";
import { FloatingLabelInput } from "../components/FloatingLabelInput";
import { PasswordStrengthBar } from "../components/PasswordStrengthBar";
import { register } from "../services/RegisterService";
import { useNavigate } from "react-router-dom";


export function RegisterPage() {
    const [username, setUsername] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
  
    const navigate = useNavigate();
  

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
    
        try {
          await register({ username, email, password });
          navigate("/login");
        } catch (err) {
          console.error(err);
          alert("Erro ao criar conta. Tente novamente.");
        }
      };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-purple-100">
            <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md relative">
                <div className="flex flex-col items-center mb-6">
                <div className="bg-purple-800 rounded-full p-6 absolute -top-13">
                        <p className="text-4xl text-center">📝</p>
                </div>
                <h1 className="text-2xl font-semibold text-gray-800 mt-4">Criar conta</h1>
                <p className="text-sm text-gray-500 text-center mt-1">
                    Entre com seus dados para <strong>criar</strong> sua conta
                </p>
                </div>
        
                <form 
                    className="space-y-4"
                    onSubmit={handleSubmit}
                >
                    <FloatingLabelInput
                        id="username"
                        label="Nome de usuário"
                        autoComplete="name"
                        required
                        onChange={(e) => setUsername(e.target.value)}
                    />
            
                    <FloatingLabelInput
                        id="email"
                        label="Email"
                        type="email"
                        autoComplete="email"
                        required
                        onChange={(e) => setEmail(e.target.value)}
                    />
            
                    <FloatingLabelInput
                        id="password"
                        label="Senha"
                        showPasswordToggle
                        required
                        onChange={(e) => setPassword(e.target.value) }
                    />

                    <div className="mt-4 mb-4">
                    <PasswordStrengthBar password={password} />
                    </div>
            
                    <button
                        type="submit"
                        className="w-full bg-purple-400 text-white py-3 rounded-lg hover:bg-purple-700 transition"
                    >
                        <strong>Criar conta</strong> 
                    </button>

                    <div className="flex gap-2 justify-center">
                        <p className="text-sm">Já tem conta?</p>
                        <a href="#" onClick={()=> navigate("/login")} className="text-sm text-purple-600 hover:underline">Acessar</a>
                    </div>
                </form>
            </div>
        </div>
    );
}
