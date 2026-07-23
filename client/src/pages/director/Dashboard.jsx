import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../api/axiosInstance';
import StatCard from '../../components/StatCard';
import VoucherTable from '../../components/VoucherTable';

export default function DirectorDashboard() {
  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/dashboard').then((res) => setData(res.data));
  }, []);

  if (!data) return <p className="text-ink-soft">Loading dashboard…</p>;

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <p className="font-display text-2xl">Director Dashboard</p>
          <p className="text-sm text-ink-soft">Approval activity across the organization.</p>
        </div>
        <Link to="/pending" className="bg-navy text-white text-sm font-medium rounded-sm px-4 py-2 hover:bg-navy-deep transition-colors">
          View Pending Approvals
        </Link>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <StatCard label="Pending Approval" value={data.pendingApprovalCount} accent="gold" />
        <StatCard label="Approved Today" value={data.approvedToday} accent="ledger" />
        <StatCard label="Rejected Today" value={data.rejectedToday} accent="rust" />
        <StatCard label="Total Pending Amount" value={`$${Number(data.totalPendingAmount).toLocaleString()}`} accent="ink" />
      </div>
      <p className="font-display text-lg mb-3">Recent Voucher Activity</p>
      {data.recentActivity?.length ? (
        <VoucherTable vouchers={data.recentActivity} showEmployee />
      ) : (
        <div className="bg-white border border-paper-line rounded-sm p-8 text-center text-slate-500">
          No recent voucher activity available yet.
        </div>
      )}
    </div>
  );
}
