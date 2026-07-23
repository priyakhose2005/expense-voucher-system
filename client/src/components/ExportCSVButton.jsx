import { useMemo } from 'react';

function escapeValue(value) {
  if (value == null) return '';
  const normalized = String(value).replace(/"/g, '""');
  return `"${normalized}"`;
}

export default function ExportCSVButton({ vouchers, fileName = 'vouchers.csv' }) {
  const csvData = useMemo(() => {
    if (!vouchers?.length) return null;

    const headers = [
      'Voucher #',
      'Employee',
      'Title',
      'Department',
      'Expense Date',
      'Amount',
      'Status',
      'Created At',
      'Updated At',
    ];

    const rows = vouchers.map((voucher) => [
      voucher.voucherNumber,
      voucher.employee?.name || '',
      voucher.expenseTitle,
      voucher.department,
      voucher.expenseDate,
      voucher.amount,
      voucher.status,
      voucher.createdAt,
      voucher.updatedAt,
    ]);

    return [headers, ...rows].map((row) => row.map(escapeValue).join(',')).join('\r\n');
  }, [vouchers]);

  const downloadCsv = () => {
    if (!csvData) return;
    const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = fileName;
    anchor.click();
    URL.revokeObjectURL(url);
  };

  if (!csvData) return null;

  return (
    <button
      type="button"
      onClick={downloadCsv}
      className="inline-flex items-center justify-center rounded-full border border-slate-300 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-100 transition"
    >
      Export CSV
    </button>
  );
}
