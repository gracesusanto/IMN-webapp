import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DataTable from './DataTable';


const RunningMesinPage = () => {
    const [data, setData] = useState([]);

    const fetchData = () => {
        axios.get(`${process.env.REACT_APP_API_URL}/mesin-status-all/`)
            .then(response => {
                setData(response.data.details);
            })
            .catch(error => {
                console.error("Error fetching data: ", error);
            });
    };

    useEffect(() => {
        fetchData();
    }, []);

    const columns = React.useMemo(
        () => [
            {
                Header: 'Mesin',
                accessor: 'Mesin',
            },
            {
                Header: 'Tooling',
                accessor: 'Tooling',
            },
            {
                Header: 'Operator',
                accessor: 'Operator',
            },
            {
                Header: 'Status',
                accessor: 'Status',
            },
            {
                Header: 'Kategori Downtime',
                accessor: 'Kategori Downtime',
            },
        ],
        []
    );

    return (
        <>
            <div className="section-container">
                <h2 className="section-heading">Running Mesin Table</h2>
                <DataTable data={data} columns={columns} />
            </div>
        </>
    );

};

export default RunningMesinPage;
