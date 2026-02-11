import { useAuth } from '../auth/AuthContext'

export default function LoginPage() {
  const { login } = useAuth()

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-white/[0.03] backdrop-blur-xl border border-white/[0.06] rounded-2xl p-10 max-w-sm w-full text-center shadow-2xl">
        <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-gradient-to-br from-emerald-500 to-emerald-700 flex items-center justify-center font-bold text-white text-2xl shadow-[0_0_30px_rgba(16,185,129,0.3)]">
          Z
        </div>
        <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">zesFin</h1>
        <p className="text-slate-400 text-sm mb-8">Boglehead Portfolio Tracker</p>

        <button
          onClick={login}
          className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-white/[0.07] hover:bg-white/[0.12] border border-white/[0.1] rounded-xl text-white font-medium transition-all duration-200 cursor-pointer"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          Sign in with Google
        </button>
      </div>
    </div>
  )
}
