export function LoginPage() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-100 to-green-100">
            <div className="bg-white rounded-2xl shadow-lg p-8 w-full max-w-md">
                <div className="flex flex-col items-center mb-6">
                    <div className="bg-green-100 text-green-700 rounded-full p-3 mb-2">
                        ✅
                    </div>
                    <h1 className="text-2xl font-semibold text-gray-800">Login</h1>
                </div>

                <form className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm text-gray-600">Email</label>
                        <input
                            type="email"
                            id="email"
                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>
                    <div>
                        <label htmlFor="password" className="block text-sm text-gray-600">Senha</label>
                        <input
                            type="password"
                            id="password"
                            className="w-full border border-gray-300 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-green-500"
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition"
                    >
                        Entrar
                    </button>

                    <div className="text-right text-sm">
                        <a href="#" className="text-green-600 hover:underline">Esqueceu a senha?</a>
                    </div>
                </form>
            </div>
        </div>
    )
}