import { useEffect, useMemo, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../api/axiosInstance';
import VoucherTable from '../../components/VoucherTable';
import SearchFilterBar from '../../components/SearchFilterBar';
import StatusSummaryBar from '../../components/StatusSummaryBar';
import ExportCSVButton from '../../components/ExportCSVButton';
import QuickFilterBar from '../../components/QuickFilterBar';
import { buildSearchParams, defaultListFilters, parseFilterParams } from '../../utils/filterParams';

export default function PendingApprovals() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState(() => parseFilterParams(searchParams));

  const normalizeFilters = (next) => ({ ...defaultListFilters, ...next, status: next.status || 'pending_approval' });

  const fetchVouchers = useCallback(async (nextFilters = parseFilterParams(searchParams)) => {
    const normalized = normalizeFilters(nextFilters);
    setLoading(true);
    setFilters(normalized);
    setSearchParams(buildSearchParams(normalized), { replace: true });
    const params = Object.fromEntries(
      Object.entries(normalized).filter(([, v]) => v !== '' && v !== false && v != null)
    );
    const res = await api.get('/vouchers', { params });
    setVouchers(res.data);
    setLoading(false);
  }, [searchParams, setSearchParams]);

  useEffect(() => {
    fetchVouchers(parseFilterParams(searchParams));
  }, [searchParams, fetchVouchers]);

  const counts = useMemo(() => vouchers.reduce((acc, voucher) => {
    const status = voucher.status || 'unknown';
    acc[status] = (acc[status] || 0) + 1;
    return acc;
  }, {}), [vouchers]);

  return (
    <div>
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between mb-4">
        <div>
          <p className="font-display text-2xl mb-1">Pending Approvals</p>
          <p className="text-sm text-ink-soft">Vouchers awaiting your decision.</p>
        </div>
        <ExportCSVButton vouchers={vouchers} fileName="pending-approvals.csv" />
      </div>

      <StatusSummaryBar counts={counts} />
      <QuickFilterBar onPreset={fetchVouchers} />
      <SearchFilterBar onChange={fetchVouchers} initialFilters={filters} showEmployeeFilter />

      {loading ? <p className="text-ink-soft">Loading…</p> : <VoucherTable vouchers={vouchers} showEmployee />}
    </div>
  );
}
