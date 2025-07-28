import { MoveLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

export function CodeConfirmation(){
    
    

    return (
        <div className="flex flex-col gap-4 rounded-lg p-4">
            <h1 className="text-2xl ">Confirmação de segurança</h1>
            <p className="text-sm text-gray-600">Por favor entre com o código de segurança enviado para o endereço abaixo: </p>
        </div>
    )
}