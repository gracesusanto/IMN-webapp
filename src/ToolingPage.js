import React from 'react';
import GenericPage from './GenericPage';

const toolingFormFields = [
    { label: 'Customer', type: 'text', name: 'customer', placeholder: 'Customer', required: true },
    { label: 'Part No', type: 'text', name: 'part_no', placeholder: 'Part No', required: true },
    { label: 'Part Name', type: 'text', name: 'part_name', placeholder: 'Part Name', required: true },
    { label: 'Child Part Name', type: 'text', name: 'child_part_name', placeholder: 'Child Part Name', required: true },
    { label: 'Kode Tooling', type: 'text', name: 'kode_tooling', placeholder: 'Kode Tooling', required: true },
    { label: 'Common Tooling Name', type: 'text', name: 'common_tooling_name', placeholder: 'Common Tooling Name', required: true },
    { label: 'Proses', type: 'text', name: 'proses', placeholder: 'Proses', required: true },
    { label: 'STD Jam', type: 'number', name: 'std_jam', placeholder: 'STD Jam', required: true },
];

const toolingColumns = [
    {
        Header: 'ID',
        accessor: 'id',
    },
    {
        Header: 'Customer',
        accessor: 'customer',
    },
    {
        Header: 'Part No',
        accessor: 'part_no',
    },
    {
        Header: 'Part Name',
        accessor: 'part_name',
    },
    {
        Header: 'Child Part Name',
        accessor: 'child_part_name',
    },
    {
        Header: 'Kode Tooling',
        accessor: 'kode_tooling',
    },
    {
        Header: 'Common Tooling Name',
        accessor: 'common_tooling_name',
    },
    {
        Header: 'Proses',
        accessor: 'proses',
    },
    {
        Header: 'STD Jam',
        accessor: 'std_jam',
    },
    // Actions column is handled within GenericPage
];

const ToolingPage = () => (
    <GenericPage
        apiUrl={process.env.REACT_APP_API_URL}
        model="tooling"
        formFields={toolingFormFields}
        csvFormat="customer, part_no, part_name, child_part_name, kode_tooling, common_tooling_name, proses, std_jam"
        dataColumns={toolingColumns}
        buttonText="Submit Tooling Data"
        downloadText="Download Tooling Barcodes"
        uploadText="Update Tooling via CSV"
        addNewText="Add New Tooling"
    />
);

export default ToolingPage;
