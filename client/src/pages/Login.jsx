import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const { login, loading, error } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await login(email, password);
      navigate('/');
    } catch {
      // error surfaced via context
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 login-bg">
      <div className="w-full max-w-6xl rounded-[32px] overflow-hidden shadow-2xl bg-white/95 backdrop-blur-xl">
        <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="hidden lg:flex items-center justify-center bg-slate-50 p-16">
            <div className="w-full max-w-sm rounded-[32px] bg-white p-10 shadow-xl border border-slate-200">
              <div className="flex items-center justify-center mb-8">
                <div className="w-28 h-28 rounded-full bg-slate-100 flex items-center justify-center shadow-inner">
                  <span className="text-5xl">💻</span>
                </div>
              </div>
              <div className="space-y-4 text-center">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500">Full Stack Developer Internship</p>
                <h2 className="text-3xl font-semibold text-slate-900">Expense Voucher Management System</h2>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Login to manage expense vouchers, approvals, and reimbursement workflows.
                </p>
              </div>
            </div>
          </div>

          <div className="px-8 py-10 sm:px-12 sm:py-14 bg-white">
            <div className="max-w-md mx-auto">
              <div className="mb-8">
                <p className="text-sm uppercase tracking-[0.35em] text-slate-500 mb-3">Expense Voucher Login</p>
                <h1 className="text-4xl font-semibold text-slate-900 mb-3">Welcome back</h1>
                <p className="text-sm text-slate-500">
                  Log in to access your role-based dashboard, create vouchers, review approvals, and track reimbursement status.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Email</label>
                  <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200">
                    <span className="text-slate-400">📧</span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-transparent outline-none text-sm text-slate-900"
                      placeholder="you@company.com"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Password</label>
                  <div className="flex items-center gap-3 rounded-full border border-slate-200 bg-slate-50 px-4 py-3 focus-within:border-slate-400 focus-within:ring-2 focus-within:ring-slate-200">
                    <span className="text-slate-400">🔒</span>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full bg-transparent outline-none text-sm text-slate-900"
                      placeholder="••••••••"
                    />
                  </div>
                </div>
                {error && <p className="text-sm text-rust mt-1">{error}</p>}
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-full bg-ledger px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-ledger/20 transition hover:bg-[#16a34a] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? 'Signing in…' : 'LOGIN'}
                </button>
              </form>

              <div className="mt-8 rounded-3xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
                <p className="font-medium text-slate-900 mb-3">Use these credentials:</p>
                <p className="leading-7">employee@company.com / password123</p>
                <p className="leading-7">director@company.com / password123</p>
                <p className="leading-7">accounts@company.com / password123</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
