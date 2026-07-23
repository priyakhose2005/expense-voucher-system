import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../api/axiosInstance';

const CATEGORIES = ['Travel', 'Meals', 'Accommodation', 'Office Supplies', 'Client Entertainment', 'Software & Tools', 'Other'];

const emptyForm = {
  department: '', expenseTitle: '', expenseCategory: CATEGORIES[0],
  expenseDate: '', expenseDescription: '', amount: '',
};

export default function VoucherForm() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState(null);

  useEffect(() => {
    if (isEdit) {
      api.get(`/vouchers/${id}`).then((res) => {
        const v = res.data;
        setForm({
          department: v.department, expenseTitle: v.expenseTitle, expenseCategory: v.expenseCategory,
          expenseDate: v.expenseDate, expenseDescription: v.expenseDescription || '', amount: v.amount,
        });
      });
    }
  }, [id, isEdit]);

  const validate = () => {
    const e = {};
    if (!form.department.trim()) e.department = 'Department is mandatory.';
    if (!form.expenseTitle.trim()) e.expenseTitle = 'Expense title is mandatory.';
    if (!form.expenseDate) e.expenseDate = 'Expense date is mandatory.';
    if (!form.amount || Number(form.amount) <= 0) e.amount = 'Amount must be greater than zero.';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleChange = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setServerError(null);
    try {
      if (isEdit) {
        await api.put(`/vouchers/${id}`, form);
        navigate(`/vouchers/${id}`);
      } else {
        const res = await api.post('/vouchers', form);
        navigate(`/vouchers/${res.data.id}`);
      }
    } catch (err) {
      setServerError(err.response?.data?.message || 'Failed to save voucher.');
    } finally {
      setSaving(false);
    }
  };

  const inputClass = (key) =>
    `w-full border rounded-sm px-3 py-2 text-sm outline-none focus:border-navy ${errors[key] ? 'border-rust' : 'border-paper-line'}`;

  return (
    <div className="max-w-2xl">
      <p className="font-display text-2xl mb-1">{isEdit ? 'Edit Draft Voucher' : 'Create Voucher'}</p>
      <p className="text-sm text-ink-soft mb-6">
        {isEdit ? 'Update the details below. Only draft vouchers can be edited.' : 'Fill in the details, then save as draft or come back later to submit for approval.'}
      </p>

      <form onSubmit={handleSubmit} className="bg-white border border-paper-line rounded-sm p-6 space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wide font-mono text-ink-soft mb-1.5">Department *</label>
            <input className={inputClass('department')} value={form.department} onChange={(e) => handleChange('department', e.target.value)} placeholder="e.g. Engineering" />
            {errors.department && <p className="text-xs text-rust mt-1">{errors.department}</p>}
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide font-mono text-ink-soft mb-1.5">Expense Category</label>
            <select className={inputClass('expenseCategory')} value={form.expenseCategory} onChange={(e) => handleChange('expenseCategory', e.target.value)}>
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wide font-mono text-ink-soft mb-1.5">Expense Title *</label>
          <input className={inputClass('expenseTitle')} value={form.expenseTitle} onChange={(e) => handleChange('expenseTitle', e.target.value)} placeholder="e.g. Client dinner - Q3 review" />
          {errors.expenseTitle && <p className="text-xs text-rust mt-1">{errors.expenseTitle}</p>}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wide font-mono text-ink-soft mb-1.5">Expense Date *</label>
            <input type="date" className={inputClass('expenseDate')} value={form.expenseDate} onChange={(e) => handleChange('expenseDate', e.target.value)} />
            {errors.expenseDate && <p className="text-xs text-rust mt-1">{errors.expenseDate}</p>}
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide font-mono text-ink-soft mb-1.5">Amount (USD) *</label>
            <input type="number" step="0.01" min="0.01" className={inputClass('amount')} value={form.amount} onChange={(e) => handleChange('amount', e.target.value)} placeholder="0.00" />
            {errors.amount && <p className="text-xs text-rust mt-1">{errors.amount}</p>}
          </div>
        </div>

        <div>
          <label className="block text-xs uppercase tracking-wide font-mono text-ink-soft mb-1.5">Description</label>
          <textarea className={inputClass('expenseDescription')} rows={3} value={form.expenseDescription} onChange={(e) => handleChange('expenseDescription', e.target.value)} placeholder="Additional details about this expense…" />
        </div>

        {serverError && <p className="text-sm text-rust">{serverError}</p>}

        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={saving} className="bg-navy text-white text-sm font-medium rounded-sm px-4 py-2 hover:bg-navy-deep transition-colors disabled:opacity-50">
            {saving ? 'Saving…' : isEdit ? 'Save Changes' : 'Save as Draft'}
          </button>
          <button type="button" onClick={() => navigate(-1)} className="text-sm font-medium text-ink-soft px-4 py-2 hover:text-ink transition-colors">
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
