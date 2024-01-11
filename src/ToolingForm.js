import React, { useState } from 'react';
import axios from 'axios';
import './FormStyles.css';

const ToolingForm = ({ onFormSubmit }) => {
    const [toolingData, setToolingData] = useState({
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

    const handleChange = (e) => {
        setToolingData({ ...toolingData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await axios.post(`${process.env.REACT_APP_API_URL}/tooling`, toolingData);
            onFormSubmit(); // Callback to refresh data or handle post-submit actions
            console.log(response.data)
            setMessage(`Tooling ${response.data.id} added successfully!`); // 
        } catch (error) {
            console.error('Error submitting tooling data: ', error);
            setMessage(`Error adding tooling: ${error}`);
        }
    };

    return (
        <div className="form-container">
            <form onSubmit={handleSubmit}>
                <label className="form-label" htmlFor="customer">Customer</label>
                <input className="form-field" type="text" name="customer" id="customer" placeholder="Customer" value={toolingData.customer} onChange={handleChange} required />

                <label className="form-label" htmlFor="part_no">Part No</label>
                <input className="form-field" type="text" name="part_no" id="part_no" placeholder="Part No" value={toolingData.part_no} onChange={handleChange} required />

                <label className="form-label" htmlFor="part_name">Part Name</label>
                <input className="form-field" type="text" name="part_name" id="part_name" placeholder="Part Name" value={toolingData.part_name} onChange={handleChange} required />

                <label className="form-label" htmlFor="child_part_name">Child Part Name</label>
                <input className="form-field" type="text" name="child_part_name" id="child_part_name" placeholder="Child Part Name" value={toolingData.child_part_name} onChange={handleChange} required />

                <label className="form-label" htmlFor="kode_tooling">Kode Tooling</label>
                <input className="form-field" type="text" name="kode_tooling" id="kode_tooling" placeholder="Tooling Code" value={toolingData.kode_tooling} onChange={handleChange} required />

                <label className="form-label" htmlFor="common_tooling_name">Common Tooling Name</label>
                <input className="form-field" type="text" name="common_tooling_name" id="common_tooling_name" placeholder="Common Tooling Name" value={toolingData.common_tooling_name} onChange={handleChange} required />

                <label className="form-label" htmlFor="proses">Proses</label>
                <input className="form-field" type="text" name="proses" id="proses" placeholder="Process" value={toolingData.proses} onChange={handleChange} required />

                <label className="form-label" htmlFor="std_jam">STD Jam</label>
                <input className="form-field" type="number" name="std_jam" id="std_jam" placeholder="Standard Hours" value={toolingData.std_jam} onChange={handleChange} required />

                <button className="form-button" type="submit">Submit Tooling Data</button>
            </form>
            {message && <div className="success-message">{message}</div>}
        </div>
    );
};

export default ToolingForm;
