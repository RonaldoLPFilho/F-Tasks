import { useContext, useEffect, useState } from "react";
import { login } from "../services/LoginService";
import { AuthContext } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { FloatingLabelInput } from "../components/FloatingLabelInput";
import { forgotPassword } from "../services/ResetPasswordService";

export function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [hasEmailError, setHasEmailError] = useState(false);
    const { login: doLogin, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        if (isAuthenticated) {
          navigate("/tasks");
        }
      }, [isAuthenticated]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try{
            const response = await login({email, password});
            doLogin(response.data.token, response.data.username);
            navigate("/tasks")
        }catch(err){
            console.error(err);
            alert("Poss;ivel credencial inválida")
        }
    }

    const handleForgot = async() => {
        if(email.length < 1){
            setHasEmailError(true);
        }
        else{
            setHasEmailError(false);
            await forgotPassword(email);
            alert("Email enviado com sucesso!")
        }   
    }


    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-purple-100">
            <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md relative">
                <div className="flex flex-col items-center mb-6">
                    <div className="bg-purple-800 rounded-full p-6 mb-2 absolute -top-13">
                        <p className="text-4xl text-center">🔐</p>
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-800 mt-4">Login</h1>
                    <p className="text-sm text-gray-500 text-center mt-1">
                        Entre com seus dados para <strong>acessar</strong> sua conta
                    </p>
                </div>

                <form 
                    className="space-y-4"
                    onSubmit={handleSubmit}
                >

                    <FloatingLabelInput
                        id="email"
                        type="email"
                        autoComplete="email"
                        required
                        label="Email"
                        onChange={(e) => setEmail(e.target.value)}
                        hasError={hasEmailError}
                        errorMessage="Preencha o email para recuperar a senha"
                    />


                    <FloatingLabelInput
                        id="password"
                        type="password"
                        label="Senha"
                        showPasswordToggle
                        required
                        onChange={(e) => setPassword(e.target.value)}
                        
                    />

                    <div className="text-right text-sm">
                        <a href="#" onClick={handleForgot} className="text-purple-600 hover:underline">Esqueceu a senha?</a>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-purple-400 text-white py-3 rounded-lg hover:bg-purple-700 transition"
                    >
                        Entrar
                    </button>

       

                    <div className="flex gap-2 justify-center">
                        <p className="text-sm">Ainda não tem uma conta?</p>
                        <a href="#" onClick={()=> navigate("/register")} className="text-sm text-purple-600 hover:underline">Cadastre-se</a>
                    </div>
                </form>
            </div>
        </div>
    )
}