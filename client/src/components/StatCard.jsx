export default function StatCard({ label, value, accent = 'ink', icon: Icon }) {
  const accentClass = {
    ink: 'text-slate-900',
    ledger: 'text-emerald-600',
    gold: 'text-amber-600',
    rust: 'text-orange-600',
  }[accent];

  return (
    <div className="rounded-[28px] card-surface p-6 border border-slate-200">
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.25em] text-slate-500 mb-3">{label}</p>
          <p className={`font-display text-4xl font-semibold ${accentClass}`}>{value}</p>
        </div>
        {Icon ? (
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-slate-100 text-slate-700">
            <Icon size={20} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
