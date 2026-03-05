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

  const columns = useMemo(() => {
    if (data.length === 0) return [];

    return Object.keys(data[0]).map((key) => {
        const isStartTime = key === "Start Time";

        const isNumericColumn = !isStartTime && data.some((row) => {
        const value = row?.[key];
        return typeof value === "number" && !Number.isNaN(value);
        });

        const filterType = isStartTime ? "date" : isNumericColumn ? "number" : "string";

        return {
        Header: key,
        accessor: key,
        filter: {
            type: filterType,
            operators:
            filterType === "number"
                ? ["equals", "notEquals", "gt", "gte", "lt", "lte", "between"]
                : filterType === "date"
                ? ["equals", "notEquals", "gt", "gte", "lt", "lte", "between"]
                : ["contains", "notContains", "equals", "notEquals", "startsWith"],
        },
        Cell: ({ value }) => {
            if (key === "Start Time" && value) {
            return formatDate(value);
            }
            return value;
        },
        };
    });
    }, [data]);

  return (
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
          modelType="running-mesin"
          showExportButton={false}
        />
      )}
    </div>
  );
};

export default RunningMesinPage;
