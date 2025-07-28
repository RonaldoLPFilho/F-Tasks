import { useState } from "react";
import { FloatingLabelInput } from "../../../components/FloatingLabelInput";
import { PasswordStrengthBar } from "../../auth/components/PasswordStrengthBar";
import { div } from "framer-motion/client";
import { CodeConfirmation } from "./CodeConfirmation";

export function PasswordSettings() {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [passError, setPassError] = useState(false);

  const [isConfirmationPhase, setIsCofirmationPage] = useState(false);
  const [confirmationCode, setConfirmationCode] = useState("");

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword.match(passwordConfirmation)) {
      setIsCofirmationPage(true)
    } else {
      setPassError(true);
    }
  };

  const handleConfirmOldPassword = async () => {

  };

  return (
    <form
      className="flex flex-col gap-4 rounded-lg p-4"
      onSubmit={handleResetPassword}
    >
      {!isConfirmationPhase ? (
        <div className="flex flex-col gap-4 rounded-lg p-4">
          <FloatingLabelInput
            id="old_password"
            label="Senha Atual"
            showPasswordToggle
            required
            onChange={(e) => setOldPassword(e.target.value)}
          />

          <FloatingLabelInput
            id="new_password"
            label="Nova senha"
            showPasswordToggle
            required
            onChange={(e) => setNewPassword(e.target.value)}
          />

          <FloatingLabelInput
            id="pass_confirmation"
            label="Confirme a senha"
            showPasswordToggle
            required
            onChange={(e) => setPasswordConfirmation(e.target.value)}
            hasError={passError}
            errorMessage="As senhas não são iguais"
            onFocus={() => setPassError(false)}
          />

          <div className="mt-4">
            <PasswordStrengthBar password={newPassword} />
          </div>

          <button
            type="submit"
            className="bg-purple-600 hover:bg-purple-700 text-white py-2 rounded font-semibold"
          >
            Alterar senha
          </button>
        </div>
      ) : (
        <div>
          <CodeConfirmation/>
        </div>
      )}
    </form>
  );
}
