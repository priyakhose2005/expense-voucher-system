import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FileStack, FileClock, Clock3, CheckCircle2, XCircle, Wallet, Plus } from 'lucide-react';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';

export default function EmployeeDashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard').then((res) => setData(res.data));
  }, []);

  if (!data) return <p className="text-slate-500">Loading dashboard…</p>;

  return (
    <div className="space-y-8">
      <section className="rounded-[32px] card-surface overflow-hidden p-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-slate-500 mb-3">Welcome back</p>
            <h2 className="text-4xl font-semibold text-slate-900">{user.name}</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600 max-w-2xl">
              Your expense dashboard gives you a quick view of submitted vouchers, approval status, and claim totals.
            </p>
          </div>
          <Link
            to="/vouchers/new"
            className="inline-flex items-center justify-center rounded-full bg-emerald-500 px-6 py-3 text-sm font-semibold text-white shadow-lg shadow-emerald-500/20 transition hover:bg-emerald-600"
          >
            <Plus size={16} className="mr-2" /> Create Voucher
          </Link>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <StatCard label="Total Vouchers" value={data.totalVouchers} accent="ink" icon={FileStack} />
        <StatCard label="Draft Vouchers" value={data.draft} accent="gold" icon={FileClock} />
        <StatCard label="Pending Approval" value={data.pendingApproval} accent="gold" icon={Clock3} />
        <StatCard label="Approved Vouchers" value={data.approved} accent="ledger" icon={CheckCircle2} />
        <StatCard label="Rejected Vouchers" value={data.rejected} accent="rust" icon={XCircle} />
        <StatCard label="Total Amount Claimed" value={`$${Number(data.totalAmountClaimed).toLocaleString()}`} accent="ink" icon={Wallet} />
      </section>
    </div>
  );
}
