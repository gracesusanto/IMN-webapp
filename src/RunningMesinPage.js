import React, { useState, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import axios from 'axios';
import DataTable from './DataTable';

const formatDate = (dateString) => {
    const date = parseISO(dateString);
    return format(date, 'dd/MM/yyyy HH:mm');
};

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

    // Start Time, Mesin, Tooling, Operator, Status, Kategori Downtime
    const columns = React.useMemo(() => {
        return data.length > 0 ? Object.keys(data[0]).map(key => ({
            Header: key,
            accessor: key,
            Cell: ({ value }) => key === 'Start Time' ? formatDate(value) : value
        })) : [];
    }, [data]);

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
