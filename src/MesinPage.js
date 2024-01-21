import React from 'react';
import GenericPage from './GenericPage';

const mesinFormFields = [
    { label: 'Name', type: 'text', name: 'name', placeholder: 'Name', required: true },
    { label: 'Tonase', type: 'number', name: 'tonase', placeholder: 'Tonase', required: true }
];

const mesinColumns = [
    {
        Header: 'ID',
        accessor: 'id',
    },
    {
        Header: 'Nama',
        accessor: 'name',
    },
    {
        Header: 'Tonase',
        accessor: 'tonase',
    },
    // Add more columns as needed
];

const MesinPage = () => (
    <GenericPage
        apiUrl={process.env.REACT_APP_API_URL}
        model="mesin"
        formFields={mesinFormFields}
        csvFormat="name, tonase"
        dataColumns={mesinColumns}
        buttonText="Submit Mesin Data"
    />
);

export default MesinPage;
