// src/ToolingPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from './DataTable';
import CsvUpload from './CsvUpload';

const ToolingForm = ({ currentTooling, setCurrentTooling, handleSubmit, message }) => {
    const handleChange = (e) => {
        const { name, value } = e.target;
        setCurrentTooling({ ...currentTooling, [name]: value });
    };

    const renderInputField = (name, placeholder, type = "text") => (
        <div>
            <label className="form-label" htmlFor={name}>{placeholder}</label>
            <input
                className="form-field"
                type={type}
                name={name}
                id={name}
                placeholder={placeholder}
                value={currentTooling[name] || ''}
                onChange={handleChange}
                required
            />
        </div>
    );

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit}>
                {renderInputField("customer", "Customer")}
                {renderInputField("part_no", "Part No")}
                {renderInputField("part_name", "Part Name")}
                {renderInputField("child_part_name", "Child Part Name")}
                {renderInputField("kode_tooling", "Kode Tooling")}
                {renderInputField("common_tooling_name", "Common Tooling Name")}
                {renderInputField("proses", "Proses")}
                {renderInputField("std_jam", "STD Jam", "number")}
                <button className="form-button" type="submit">Submit Tooling Data</button>
            </form>
            {message && <div className="success-message">{message}</div>}
        </div>
    );
};


const ToolingPage = () => {
    const [data, setData] = useState([]);
    const [currentTooling, setCurrentTooling] = useState({
        customer: "",
        part_no: "",
        child_part_name: "",
        common_tooling_name: "",
        std_jam: "",
        part_name: "",
        kode_tooling: "",
        proses: "",
    });
    const [message, setMessage] = useState(""); // For success or error messages

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = () => {
        axios.get(`${process.env.REACT_APP_API_URL}/tooling/`)
            .then(response => {
                setData(response.data);
            })
            .catch(error => {
                console.error("Error fetching data: ", error);
            });
    };

    const handleEdit = (tooling) => {
        setCurrentTooling(tooling);
    };


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/tooling`, currentTooling);
            fetchData(); // Callback to refresh data or handle post-submit actions
            console.log(response.data)
            setMessage(`Tooling ${response.data.id} added successfully!`); // 
        } catch (error) {
            console.error('Error submitting tooling data: ', error);
            setMessage(`Error adding tooling: ${error}`);
        }
    };

    const confirmDelete = (id) => {
        const enteredId = window.prompt("Masukan ID Tooling yang ingin di hapus:");
        if (enteredId && enteredId === id) {
            handleDelete(id);
        } else {
            alert("ID Tooling yang anda masukan tidak sesuai.");
        }
    };

    const handleDelete = async (id) => {
        try {
            const response = await axios.delete(`${process.env.REACT_APP_API_URL}/tooling/${id}`);
            fetchData();
            alert(`Tooling ${id} berhasil dihapus.`)
        } catch (error) {
            alert(`Error menghapus tooling ${id}.`)
        }
    };




    const columns = React.useMemo(
        () => [
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
        <div>
            <div className="section-container">
                <h2 className="section-heading">Tooling Table</h2>
                <DataTable data={data} columns={columns} />
            </div>

            <div className="section-container">
                <h2 className="section-heading">Update Tooling via CSV</h2>
                <p>Expected CSV format: <br></br>customer, part_no, part_name, child_part_name, kode_tooling, common_tooling_name, proses, std_jam</p>
                <CsvUpload onUploadSuccess={fetchData} uploadUrl="tooling" />
            </div>

            <div className="section-container">
                <h2 className="section-heading">Add New Tooling</h2>
                <ToolingForm currentTooling={currentTooling} setCurrentTooling={setCurrentTooling} handleSubmit={handleSubmit} message={message} />
            </div>
        </div>
    );
};

export default ToolingPage;
