import { useContext, useState } from "react";
import { Modal } from "../../components/Modal";
import { AuthContext } from "../auth/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function LogoutConfirm() {
  const [confirmOpen, setConfirmOpen] = useState(true);
  const {logout} = useContext(AuthContext)
  const navigate = useNavigate();

  return (
    <Modal
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        title="Sair da conta"
      >
        <p className="text-sm text-gray-700">Realmente deseja sair da conta?</p>
        <div className="mt-6 flex justify-end gap-2">
          <button
            className="rounded-xl bg-purple-600 border px-4 py-2 text-white hover:bg-purple-500"
            onClick={() => {
              setConfirmOpen(false) 
              navigate("/ta")
            }}
          >
            NÃO
          </button>
          <button
            className="rounded-xl border px-4 py-2 text-black hover:bg-red-500"
            onClick={() => logout()}
          >
            SIM
          </button>
        </div>
      </Modal>
  )

}