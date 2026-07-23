import { useNavigate } from 'react-router-dom';
import StatusStamp from './StatusStamp';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

export default function VoucherTable({ vouchers, showEmployee = false, onDelete }) {
  const navigate = useNavigate();
  const sortedVouchers = [...vouchers].sort((a, b) => {
    const aNum = Number(a.voucherNumber);
    const bNum = Number(b.voucherNumber);
    if (!Number.isNaN(aNum) && !Number.isNaN(bNum)) return aNum - bNum;
    return String(a.voucherNumber).localeCompare(String(b.voucherNumber), undefined, { numeric: true });
  });

  if (!sortedVouchers.length) {
    return (
      <div className="bg-white border border-paper-line rounded-sm p-10 text-center">
        <p className="font-display text-lg text-ink-soft">No vouchers to show.</p>
        <p className="text-sm text-ink-soft mt-1">Nothing matches yet — try adjusting your filters.</p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-paper-line rounded-sm overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-paper-line text-left font-mono text-xs uppercase tracking-wide text-ink-soft">
            <th className="px-4 py-3">Voucher #</th>
            {showEmployee && <th className="px-4 py-3">Employee</th>}
            <th className="px-4 py-3">Title</th>
            <th className="px-4 py-3">Department</th>
            <th className="px-4 py-3">Expense Date</th>
            <th className="px-4 py-3 text-right">Amount</th>
            <th className="px-4 py-3">Status</th>
            {onDelete && <th className="px-4 py-3 text-center">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {vouchers.map((v) => (
            <tr
              key={v.id}
              onClick={() => navigate(`/vouchers/${v.id}`)}
              className="border-b border-paper-line last:border-0 hover:bg-paper cursor-pointer transition-colors"
            >
              <td className="px-4 py-3 font-mono text-xs">{v.voucherNumber}</td>
              {showEmployee && <td className="px-4 py-3">{v.employee?.name || '—'}</td>}
              <td className="px-4 py-3">{v.expenseTitle}</td>
              <td className="px-4 py-3 text-ink-soft">{v.department}</td>
              <td className="px-4 py-3 text-ink-soft">{v.expenseDate}</td>
              <td className="px-4 py-3 text-right font-mono">{formatCurrency(v.amount)}</td>
              <td className="px-4 py-3"><StatusStamp status={v.status} /></td>
              {onDelete && (
                <td className="px-4 py-3 text-center">
                  {v.status !== 'deleted' ? (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDelete(v.id);
                      }}
                      className="text-xs font-semibold text-rust underline-offset-2 hover:text-rust-dark"
                    >
                      Delete
                    </button>
                  ) : (
                    <span className="text-xs text-slate-400">Deleted</span>
                  )}
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
