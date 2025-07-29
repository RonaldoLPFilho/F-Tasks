import { useEffect, useState } from "react";
import { getUserEmail } from "../../auth/services/ResetPasswordService";
import CodeInput from "../../../components/CodeInput";

export function CodeConfirmation(){


    const [email, setEmail] = useState("");

    useEffect(() => {
        const obtainUserEmail = async() => {
            try{

                const userEmail = await getUserEmail();
                setEmail(userEmail);

            }catch(err){
                console.error(err);
            }

        } 
        obtainUserEmail()
    }, [])


    return (
        <div className="flex flex-col gap-4 rounded-lg p-4">
            <h1 className="text-2xl ">Confirmação de segurança</h1>
            <p className="text-sm text-gray-600">Por favor entre com o código de segurança enviado para o endereço abaixo: </p>
            <p className="font-bold text-sm">{email}</p>
            <CodeInput/>
        </div>
    )
}