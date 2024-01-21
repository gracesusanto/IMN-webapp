// src/GenericPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from './DataTable';
import CsvUpload from './CsvUpload';
import GenericForm from './GenericForm';
import './FormStyles.css';

const GenericPage = ({ apiUrl, model, formFields, csvFormat, dataColumns, buttonText }) => {
    const [data, setData] = useState([]);
    const [currentItem, setCurrentItem] = useState({ id: '', ...formFields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {}) });
    const [message, setMessage] = useState(""); // For success or error messages

    // Fetch data from the API
    const fetchData = () => {
        axios.get(`${apiUrl}/${model}/`)
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error("Error fetching data: ", error);
                setMessage(`Error fetching ${model}.`);
            });
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Handle form submit
    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            const response = await axios.post(`${apiUrl}/${model}/`, currentItem);
            fetchData(); // Refetch data
            setMessage(`Data ${response.data.id} added successfully!`);
            setCurrentItem(formFields.reduce((acc, field) => ({ ...acc, [field.name]: '' }), {}));
        } catch (error) {
            console.error(`Error submitting ${model}:`, error);
            setMessage(`Error adding ${model}: ${error}`);
        }
    };

    // Function to handle the edit operation
    const handleEdit = (item) => {
        setCurrentItem(item);
    };

    // Confirm delete
    const confirmDelete = (id) => {
        const enteredId = window.prompt(`Enter the ID of the ${model} to delete (${id}):`);
        if (enteredId && enteredId === id) {
            handleDelete(id);
        } else {
            alert(`The entered ID does not match the ${model} ID.`);
        }
    };

    // Delete item
    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(`${apiUrl}/${model}/${id}`);
            fetchData();
            alert(`Data ${id} deleted successfully!`);
        } catch (error) {
            alert(`Error deleting ${model} ${id}.`);
        }
    };

    // Add action buttons to the dataColumns
    const actionColumn = {
        Header: 'Actions',
        id: 'actions',
        Cell: ({ row }) => (
            <>
                <button onClick={() => handleEdit(row.original)} className="edit-button">Modify</button>
                <button onClick={() => confirmDelete(row.original.id)} className="delete-button">Delete</button>
            </>
        ),
    };

    // Include the action column in the columns for the DataTable
    const columnsWithActions = React.useMemo(() => [...dataColumns, actionColumn], [dataColumns]);


    // Download barcode
    const handleDownloadBarcode = async () => {
        try {
            const response = await axios.get(`${apiUrl}/download-barcode/${model}/`, { responseType: 'blob' });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', `${model}_barcodes.xlsx`); // or any other extension
            document.body.appendChild(link);
            link.click();
            window.URL.revokeObjectURL(url);
            link.remove();
        } catch (error) {
            console.error('Error downloading barcodes:', error);
            // Handle error
        }
    };

    return (
        <>
            <div className="section-container">
                <h2 className="section-heading">{model.charAt(0).toUpperCase() + model.slice(1)} Table</h2>
                <DataTable data={data} columns={columnsWithActions} />
                <button onClick={handleDownloadBarcode}>Download Barcode</button>
            </div>
            <div className="section-container">
                <h2 className="section-heading">Add New {model.charAt(0).toUpperCase() + model.slice(1)}</h2>
                <GenericForm
                    currentData={currentItem}
                    setCurrentData={setCurrentItem}
                    handleSubmit={handleSubmit}
                    message={{ text: message, buttonText: buttonText }}
                    fields={formFields}
                />
            </div>
            <div className="section-container">
                <h2 className="section-heading">Update {model.charAt(0).toUpperCase() + model.slice(1)} via CSV</h2>
                <p>Expected CSV format: <br></br>{csvFormat}</p>
                <CsvUpload onUploadSuccess={fetchData} uploadUrl={`${model}`} />
            </div>
        </>
    );
};

export default GenericPage;
