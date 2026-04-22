// Form field definitions for different models

export const TOOLING_FORM_FIELDS = [
  { label: 'Customer', type: 'text', name: 'customer', placeholder: 'Customer', required: true },
  { label: 'Part No', type: 'text', name: 'part_no', placeholder: 'Part No', required: true },
  { label: 'Part Name', type: 'text', name: 'part_name', placeholder: 'Part Name', required: true },
  { label: 'Child Part Name', type: 'text', name: 'child_part_name', placeholder: 'Child Part Name', required: true },
  { label: 'Kode Tooling', type: 'text', name: 'kode_tooling', placeholder: 'Kode Tooling', required: true },
  { label: 'Common Tooling Name', type: 'text', name: 'common_tooling_name', placeholder: 'Common Tooling Name', required: true },
  { label: 'Proses', type: 'text', name: 'proses', placeholder: 'Proses', required: true },
  { label: 'STD Jam', type: 'number', name: 'std_jam', placeholder: 'STD Jam', required: true },
];

export const TOOLING_COLUMNS = [
  {
    Header: 'ID',
    accessor: 'id',
    filter: {
      type: 'string',
      operators: ['contains', 'notContains', 'equals', 'notEquals', 'startsWith'],
    },
  },
  {
    Header: 'Customer',
    accessor: 'customer',
    filter: {
      type: 'string',
      operators: ['contains', 'notContains', 'equals', 'notEquals', 'startsWith'],
    },
  },
  {
    Header: 'Part No',
    accessor: 'part_no',
    filter: {
      type: 'string',
      operators: ['contains', 'notContains', 'equals', 'notEquals', 'startsWith'],
    },
  },
  {
    Header: 'Part Name',
    accessor: 'part_name',
    filter: {
      type: 'string',
      operators: ['contains', 'notContains', 'equals', 'notEquals', 'startsWith'],
    },
  },
  {
    Header: 'Child Part Name',
    accessor: 'child_part_name',
    filter: {
      type: 'string',
      operators: ['contains', 'notContains', 'equals', 'notEquals', 'startsWith'],
    },
  },
  {
    Header: 'Kode Tooling',
    accessor: 'kode_tooling',
    filter: {
      type: 'string',
      operators: ['contains', 'notContains', 'equals', 'notEquals', 'startsWith'],
    },
  },
  {
    Header: 'Common Tooling Name',
    accessor: 'common_tooling_name',
    filter: {
      type: 'string',
      operators: ['contains', 'notContains', 'equals', 'notEquals', 'startsWith'],
    },
  },
  {
    Header: 'Proses',
    accessor: 'proses',
    filter: {
      type: 'string',
      operators: ['contains', 'notContains', 'equals', 'notEquals', 'startsWith'],
    },
  },
  {
    Header: 'STD Jam',
    accessor: 'std_jam',
    filter: {
      type: 'number',
      operators: ['equals', 'notEquals', 'gt', 'gte', 'lt', 'lte', 'between'],
    },
  },
];

export const OPERATOR_FORM_FIELDS = [
  { label: 'Name', type: 'text', name: 'name', placeholder: 'Name', required: true },
  { label: 'NIK', type: 'text', name: 'nik', placeholder: 'NIK', required: true },
];

export const OPERATOR_COLUMNS = [
  {
    Header: 'ID',
    accessor: 'id',
    filter: {
      type: 'string',
      operators: ['contains', 'notContains', 'equals', 'notEquals', 'startsWith'],
    },
  },
  {
    Header: 'Name',
    accessor: 'name',
    filter: {
      type: 'string',
      operators: ['contains', 'notContains', 'equals', 'notEquals', 'startsWith'],
    },
  },
  {
    Header: 'NIK',
    accessor: 'nik',
    filter: {
      type: 'string',
      operators: ['contains', 'notContains', 'equals', 'notEquals', 'startsWith'],
    },
  },
];

export const MESIN_FORM_FIELDS = [
  { label: 'Name', type: 'text', name: 'name', placeholder: 'Name', required: true },
  { label: 'Tonase', type: 'number', name: 'tonase', placeholder: 'Tonase', required: true },
];

export const MESIN_COLUMNS = [
  {
    Header: 'ID',
    accessor: 'id',
    filter: {
      type: 'string',
      operators: ['contains', 'notContains', 'equals', 'notEquals', 'startsWith'],
    },
  },
  {
    Header: 'Nama',
    accessor: 'name',
    filter: {
      type: 'string',
      operators: ['contains', 'notContains', 'equals', 'notEquals', 'startsWith'],
    },
  },
  {
    Header: 'Tonase',
    accessor: 'tonase',
    filter: {
      type: 'number',
      operators: ['equals', 'notEquals', 'gt', 'gte', 'lt', 'lte', 'between'],
    },
  },
];

// CSV formats for different models
export const CSV_FORMATS = {
  tooling: "customer, part_no, part_name, child_part_name, kode_tooling, common_tooling_name, proses, std_jam",
  operator: "name, nik",
  mesin: "name, tonase",
};

// Report page filter fields - using raw dataframe column names
export const REPORT_FILTER_FIELDS = {
  mesin: [
    { field: "MC", type: "string" },
    { field: "Operator", type: "string" },
    { field: "NIK", type: "string" },
    { field: "Tooling", type: "string" },
    { field: "Kode Tooling", type: "string" },
    { field: "Common Tooling Name", type: "string" },
    { field: "Part No", type: "string" },
    { field: "Part Name", type: "string" },
    { field: "Proses", type: "string" },
    { field: "Desc", type: "string" },
    { field: "Keterangan", type: "string" },
    { field: "Qty", type: "number" },
    { field: "Reject", type: "number" },
    { field: "Rework", type: "number" },
    { field: "Target", type: "number" },
    { field: "Total Output", type: "number" },
    { field: "Target Qty", type: "number" },
    { field: "Plan", type: "string" },
    { field: "Utility", type: "string" },
    { field: "Total Downtime", type: "string" },
    { field: "OTR", type: "string" },
    { field: "PER", type: "string" },
    { field: "QR", type: "string" },
    { field: "OEE", type: "string" },
    { field: "RT", type: "string" },
    { field: "TL", type: "string" },
    { field: "TS", type: "string" },
    { field: "TP", type: "string" },
    { field: "QC", type: "string" },
    { field: "CM", type: "string" },
    { field: "NO", type: "string" },
    { field: "NP", type: "string" },
    { field: "NM", type: "string" },
    { field: "MP", type: "string" },
    { field: "BR", type: "string" },
    { field: "BT", type: "string" },
    // Keep legacy fields for backward compatibility
    { field: "Productivity", type: "number" },
    { field: "Reject Ratio", type: "number" },
    { field: "Rework Ratio", type: "number" },
    { field: "StartTime", type: "date" },
    { field: "StopTime", type: "date" },
  ],
  operator: [
    { field: "Operator", type: "string" },
    { field: "NIK", type: "string" },
    { field: "MC", type: "string" },
    { field: "Tooling", type: "string" },
    { field: "Kode Tooling", type: "string" },
    { field: "Common Tooling Name", type: "string" },
    { field: "Part No", type: "string" },
    { field: "Part Name", type: "string" },
    { field: "Proses", type: "string" },
    { field: "Desc", type: "string" },
    { field: "Keterangan", type: "string" },
    { field: "Qty", type: "number" },
    { field: "Reject", type: "number" },
    { field: "Rework", type: "number" },
    { field: "Target", type: "number" },
    { field: "Total Output", type: "number" },
    { field: "Target Qty", type: "number" },
    { field: "Plan", type: "string" },
    { field: "Utility", type: "string" },
    { field: "Total Downtime", type: "string" },
    { field: "OTR", type: "string" },
    { field: "PER", type: "string" },
    { field: "QR", type: "string" },
    { field: "OEE", type: "string" },
    { field: "RT", type: "string" },
    { field: "TL", type: "string" },
    { field: "TS", type: "string" },
    { field: "TP", type: "string" },
    { field: "QC", type: "string" },
    { field: "CM", type: "string" },
    { field: "NO", type: "string" },
    { field: "NP", type: "string" },
    { field: "NM", type: "string" },
    { field: "MP", type: "string" },
    { field: "BR", type: "string" },
    { field: "BT", type: "string" },
    // Keep legacy fields for backward compatibility
    { field: "Productivity", type: "number" },
    { field: "Reject Ratio", type: "number" },
    { field: "Rework Ratio", type: "number" },
    { field: "StartTime", type: "date" },
    { field: "StopTime", type: "date" },
  ],
};

// Dashboard filter fields - using frontend column names and proper types
export const DASHBOARD_FILTER_FIELDS = {
  mesin: [
    { field: 'mc_no', label: 'MC', type: 'string' },
    { field: 'part_no', label: 'Part No', type: 'string' },
    { field: 'part_name', label: 'Part Name', type: 'string' },
    { field: 'proses', label: 'Proses', type: 'string' },
    { field: 'catatan', label: 'Catatan', type: 'string' },

    { field: 'tanggal', label: 'Tanggal', type: 'date' },
    { field: 'shift', label: 'Shift', type: 'number' },

    { field: 'target_per_jam', label: 'Std/Jam', type: 'number' },
    { field: 'target_qty', label: 'Target Qty', type: 'number' },
    { field: 'output', label: 'Output', type: 'number' },
    { field: 'reject', label: 'Reject', type: 'number' },
    { field: 'rework', label: 'Rework', type: 'number' },

    // time fields shown as HH:MM in table, but filtered as numeric minutes
    { field: 'plan', label: 'Plan', type: 'number', inputKind: 'time_minutes' },
    { field: 'utility', label: 'Utility', type: 'number', inputKind: 'time_minutes' },
    { field: 'total_dt', label: 'Total DT', type: 'number', inputKind: 'time_minutes' },
    { field: 'tp', label: 'TP', type: 'number', inputKind: 'time_minutes' },
    { field: 'ts', label: 'TS', type: 'number', inputKind: 'time_minutes' },
    { field: 'qc', label: 'QC', type: 'number', inputKind: 'time_minutes' },
    { field: 'cm', label: 'CM', type: 'number', inputKind: 'time_minutes' },
    { field: 'no', label: 'NO', type: 'number', inputKind: 'time_minutes' },
    { field: 'np', label: 'NP', type: 'number', inputKind: 'time_minutes' },
    { field: 'nm', label: 'NM', type: 'number', inputKind: 'time_minutes' },
    { field: 'mp', label: 'MP', type: 'number', inputKind: 'time_minutes' },
    { field: 'bt', label: 'BT', type: 'number', inputKind: 'time_minutes' },
    { field: 'br', label: 'BR', type: 'number', inputKind: 'time_minutes' },
    { field: 'tl', label: 'TL', type: 'number', inputKind: 'time_minutes' },

    // KPI fields shown as %, but filtered as numeric percent
    { field: 'per', label: 'PER', type: 'number', inputKind: 'percent' },
    { field: 'otr', label: 'OTR', type: 'number', inputKind: 'percent' },
    { field: 'qr', label: 'QR', type: 'number', inputKind: 'percent' },
    { field: 'oee', label: 'OEE', type: 'number', inputKind: 'percent' },
  ],

  operator: [
    { field: 'operator', label: 'Operator', type: 'string' },
    { field: 'mc_no', label: 'MC', type: 'string' },
    { field: 'part_no', label: 'Part No', type: 'string' },
    { field: 'part_name', label: 'Part Name', type: 'string' },
    { field: 'proses', label: 'Proses', type: 'string' },
    { field: 'catatan', label: 'Catatan', type: 'string' },

    { field: 'tanggal', label: 'Tanggal', type: 'date' },
    { field: 'shift', label: 'Shift', type: 'number' },

    { field: 'target_per_jam', label: 'Std/Jam', type: 'number' },
    { field: 'target_qty', label: 'Target Qty', type: 'number' },
    { field: 'output', label: 'Output', type: 'number' },
    { field: 'reject', label: 'Reject', type: 'number' },
    { field: 'rework', label: 'Rework', type: 'number' },

    { field: 'plan', label: 'Plan', type: 'number', inputKind: 'time_minutes' },
    { field: 'utility', label: 'Utility', type: 'number', inputKind: 'time_minutes' },
    { field: 'total_dt', label: 'Total DT', type: 'number', inputKind: 'time_minutes' },
    { field: 'tp', label: 'TP', type: 'number', inputKind: 'time_minutes' },
    { field: 'ts', label: 'TS', type: 'number', inputKind: 'time_minutes' },
    { field: 'qc', label: 'QC', type: 'number', inputKind: 'time_minutes' },
    { field: 'cm', label: 'CM', type: 'number', inputKind: 'time_minutes' },
    { field: 'no', label: 'NO', type: 'number', inputKind: 'time_minutes' },
    { field: 'np', label: 'NP', type: 'number', inputKind: 'time_minutes' },
    { field: 'nm', label: 'NM', type: 'number', inputKind: 'time_minutes' },
    { field: 'mp', label: 'MP', type: 'number', inputKind: 'time_minutes' },
    { field: 'bt', label: 'BT', type: 'number', inputKind: 'time_minutes' },
    { field: 'br', label: 'BR', type: 'number', inputKind: 'time_minutes' },
    { field: 'tl', label: 'TL', type: 'number', inputKind: 'time_minutes' },

    { field: 'per', label: 'PER', type: 'number', inputKind: 'percent' },
    { field: 'otr', label: 'OTR', type: 'number', inputKind: 'percent' },
    { field: 'qr', label: 'QR', type: 'number', inputKind: 'percent' },
    { field: 'oee', label: 'OEE', type: 'number', inputKind: 'percent' },
  ],
};

export const REPORT_OPERATORS = {
  string: [
    { value: "contains", label: "Contains" },
    { value: "not_contains", label: "Not Contains" },
    { value: "equals", label: "Equals" },
    { value: "not_equals", label: "Not Equals" },
    { value: "starts_with", label: "Starts With" },
    { value: "ends_with", label: "Ends With" },
  ],
  number: [
    { value: "equals", label: "Equals" },
    { value: "not_equals", label: "Not Equals" },
    { value: "gt", label: ">" },
    { value: "gte", label: ">=" },
    { value: "lt", label: "<" },
    { value: "lte", label: "<=" },
    { value: "between", label: "Between" },
  ],
  date: [
    { value: "after", label: "After" },
    { value: "on_or_after", label: "On or After" },
    { value: "before", label: "Before" },
    { value: "on_or_before", label: "On or Before" },
    { value: "between", label: "Between" },
    { value: "equals", label: "Equals" },
    { value: "not_equals", label: "Not Equals" },
  ],
};
