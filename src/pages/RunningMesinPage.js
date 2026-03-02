import { useState, useEffect, useMemo } from 'react';
import { format, parseISO } from 'date-fns';
import axios from 'axios';
import { Box, CircularProgress, Typography } from '@mui/material';
import DataTable from '../components/DataTable';
import { API_CONFIG } from '../constants/config';

const formatDate = (dateString) => {
    const date = parseISO(dateString);
    return format(date, 'dd/MM/yyyy HH:mm');
};

const RunningMesinPage = () => {
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_CONFIG.BASE_URL}/mesin-status-all/`);
            setData(response.data.details);
        } catch (error) {
            console.error("Error fetching data: ", error);
            setError("Failed to fetch running mesin data. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Start Time, Mesin, Tooling, Operator, Status, Kategori Downtime
    const columns = useMemo(() => {
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
                {loading ? (
                    <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
                        <CircularProgress />
                    </Box>
                ) : error ? (
                    <Typography color="error" align="center">{error}</Typography>
                ) : (
                    <DataTable
                        data={data}
                        columns={columns}
                        showExportButton={false} // No export for running status data
                    />
                )}
            </div>
        </>
    );

};

export default RunningMesinPage;
