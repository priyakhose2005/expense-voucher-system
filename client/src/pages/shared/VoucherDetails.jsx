import { useEffect, useState, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axiosInstance';
import { useAuth } from '../../context/AuthContext';
import StatusStamp from '../../components/StatusStamp';
import SignatureUpload from '../../components/SignatureUpload';

function formatCurrency(amount) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
}

function Field({ label, value }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-wide font-mono text-ink-soft mb-1">{label}</p>
      <p className="text-sm">{value ?? '—'}</p>
    </div>
  );
}

export default function VoucherDetails() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState(null);
  const [error, setError] = useState(null);
  const [busy, setBusy] = useState(false);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);

  const fetchVoucher = useCallback(async () => {
    const res = await api.get(`/vouchers/${id}`);
    setVoucher(res.data);
    return res.data;
  }, [id]);

  useEffect(() => {
    fetchVoucher();
  }, [fetchVoucher]);

  if (!voucher) return <p className="text-ink-soft">Loading…</p>;

  const isOwner = user.role === 'employee' && voucher.employeeId === user.id;
  const isDraft = voucher.status === 'draft';
  const isPending = voucher.status === 'pending_approval' || voucher.status === 'submitted';

  const uploadSignature = async (file) => {
    const fd = new FormData();
    fd.append('signature', file);
    const res = await api.post(`/vouchers/${id}/signature`, fd);
    return res.data;
  };

  const handleEmployeeSignatureUpload = async (file) => {
    try {
      setBusy(true);
      setError(null);
      await uploadSignature(file);
      await fetchVoucher();
    } finally {
      setBusy(false);
    }
  };

  const handleDirectorSignatureUpload = async (file) => {
    try {
      setBusy(true);
      setError(null);
      await uploadSignature(file);
      await fetchVoucher();
    } finally {
      setBusy(false);
    }
  };

  const handleSubmit = async () => {
    setBusy(true);
    setError(null);
    try {
      await api.post(`/vouchers/${id}/submit`);
      await fetchVoucher();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit voucher.');
    } finally {
      setBusy(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this draft voucher? This cannot be undone.')) return;
    setBusy(true);
    try {
      await api.delete(`/vouchers/${id}`);
      navigate('/vouchers');
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete voucher.');
      setBusy(false);
    }
  };

  const handleApprove = async (file) => {
    setBusy(true);
    setError(null);
    try {
      const fd = new FormData();
      if (file) fd.append('signature', file);
      await api.post(`/vouchers/${id}/approve`, fd);
      await fetchVoucher();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to approve voucher.');
    } finally {
      setBusy(false);
    }
  };

  const handleReject = async () => {
    if (!rejectionReason.trim()) {
      setError('Rejection reason is mandatory.');
      return;
    }
    setBusy(true);
    setError(null);
    try {
      await api.post(`/vouchers/${id}/reject`, { rejectionReason });
      await fetchVoucher();
      setShowRejectForm(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reject voucher.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-5xl space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <p className="font-mono text-xs text-ink-soft mb-1">Voucher #{voucher.voucherNumber}</p>
          <p className="font-display text-3xl font-semibold text-slate-900">{voucher.expenseTitle}</p>
          <p className="text-sm text-slate-500 mt-2">{voucher.expenseDescription || 'No description provided.'}</p>
        </div>
        <div className="flex items-center gap-3">
          <StatusStamp status={voucher.status} />
          <div className="text-right text-sm text-slate-500">
            <p>Created {new Date(voucher.createdAt).toLocaleDateString()}</p>
            <p>Updated {new Date(voucher.updatedAt).toLocaleDateString()}</p>
          </div>
        </div>
      </div>

      <section className="bg-white border border-paper-line rounded-sm p-6 grid gap-6 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-soft mb-4">Basic Information</p>
          <div className="grid gap-4">
            <Field label="Voucher Date" value={voucher.voucherDate} />
            <Field label="Expense Date" value={voucher.expenseDate} />
            <Field label="Department" value={voucher.department} />
            <Field label="Expense Category" value={voucher.expenseCategory} />
            <Field label="Amount" value={formatCurrency(voucher.amount)} />
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-soft mb-4">Employee Information</p>
          <div className="grid gap-4">
            <Field label="Employee Name" value={voucher.employee?.name} />
            <Field label="Employee ID" value={voucher.employee?.employeeId || voucher.employee?.id} />
            <SignatureUpload
              label="Employee Signature"
              existingUrl={voucher.employeeSignatureUrl}
              disabled={!(isOwner && isDraft)}
              onUpload={handleEmployeeSignatureUpload}
            />
          </div>
        </div>
      </section>

      <section className="bg-white border border-paper-line rounded-sm p-6 grid gap-6 md:grid-cols-2">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-soft mb-4">Approval Information</p>
          <div className="grid gap-4">
            <Field label="Current Status" value={voucher.status === 'submitted' ? 'Pending Approval' : voucher.status} />
            <Field label="Approval Date" value={voucher.approvalDate || '—'} />
            <Field label="Rejection Reason" value={voucher.rejectionReason || '—'} />
            <SignatureUpload
              label="Director Signature"
              existingUrl={voucher.directorSignatureUrl}
              disabled={!(user.role === 'director' && isPending)}
              onUpload={handleDirectorSignatureUpload}
            />
          </div>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-ink-soft mb-4">Audit Information</p>
          <div className="grid gap-4">
            <Field label="Created Date" value={new Date(voucher.createdAt).toLocaleString()} />
            <Field label="Last Updated" value={new Date(voucher.updatedAt).toLocaleString()} />
          </div>
        </div>
      </section>

      {voucher.status === 'rejected' && voucher.rejectionReason && (
        <div className="bg-rust-soft border border-rust/30 rounded-sm p-4">
          <p className="text-xs uppercase tracking-wide font-mono text-rust mb-1">Rejection Reason</p>
          <p className="text-sm text-slate-700">{voucher.rejectionReason}</p>
        </div>
      )}

      {error && <p className="text-sm text-rust mb-4">{error}</p>}

      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={() => window.print()}
          className="text-sm font-medium border border-slate-300 text-slate-700 rounded-sm px-4 py-2 hover:bg-slate-100 transition-colors"
        >
          Print / Download Voucher
        </button>
        {isOwner && isDraft && (
          <>
            <button onClick={() => navigate(`/vouchers/${id}/edit`)} disabled={busy} className="text-sm font-medium border border-navy text-navy rounded-sm px-4 py-2 hover:bg-navy hover:text-white transition-colors">
              Edit Voucher
            </button>
            <button onClick={handleSubmit} disabled={busy || !voucher.employeeSignatureUrl} title={!voucher.employeeSignatureUrl ? 'Upload your signature first' : ''} className="text-sm font-medium bg-navy text-white rounded-sm px-4 py-2 hover:bg-navy-deep transition-colors disabled:opacity-40">
              Submit for Approval
            </button>
            <button onClick={handleDelete} disabled={busy} className="text-sm font-medium text-rust rounded-sm px-4 py-2 hover:bg-rust-soft transition-colors">
              Delete Draft
            </button>
          </>
        )}

        {user.role === 'director' && isPending && !showRejectForm && (
          <>
            <ApproveButton busy={busy} hasSignature={!!voucher.directorSignatureUrl} onApprove={handleApprove} />
            <button onClick={() => setShowRejectForm(true)} disabled={busy} className="text-sm font-medium border border-rust text-rust rounded-sm px-4 py-2 hover:bg-rust-soft transition-colors">
              Reject
            </button>
          </>
        )}
      </div>

      {showRejectForm && (
        <div className="bg-white border border-paper-line rounded-sm p-5 mt-4">
          <label className="block text-xs uppercase tracking-wide font-mono text-ink-soft mb-1.5">Rejection Reason *</label>
          <textarea
            className="w-full border border-paper-line rounded-sm px-3 py-2 text-sm outline-none focus:border-navy mb-3"
            rows={3}
            value={rejectionReason}
            onChange={(e) => setRejectionReason(e.target.value)}
            placeholder="Explain why this voucher is being rejected…"
          />
          <div className="flex gap-3 flex-wrap">
            <button onClick={handleReject} disabled={busy} className="text-sm font-medium bg-rust text-white rounded-sm px-4 py-2 hover:opacity-90 transition-opacity">
              Confirm Rejection
            </button>
            <button onClick={() => setShowRejectForm(false)} className="text-sm font-medium text-ink-soft px-4 py-2">
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function ApproveButton({ busy, hasSignature, onApprove }) {
  if (hasSignature) {
    return (
      <button onClick={() => onApprove(null)} disabled={busy} className="text-sm font-medium bg-ledger text-white rounded-sm px-4 py-2 hover:opacity-90 transition-opacity">
        Approve
      </button>
    );
  }
  return (
    <label className="text-sm font-medium bg-ledger text-white rounded-sm px-4 py-2 hover:opacity-90 transition-opacity cursor-pointer">
      Approve (upload signature)
      <input
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="hidden"
        onChange={(e) => e.target.files?.[0] && onApprove(e.target.files[0])}
      />
    </label>
  );
}
