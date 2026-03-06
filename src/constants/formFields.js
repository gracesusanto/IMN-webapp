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

// Report fields
export const REPORT_FILTER_FIELDS = {
  mesin: [
    { field: "MC", type: "string" },
    { field: "Operator", type: "string" },
    { field: "NIK", type: "string" },
    { field: "Tooling", type: "string" },
    { field: "Kode Tooling", type: "string" },
    { field: "Part Name", type: "string" },
    { field: "Desc", type: "string" },
    { field: "Keterangan", type: "string" },
    { field: "Qty", type: "number" },
    { field: "Reject", type: "number" },
    { field: "Rework", type: "number" },
    { field: "Target", type: "number" },
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
    { field: "Part Name", type: "string" },
    { field: "Desc", type: "string" },
    { field: "Keterangan", type: "string" },
    { field: "Qty", type: "number" },
    { field: "Reject", type: "number" },
    { field: "Rework", type: "number" },
    { field: "Target", type: "number" },
    { field: "Productivity", type: "number" },
    { field: "Reject Ratio", type: "number" },
    { field: "Rework Ratio", type: "number" },
    { field: "StartTime", type: "date" },
    { field: "StopTime", type: "date" },
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
