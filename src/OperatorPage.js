import React from 'react';
import GenericPage from './GenericPage';

const operatorFormFields = [
    { label: 'Name', type: 'text', name: 'name', placeholder: 'Name', required: true },
    { label: 'NIK', type: 'text', name: 'nik', placeholder: 'NIK', required: true }
];

const operatorColumns = [
    {
        Header: 'ID',
        accessor: 'id',
    },
    {
        Header: 'Name',
        accessor: 'name',
    },
    {
        Header: 'NIK',
        accessor: 'nik',
    },
];

const OperatorPage = () => (
    <GenericPage
        apiUrl={process.env.REACT_APP_API_URL}
        model="operator"
        formFields={operatorFormFields}
        csvFormat="name, nik"
        dataColumns={operatorColumns}
        buttonText="Add Operator"
    />
);

export default OperatorPage;
