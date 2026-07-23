import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import StatCard from '../../components/StatCard';
import VoucherTable from '../../components/VoucherTable';

export default function AccountsDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard').then((res) => setData(res.data));
  }, []);

  if (!data) return <p className="text-ink-soft">Loading dashboard…</p>;

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <p className="font-display text-2xl mb-1">Accounts Team Dashboard</p>
          <p className="text-sm text-ink-soft">Monitor all vouchers, track approval status, and navigate to the full voucher registry for reimbursement review.</p>
          <p className="text-sm text-slate-500 mt-2 max-w-2xl">Use the All Vouchers page to search, filter, and sort every voucher in the organization. Review approval state, employee/director signatures, and print vouchers as needed.</p>
        </div>
        <Link
          to="/vouchers"
          className="inline-flex items-center justify-center rounded-full bg-navy px-5 py-3 text-sm font-semibold text-white hover:bg-slate-900 transition"
        >
          View All Vouchers
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Total Vouchers" value={data.totalVouchers} accent="ink" />
        <StatCard label="Pending Approval" value={data.pendingApproval} accent="gold" />
        <StatCard label="Approved Vouchers" value={data.approved} accent="ledger" />
        <StatCard label="Rejected Vouchers" value={data.rejected} accent="rust" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <StatCard label="Total Approved Expense Amount" value={`$${Number(data.totalApprovedExpenseAmount).toLocaleString()}`} accent="ledger" />
        <StatCard label="Recent Approved Vouchers" value={data.recentApprovedVouchers?.length ?? 0} accent="ink" />
      </div>
      <p className="font-display text-lg mb-3">Recently Approved</p>
      {data.recentApprovedVouchers?.length ? (
        <VoucherTable vouchers={data.recentApprovedVouchers} showEmployee />
      ) : (
        <div className="bg-white border border-paper-line rounded-sm p-8 text-center text-slate-500">
          No recently approved vouchers found.
        </div>
      )}
    </div>
  );
}
