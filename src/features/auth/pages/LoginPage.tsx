import { useContext, useEffect, useState } from "react";
import { login } from "../services/LoginService";
import { AuthContext } from "../contexts/AuthContext";
import { Link, useNavigate } from "react-router-dom";
import { FloatingLabelInput } from "../../../components/FloatingLabelInput";
import { forgotPassword } from "../../auth/services/ResetPasswordService";
import { useToast } from "../../../components/toast/ToastProvider";
import { extractApiErrorMessage } from "../../../utils/extractApiErrorMessage";

export function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [hasEmailError, setHasEmailError] = useState(false);
    const { login: doLogin, isAuthenticated } = useContext(AuthContext);
    const navigate = useNavigate();
    const { showError, showSuccess } = useToast();

    useEffect(() => {
        if (isAuthenticated) {
          navigate("/tasks");
        }
      }, [isAuthenticated, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        try{
            const response = await login({email, password});
            doLogin(response.data.token, response.data.username);
            navigate("/tasks")
        }catch(err){
            showError(extractApiErrorMessage(err, "Credenciais inválidas."));
        }
    }

    const handleForgot = async() => {
        if(email.length < 1){
            setHasEmailError(true);
        }
        else{
            setHasEmailError(false);
            try {
                await forgotPassword(email);
                showSuccess("Email de recuperação enviado com sucesso.");
            } catch (err) {
                showError(extractApiErrorMessage(err, "Não foi possível enviar o email de recuperação."));
            }
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
                        <button type="button" onClick={handleForgot} className="text-purple-600 hover:underline">Esqueceu a senha?</button>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-purple-400 text-white py-3 rounded-lg hover:bg-purple-700 transition"
                    >
                        Entrar
                    </button>

       

                    <div className="flex gap-2 justify-center">
                        <p className="text-sm">Ainda não tem uma conta?</p>
                        <Link to="/register" className="text-sm text-purple-600 hover:underline">Cadastre-se</Link>
                    </div>
                </form>
            </div>
        </div>
    )
}
