import React, { useState } from 'react';
import axios from 'axios';
import DataTable from './DataTable';

const getTodayDateJakarta = () => {
    const now = new Date();
    const jakartaTime = new Date(now.getTime() + (7 * 60 * 60 * 1000)); // Offset for GMT+7
    return jakartaTime.toISOString().split('T')[0]; // Format to 'YYYY-MM-DD'
};

const ReportPage = () => {
    const [reportType, setReportType] = useState('operator'); // 'operator' or 'mesin'
    const [format, setFormat] = useState('limax_dashboard'); // 'limax_dashboard', 'imn_dashboard'
    const [dateFrom, setDateFrom] = useState(getTodayDateJakarta());
    const [dateTo, setDateTo] = useState(getTodayDateJakarta());
    const [shiftFrom, setShiftFrom] = useState(1);
    const [shiftTo, setShiftTo] = useState(3);
    const [data, setData] = useState([]);

    const fetchReport = async (download = false) => {
        let requestFormat = format;
        if (download) {
            // Remove '_dashboard' suffix for download format
            requestFormat = format.replace('_dashboard', '');
        }

        const requestData = {
            format: requestFormat,
            date_from: dateFrom,
            shift_from: shiftFrom,
            date_to: dateTo,
            shift_to: shiftTo
        };

        console.log('Sending request to /report/', reportType, 'with data:', requestData);

        try {
            const response = await axios.post(`/report/${reportType}`, requestData, download ? { responseType: 'blob' } : {});

            if (download) {
                // Trigger file download
                const contentDisposition = response.headers['content-disposition'];
                let filename = `${reportType}_report.csv`;
                if (contentDisposition) {
                    const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
                    if (filenameMatch && filenameMatch.length > 1) {
                        filename = filenameMatch[1];
                    }
                }
                const fileURL = window.URL.createObjectURL(new Blob([response.data]));
                const fileLink = document.createElement('a');
                fileLink.href = fileURL;
                fileLink.setAttribute('download', filename);
                document.body.appendChild(fileLink);
                fileLink.click();
                fileLink.remove();
                window.URL.revokeObjectURL(fileURL);
            } else {
                // Set data for display in table
                setData(response.data);
            }
        } catch (error) {
            console.error('Error fetching report:', error);
        }
    };

    const columns = React.useMemo(() => {
        // Dynamically create columns based on the data keys
        return data.length > 0 ? Object.keys(data[0]).map(key => ({
            Header: key,
            accessor: key
        })) : [];
    }, [data]);

    return (
        <div>
            <h1>{reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</h1>
            <select value={reportType} onChange={e => setReportType(e.target.value)}>
                <option value="operator">Operator</option>
                <option value="mesin">Mesin</option>
            </select>
            <select value={format} onChange={e => setFormat(e.target.value)}>
                <option value="limax_dashboard">Limax Dashboard</option>
                <option value="imn_dashboard">IMN Dashboard</option>
            </select>

            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
            <input type="number" min="1" max="3" value={shiftFrom} onChange={e => setShiftFrom(parseInt(e.target.value, 10))} />
            <input type="number" min="1" max="3" value={shiftTo} onChange={e => setShiftTo(parseInt(e.target.value, 10))} />
            <button onClick={() => fetchReport(false)}>Show</button>
            {data.length > 0 && <DataTable columns={columns} data={data} />}
            {data.length > 0 && (
                <button onClick={() => fetchReport(true)}>Download Report</button>
            )}
        </div>
    );
};

export default ReportPage;
