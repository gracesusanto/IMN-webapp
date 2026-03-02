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
  { Header: 'ID', accessor: 'id' },
  { Header: 'Customer', accessor: 'customer' },
  { Header: 'Part No', accessor: 'part_no' },
  { Header: 'Part Name', accessor: 'part_name' },
  { Header: 'Child Part Name', accessor: 'child_part_name' },
  { Header: 'Kode Tooling', accessor: 'kode_tooling' },
  { Header: 'Common Tooling Name', accessor: 'common_tooling_name' },
  { Header: 'Proses', accessor: 'proses' },
  { Header: 'STD Jam', accessor: 'std_jam' },
];

export const OPERATOR_FORM_FIELDS = [
  { label: 'Name', type: 'text', name: 'name', placeholder: 'Name', required: true },
  { label: 'NIK', type: 'text', name: 'nik', placeholder: 'NIK', required: true },
];

export const OPERATOR_COLUMNS = [
  { Header: 'ID', accessor: 'id' },
  { Header: 'Name', accessor: 'name' },
  { Header: 'NIK', accessor: 'nik' },
];

export const MESIN_FORM_FIELDS = [
  { label: 'Name', type: 'text', name: 'name', placeholder: 'Name', required: true },
  { label: 'Tonase', type: 'number', name: 'tonase', placeholder: 'Tonase', required: true },
];

export const MESIN_COLUMNS = [
  { Header: 'ID', accessor: 'id' },
  { Header: 'Nama', accessor: 'name' },
  { Header: 'Tonase', accessor: 'tonase' },
];

// CSV formats for different models
export const CSV_FORMATS = {
  tooling: "customer, part_no, part_name, child_part_name, kode_tooling, common_tooling_name, proses, std_jam",
  operator: "name, nik",
  mesin: "name, tonase",
};