export const defaultListFilters = {
  voucherNumber: '',
  employeeName: '',
  department: '',
  category: '',
  status: '',
  dateFrom: '',
  dateTo: '',
  amountMin: '',
  amountMax: '',
  showDeleted: false,
  sortBy: 'voucherNumber',
  sortOrder: 'ASC',
};

export function parseFilterParams(searchParams, defaults = defaultListFilters) {
  const get = (key) => searchParams.get(key) ?? defaults[key] ?? '';

  return {
    voucherNumber: get('voucherNumber'),
    employeeName: get('employeeName'),
    department: get('department'),
    category: get('category'),
    status: get('status'),
    dateFrom: get('dateFrom'),
    dateTo: get('dateTo'),
    amountMin: get('amountMin'),
    amountMax: get('amountMax'),
    showDeleted: searchParams.get('showDeleted') === 'true',
    sortBy: get('sortBy'),
    sortOrder: get('sortOrder'),
  };
}

export function buildSearchParams(filters) {
  const params = new URLSearchParams();

  if (filters.voucherNumber) params.set('voucherNumber', filters.voucherNumber);
  if (filters.employeeName) params.set('employeeName', filters.employeeName);
  if (filters.department) params.set('department', filters.department);
  if (filters.category) params.set('category', filters.category);
  if (filters.status) params.set('status', filters.status);
  if (filters.dateFrom) params.set('dateFrom', filters.dateFrom);
  if (filters.dateTo) params.set('dateTo', filters.dateTo);
  if (filters.amountMin) params.set('amountMin', filters.amountMin);
  if (filters.amountMax) params.set('amountMax', filters.amountMax);
  if (filters.showDeleted) params.set('showDeleted', 'true');
  if (filters.sortBy) params.set('sortBy', filters.sortBy);
  if (filters.sortOrder) params.set('sortOrder', filters.sortOrder);

  return params;
}
