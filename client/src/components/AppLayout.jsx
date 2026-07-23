import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const NAV_BY_ROLE = {
  employee: [
    { to: '/', label: 'Dashboard' },
    { to: '/vouchers/new', label: 'Create Voucher' },
    { to: '/vouchers', label: 'My Vouchers' },
  ],
  director: [
    { to: '/', label: 'Dashboard' },
    { to: '/pending', label: 'Pending Approvals' },
    { to: '/vouchers', label: 'All Vouchers' },
  ],
  accounts: [
    { to: '/', label: 'Dashboard' },
    { to: '/vouchers', label: 'All Vouchers' },
  ],
};

export default function AppLayout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const items = NAV_BY_ROLE[user.role] || [];
  const profileEmail = user.email || user.username || '';
  const initials = (user.name || user.email || user.role || 'U')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  const handleLogoutConfirm = () => {
    logout();
    setConfirmLogout(false);
    navigate('/login');
  };

  return (
    <div className="min-h-screen flex dashboard-shell text-slate-900">
      <aside className="w-72 shrink-0 bg-slate-950 text-slate-100 flex flex-col">
        <div className="px-8 py-8 border-b border-white/10">
          <p className="font-display text-2xl leading-tight tracking-tight">Expense Voucher System</p>
          <p className="text-sm text-slate-400 mt-2">Your expense workflow from submission through approval.</p>
          <div className="mt-6 flex items-center gap-4 rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-slate-800 text-lg font-semibold text-white">
              {initials}
            </div>
            <div>
              <p className="text-sm font-semibold text-white leading-5">{user.name}</p>
              <p className="text-xs text-slate-400 leading-5">{profileEmail}</p>
              <p className="text-xs uppercase tracking-[0.25em] text-slate-500 mt-1">{user.role}</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {items.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `block rounded-2xl px-5 py-3 text-sm font-medium transition ${
                  isActive
                    ? 'bg-slate-800 text-white border-l-4 border-emerald-400'
                    : 'text-slate-300 hover:bg-slate-800 hover:text-white border-l-4 border-transparent'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="px-8 py-6 border-t border-white/10">
          <p className="text-sm font-semibold text-white">{user.name}</p>
          <p className="text-xs text-slate-400 capitalize">{user.role} · {user.department || 'Finance'}</p>
          <button
            onClick={() => setConfirmLogout(true)}
            className="mt-4 inline-flex items-center justify-center rounded-full border border-emerald-400 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-300 hover:bg-slate-800 transition"
          >
            Log out
          </button>
          {confirmLogout && (
            <div className="logout-modal-backdrop">
              <div className="logout-modal">
                <h2 className="text-xl font-semibold text-slate-900">Confirm logout</h2>
                <p className="mt-3 text-sm leading-6 text-slate-600">
                  Are you sure you want to logout? You will need to sign in again to access your dashboard.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-end">
                  <button
                    type="button"
                    onClick={() => setConfirmLogout(false)}
                    className="rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleLogoutConfirm}
                    className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition"
                  >
                    Logout
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </aside>

      <div className="flex-1 dashboard-main overflow-auto">
        <div className="border-b border-slate-200 bg-white/90 px-8 py-5 backdrop-blur-sm">
          <div className="mx-auto flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between max-w-7xl">
            <div>
              <p className="text-sm text-slate-500">Expense Voucher Management System</p>
              <h1 className="text-3xl font-semibold text-slate-900">ABC Company</h1>
              <p className="text-sm text-slate-600 max-w-2xl">
                Role-based voucher tracking for employees, directors, and accounts team members.
              </p>
            </div>
            <div className="space-y-1 text-right">
              <p className="text-sm text-slate-500">Signed in as</p>
              <p className="text-base font-semibold text-slate-900">{user.name}</p>
              <p className="text-sm text-slate-500 capitalize">{user.role}</p>
            </div>
          </div>
        </div>
        <main className="max-w-7xl mx-auto px-8 py-8">{children}</main>
      </div>
    </div>
  );
}
