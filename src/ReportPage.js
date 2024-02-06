import React, { useState } from 'react';
import axios from 'axios';
import DataTable from './DataTable';
import styles from './ReportPage.module.css'; // Import the styles

const getTodayDateJakarta = () => {
    const now = new Date();
    const jakartaTime = new Date(now.getTime() + (7 * 60 * 60 * 1000)); // Offset for GMT+7
    return jakartaTime.toISOString().split('T')[0]; // Format to 'YYYY-MM-DD'
};

const ReportPage = () => {
    const [reportType, setReportType] = useState('mesin'); // 'operator' or 'mesin'
    const [format, setFormat] = useState('imn_dashboard'); // 'limax_dashboard', 'imn_dashboard'
    const [dateFrom, setDateFrom] = useState(getTodayDateJakarta());
    const [dateTo, setDateTo] = useState(getTodayDateJakarta());
    const [shiftFrom, setShiftFrom] = useState(1);
    const [shiftTo, setShiftTo] = useState(3);
    const [data, setData] = useState([]);
    const [isLoading, setIsLoading] = useState(false); // State to handle loading status
    const [showFilters, setShowFilters] = useState(false); // To toggle filter form visibility
    const [filters, setFilters] = useState({
        "Reject Ratio": { gt: null, lt: null },
        "Rework Ratio": { gt: null, lt: null },
        "Productivity": { gt: null, lt: null },
    });

    // Handler to update filter states
    const handleFilterChange = (filterName, condition, value) => {
        setFilters((prevFilters) => ({
            ...prevFilters,
            [filterName]: {
                ...prevFilters[filterName],
                [condition]: value,
            },
        }));
    };

    const resetFilters = () => {
        // Assuming you have a state 'filters' that keeps track of all filter values
        setFilters({
            'Productivity': { gt: null, lt: null },
            'Reject Ratio': { gt: null, lt: null },
            'Rework Ratio': { gt: null, lt: null },
        });
    }


    const fetchReport = async (download = false) => {
        setIsLoading(true); // Start loading
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
            shift_to: shiftTo,
            filters: filters,
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
        } finally {
            setIsLoading(false); // Stop loading whether or not there was an error
        }
    };

    const columns = React.useMemo(() => {
        // Dynamically create columns based on the data keys
        return data.length > 0 ? Object.keys(data[0]).map(key => ({
            Header: key,
            accessor: key
        })) : [];
    }, [data]);

    const inputForm = (
        <table className={styles.tableStyle}>
            <thead>
                <tr>
                    <th className={styles.thStyle}>Report Type</th>
                    <th className={styles.thStyle}>Format</th>
                    <th className={styles.thStyle}>Date From</th>
                    <th className={styles.thStyle}>Date To</th>
                    <th className={styles.thStyle}>Shift From</th>
                    <th className={styles.thStyle}>Shift To</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td className={styles.tdStyle}>
                        <select value={reportType} onChange={e => setReportType(e.target.value)}>
                            <option value="mesin">Mesin</option>
                            <option value="operator">Operator</option>
                        </select>
                    </td>
                    <td className={styles.tdStyle}>
                        <select value={format} onChange={e => setFormat(e.target.value)}>
                            <option value="imn_dashboard">IMN</option>
                            <option value="limax_dashboard">Limax</option>
                        </select>
                    </td>
                    <td className={styles.tdStyle}>
                        <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                    </td>
                    <td className={styles.tdStyle}>
                        <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                    </td>
                    <td className={styles.tdStyle}>
                        <input type="number" min="1" max="3" value={shiftFrom} onChange={e => setShiftFrom(parseInt(e.target.value, 10))} />
                    </td>
                    <td className={styles.tdStyle}>
                        <input type="number" min="1" max="3" value={shiftTo} onChange={e => setShiftTo(parseInt(e.target.value, 10))} />
                    </td>
                </tr>
            </tbody>
        </table>
    );


    return (
        <div>
            <h1>{reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report</h1>
            <div className={styles.inputContainer}>{inputForm}</div>

            <button onClick={() => { resetFilters(); fetchReport(false); }}>Show</button>

            <div className={styles.mainContainer}>
                {/* Conditionally render the spinner */}
                {isLoading && (
                    <div className={styles.spinnerContainer}>
                        <div className={styles.spinner}></div>
                    </div>
                )}

                {/* Conditionally render the table and filter */}
                {!isLoading && (
                    <div>
                        {/* Toggle Filters button */}
                        <div className={styles.filterButtonContainer}>
                            <button className={styles.filterButton} onClick={() => setShowFilters(!showFilters)}>
                                {showFilters ? 'Close Filters' : 'Filters'}
                            </button>
                        </div>
                        <div className={styles.filterContainer}>
                            {/* Filter form */}
                            {showFilters && (
                                <div style={{ width: '100%' }}> {/* Ensures the filters take full width */}
                                    <div className={styles.filterSection}>
                                        {/* Map through each filter type and create its section */}
                                        {['Productivity', 'Reject Ratio', 'Rework Ratio'].map((filterType) => (
                                            <div className={styles.filterSection} key={filterType}>
                                                <h4>{filterType}</h4>
                                                <div>
                                                    <input
                                                        className={styles.inputField}
                                                        type="number"
                                                        placeholder="Min"
                                                        value={filters[filterType]?.gt || ''}
                                                        onChange={(e) => handleFilterChange(filterType, 'gt', parseInt(e.target.value, 10))}
                                                    />
                                                    <input
                                                        className={styles.inputField}
                                                        type="number"
                                                        placeholder="Max"
                                                        value={filters[filterType]?.lt || ''}
                                                        onChange={(e) => handleFilterChange(filterType, 'lt', parseInt(e.target.value, 10))}
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    {/* Apply Filters Button */}
                                    <div className={styles.applyFiltersContainer}>
                                        <button className={styles.resetFiltersButton} onClick={() => resetFilters()}>Reset Filters</button>
                                        <button className={styles.applyFiltersButton} onClick={() => fetchReport(false)}>Apply Filters</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Data table and download report button */}
                {!isLoading && data.length > 0 && (
                    <>
                        <DataTable columns={columns} data={data} />
                        <button className={styles.filterButton} onClick={() => fetchReport(true)}>Download Report</button>
                    </>
                )}
            </div>


        </div >
    );
};

export default ReportPage;
