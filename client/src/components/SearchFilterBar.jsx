import { useEffect, useState } from 'react';
import { defaultListFilters } from '../utils/filterParams';

const STATUS_OPTIONS = [
  { value: '', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'pending_approval', label: 'Pending Approval' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'deleted', label: 'Deleted' },
];

export default function SearchFilterBar({ onChange, showEmployeeFilter = false, showDeletedFilter = false, initialFilters = {} }) {
  const [filters, setFilters] = useState({ ...defaultListFilters, ...initialFilters });

  useEffect(() => {
    setFilters({ ...defaultListFilters, ...initialFilters });
  }, [initialFilters]);

  const update = (key, value) => {
    const next = { ...filters, [key]: value };
    setFilters(next);
    onChange(next);
  };

  const clearFilters = () => {
    const next = { ...defaultListFilters };
    setFilters(next);
    onChange(next);
  };

  const inputClass = 'border border-paper-line rounded-sm px-3 py-2 text-sm bg-white focus:border-navy outline-none';

  return (
    <div className="bg-white border border-paper-line rounded-sm p-4 mb-4">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <input className={inputClass} placeholder="Voucher #" value={filters.voucherNumber} onChange={(e) => update('voucherNumber', e.target.value)} />
        {showEmployeeFilter && (
          <input className={inputClass} placeholder="Employee name" value={filters.employeeName} onChange={(e) => update('employeeName', e.target.value)} />
        )}
        <input className={inputClass} placeholder="Department" value={filters.department} onChange={(e) => update('department', e.target.value)} />
        <input className={inputClass} placeholder="Category" value={filters.category} onChange={(e) => update('category', e.target.value)} />
        {showDeletedFilter && (
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input
              type="checkbox"
              className="h-4 w-4 rounded border-paper-line text-navy focus:ring-navy"
              checked={filters.showDeleted}
              onChange={(e) => update('showDeleted', e.target.checked)}
            />
            Include deleted
          </label>
        )}
        <select className={inputClass} value={filters.status} onChange={(e) => update('status', e.target.value)}>
          {STATUS_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <input type="date" className={inputClass} value={filters.dateFrom} onChange={(e) => update('dateFrom', e.target.value)} title="Expense date from" />
        <input type="date" className={inputClass} value={filters.dateTo} onChange={(e) => update('dateTo', e.target.value)} title="Expense date to" />
        <input type="number" className={inputClass} placeholder="Min amount" value={filters.amountMin} onChange={(e) => update('amountMin', e.target.value)} />
        <input type="number" className={inputClass} placeholder="Max amount" value={filters.amountMax} onChange={(e) => update('amountMax', e.target.value)} />
        <select className={inputClass} value={`${filters.sortBy}:${filters.sortOrder}`} onChange={(e) => {
          const [sortBy, sortOrder] = e.target.value.split(':');
          update('sortBy', sortBy);
          update('sortOrder', sortOrder);
        }}>
          <option value="createdAt:DESC">Newest first</option>
          <option value="createdAt:ASC">Oldest first</option>
          <option value="amount:DESC">Amount: High to Low</option>
          <option value="amount:ASC">Amount: Low to High</option>
          <option value="expenseDate:DESC">Expense date: Newest</option>
          <option value="voucherNumber:ASC">Voucher #</option>
        </select>
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={clearFilters}
          className="rounded-full border border-slate-300 bg-slate-50 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
        >
          Clear Filters
        </button>
      </div>
    </div>
  );
}
