export default function StatusSummaryBar({ counts }) {
  const items = [
    { label: 'Draft', value: counts.draft ?? 0, accent: 'bg-slate-100 text-slate-800' },
    { label: 'Pending', value: counts.pendingApproval ?? 0, accent: 'bg-amber-100 text-amber-900' },
    { label: 'Approved', value: counts.approved ?? 0, accent: 'bg-emerald-100 text-emerald-900' },
    { label: 'Rejected', value: counts.rejected ?? 0, accent: 'bg-rose-100 text-rose-900' },
    { label: 'Deleted', value: counts.deleted ?? 0, accent: 'bg-slate-100 text-slate-700' },
  ];

  return (
    <div className="rounded-[28px] bg-white border border-paper-line p-4 grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
      {items.map((item) => (
        <div key={item.label} className="rounded-2xl p-4 border border-slate-200">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">{item.label}</p>
          <p className={`text-2xl font-semibold ${item.accent}`}>{item.value}</p>
        </div>
      ))}
    </div>
  );
}
