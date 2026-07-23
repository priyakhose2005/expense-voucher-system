const STYLES = {
  draft: { label: 'Draft', border: 'border-ink-soft', text: 'text-ink-soft', bg: 'bg-white' },
  submitted: { label: 'Submitted', border: 'border-gold', text: 'text-gold', bg: 'bg-gold-soft' },
  pending_approval: { label: 'Pending Approval', border: 'border-gold', text: 'text-gold', bg: 'bg-gold-soft' },
  approved: { label: 'Approved', border: 'border-ledger', text: 'text-ledger', bg: 'bg-ledger-soft' },
  rejected: { label: 'Rejected', border: 'border-rust', text: 'text-rust', bg: 'bg-rust-soft' },
  deleted: { label: 'Deleted', border: 'border-slate-300', text: 'text-slate-700', bg: 'bg-slate-100' },
};

export default function StatusStamp({ status }) {
  const s = STYLES[status] || STYLES.draft;
  return (
    <span className={`stamp ${s.border} ${s.text} ${s.bg}`}>
      {s.label}
    </span>
  );
}
