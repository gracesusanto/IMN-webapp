import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from './DataTable';
import CsvUpload from './CsvUpload';
import './FormStyles.css';

const OperatorForm = ({ currentOperator, setCurrentOperator, handleSubmit, message }) => {
    return (
        <div className="form-container">
            <form onSubmit={handleSubmit}>
                <label className="form-label" htmlFor="name">Name</label>
                <input className="form-field" type="text" name="name" id="name" placeholder="Name" value={currentOperator.name} onChange={(e) => setCurrentOperator({ ...currentOperator, name: e.target.value })} required />

                <label className="form-label" htmlFor="nik">NIK</label>
                <input className="form-field" type="text" name="nik" id="nik" placeholder="NIK" value={currentOperator.nik} onChange={(e) => setCurrentOperator({ ...currentOperator, nik: e.target.value })} required />

                <button className="form-button" type="submit">Add Operator</button>
            </form>
            {message && <div className="success-message">{message}</div>}
        </div>
    );
};

const OperatorPage = () => {
    const [data, setData] = useState([]);
    const [currentOperator, setCurrentOperator] = useState({ id: '', nik: '', name: '' });
    const [message, setMessage] = useState(""); // For success or error messages

    const fetchData = () => {
        axios.get(`${process.env.REACT_APP_API_URL}/operator/`)
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error("Error fetching data: ", error);
                setMessage("Error fetching operators.");
            });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const operatorData = {
            nik: currentOperator.nik,
            name: currentOperator.name,
        };

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/operator/`, operatorData);
            fetchData(); // Refetch data
            setMessage(`Operator ${response.data.id} added successfully!`); // Success message
        } catch (error) {
            console.error("Error submitting operator: ", error);
            setMessage(`Error adding operator: ${error}`); // Error message
        }
    };

    const handleEdit = (operator) => {
        setCurrentOperator(operator);
    };

    const confirmDelete = (id) => {
        const enteredId = window.prompt("Masukan ID Operator yang ingin di hapus:");
        if (enteredId && enteredId === id) {
            handleDelete(id);
        } else {
            alert("ID Operator yang anda masukan tidak sesuai.");
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(`${process.env.REACT_APP_API_URL}/operator/${id}`);
            fetchData();
            alert(`Operator ${id} berhasil dihapus.`)
        } catch (error) {
            alert(`Error menghapus operator ${id}.`)
        }
    };

    const columns = React.useMemo(
        () => [
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
            {
                Header: 'Actions',
                id: 'actions',
                Cell: ({ row }) => (
                    <>
                        <button onClick={() => handleEdit(row.original)}>Modify</button>
                        <button onClick={() => confirmDelete(row.original.id)}>Delete</button>
                    </>
                ),
            },
        ],
        [handleEdit, confirmDelete]
    );

    return (
        <>
            <div className="section-container">
                <h2 className="section-heading">Operator Table</h2>
                <DataTable data={data} columns={columns} onEdit={handleEdit} />
            </div>

            <div className="section-container">
                <h2 className="section-heading">Add New Operator</h2>
                <OperatorForm currentOperator={currentOperator} setCurrentOperator={setCurrentOperator} handleSubmit={handleSubmit} message={message} />
            </div>

            <div className="section-container">
                <h2 className="section-heading">Update Operators via CSV</h2>
                <p>Expected CSV format: <br></br>name, nik</p>
                <CsvUpload onUploadSuccess={fetchData} uploadUrl="operator" />
            </div>
        </>
    );

};

export default OperatorPage;
