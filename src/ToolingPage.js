// src/ToolingPage.js
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from './DataTable';
import CsvUpload from './CsvUpload';
import ToolingForm from './ToolingForm';

const ToolingPage = () => {
    const [data, setData] = useState([]);

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
        ],
        []
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
                <ToolingForm onFormSubmit={fetchData} />
            </div>
        </div>
    );
};

export default ToolingPage;
