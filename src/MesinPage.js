// src/MesinTable.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from './DataTable';
import CsvUpload from './CsvUpload';

const MesinForm = ({ currentMesin, setCurrentMesin, handleSubmit, message }) => {
    return (
        <div className="form-container">
            <form onSubmit={handleSubmit}>
                <label className="form-label" htmlFor="name">Name</label>
                <input
                    className="form-field"
                    type="text"
                    id="name"
                    name="name"
                    placeholder="Name"
                    value={currentMesin.name}
                    onChange={(e) => setCurrentMesin({ ...currentMesin, name: e.target.value })}
                    required
                />

                <label className="form-label" htmlFor="tonase">Tonase</label>
                <input
                    className="form-field"
                    type="number"
                    id="tonase"
                    name="tonase"
                    placeholder="Tonase"
                    value={currentMesin.tonase}
                    onChange={(e) => setCurrentMesin({ ...currentMesin, tonase: e.target.value })}
                    required
                />

                <button className="form-button" type="submit">Submit Mesin Data</button>
            </form>
            {message && <div className="success-message">{message}</div>}
        </div>
    );
};


const MesinPage = () => {
    const [data, setData] = useState([]);
    const [currentMesin, setCurrentMesin] = useState({ id: '', name: '', tonase: '' });
    const [message, setMessage] = useState(""); // For success or error messages

    const fetchData = () => {
        axios.get(`${process.env.REACT_APP_API_URL}/mesin/`)
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error("Error fetching data: ", error);
                setMessage("Error fetching mesin.");
            });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleSubmit = async (event) => {
        event.preventDefault();
        const mesinData = {
            name: currentMesin.name,
            tonase: currentMesin.tonase,
        };

        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/mesin/`, mesinData);
            fetchData(); // Refetch data
            setMessage(`Mesin ${response.data.id} added successfully!`); // Success message
        } catch (error) {
            console.error("Error submitting mesin: ", error);
            setMessage(`Error adding mesin: ${error}`); // Error message
        }
    };

    const handleEdit = (mesin) => {
        setCurrentMesin(mesin);
    };

    const confirmDelete = (id) => {
        const enteredId = window.prompt("Masukan ID Mesin yang ingin di hapus:");
        if (enteredId && enteredId === id) {
            handleDelete(id);
        } else {
            alert("ID Mesin yang anda masukan tidak sesuai.");
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(`${process.env.REACT_APP_API_URL}/mesin/${id}`);
            fetchData();
            alert(`Mesin ${id} berhasil dihapus.`)
        } catch (error) {
            alert(`Error menghapus Mesin ${id}.`)
        }
    };

    const columns = React.useMemo(
        () => [
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
                <h2 className="section-heading">Mesin Data Table</h2>
                <DataTable data={data} columns={columns} onEdit={handleEdit} />
            </div>

            <div className="section-container">
                <h2 className="section-heading">Add New Mesin</h2>
                <MesinForm currentMesin={currentMesin} setCurrentMesin={setCurrentMesin} handleSubmit={handleSubmit} message={message} />
            </div>

            <div className="section-container">
                <h2 className="section-heading">Update Mesin via CSV</h2>
                <p>Expected CSV format: <br></br>name, tonase</p>
                <CsvUpload onUploadSuccess={fetchData} uploadUrl="mesin" />
            </div>
        </>
    );
};

export default MesinPage;
