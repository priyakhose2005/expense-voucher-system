const QUICK_PRESETS = [
  { label: 'All Vouchers', filters: { status: '', showDeleted: false, sortBy: 'voucherNumber', sortOrder: 'ASC' } },
  { label: 'Pending Approval', filters: { status: 'pending_approval', showDeleted: false, sortBy: 'voucherNumber', sortOrder: 'ASC' } },
  { label: 'My Drafts', filters: { status: 'draft', showDeleted: false, sortBy: 'voucherNumber', sortOrder: 'ASC' } },
  { label: 'Recently Updated', filters: { status: '', showDeleted: false, sortBy: 'createdAt', sortOrder: 'DESC' } },
];

export default function QuickFilterBar({ onPreset }) {
  return (
    <div className="flex flex-wrap gap-2 mb-4">
      {QUICK_PRESETS.map((preset) => (
        <button
          key={preset.label}
          type="button"
          onClick={() => onPreset(preset.filters)}
          className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 transition"
        >
          {preset.label}
        </button>
      ))}
    </div>
  );
}
