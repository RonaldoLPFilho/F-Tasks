import { useState } from "react";
import { FloatingLabelInput } from "../components/FloatingLabelInput";
import { PasswordStrengthBar } from "../components/PasswordStrengthBar";
import { register } from "../services/RegisterService";
import { useNavigate, useParams } from "react-router-dom";


export function ResetPasswordPage() {

    const [password, setPassword] = useState("");
    const [confirPass, setConfirmPass] = useState("");

    const [hasError, setHasError] = useState(false);
  
    const navigate = useNavigate();
    const {token} = useParams<{token: string}>();




    const handleError  = () => {
        if(password !== confirPass){
            setHasError(true)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-purple-100">
            <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md relative">
                <div className="flex flex-col items-center mb-6">
                <div className="bg-purple-800 rounded-full p-6 absolute -top-13">
                        <p className="text-4xl text-center">🔏</p>
                </div>
                <h1 className="text-2xl font-semibold text-gray-800 mt-4">Criar nova senha</h1>
                <p className="text-sm text-gray-500 text-center mt-1">
                    Entre com a nova senha para <strong>recuperar</strong> sua conta
                </p>
                </div>
        
                <form 
                    className="space-y-4"
                    onSubmit={() => null}
                >
            
                    <FloatingLabelInput
                        id="password"
                        label="Nova senha"
                        showPasswordToggle
                        required
                        onChange={(e) => {
                            const value = e.target.value;
                            setPassword(value);
                            if (confirPass && value === confirPass) {
                            setHasError(false);
                            }
                        }}
                        hasError={hasError}
                    />

                    <FloatingLabelInput
                        id="confirm_password"
                        label="Confirme a senha"
                        showPasswordToggle
                        required
                        onChange={(e) => {
                            const value = e.target.value;
                            setConfirmPass(value);
                            if (password === value) {
                            setHasError(false);
                            }
                        }}
                        onBlur={() => {
                            if (password !== confirPass) {
                            setHasError(true);
                            }
                        }}
                        hasError={hasError}
                        errorMessage="As senhas não coincidem"
                    />

                    <div className="mt-4 mb-4">
                    <PasswordStrengthBar password={password} />
                    </div>
            
                    <button
                        type="submit"
                        className="w-full bg-purple-400 text-white py-3 rounded-lg hover:bg-purple-700 transition"
                    >
                        <strong>Confirmar</strong> 
                    </button>

                </form>
            </div>
        </div>
    );
}
