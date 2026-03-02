import { useState, useMemo } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Collapse,
  FormControl,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

import DataTable from "../components/DataTable";
import { API_CONFIG } from "../constants/config";
import styles from "./ReportPage.module.css";

const getTodayDateJakarta = () => {
  const now = new Date();
  const jakartaTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return jakartaTime.toISOString().split("T")[0];
};

export default function ReportPage() {
  const [reportType, setReportType] = useState("mesin");
  const [format, setFormat] = useState("imn_dashboard");
  const [dateFrom, setDateFrom] = useState(getTodayDateJakarta());
  const [dateTo, setDateTo] = useState(getTodayDateJakarta());
  const [shiftFrom, setShiftFrom] = useState(1);
  const [shiftTo, setShiftTo] = useState(3);

  const [data, setData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    "Reject Ratio": { gt: null, lt: null },
    "Rework Ratio": { gt: null, lt: null },
    Productivity: { gt: null, lt: null },
  });

  const [sortConfig, setSortConfig] = useState({
    sort_by: null,
    direction: "ascending",
  });

  const handleFilterChange = (filterName, condition, value) => {
    setFilters((prev) => ({
      ...prev,
      [filterName]: {
        ...prev[filterName],
        [condition]: value === "" ? null : value,
      },
    }));
  };

  const resetFilters = () => {
    setFilters({
      Productivity: { gt: null, lt: null },
      "Reject Ratio": { gt: null, lt: null },
      "Rework Ratio": { gt: null, lt: null },
    });
  };

  const fetchReport = async (download = false, sortConfigOverride = null) => {
    setIsLoading(true);

    let requestFormat = format;
    if (download) requestFormat = format.replace("_dashboard", "");

    const effectiveSort = sortConfigOverride !== null ? sortConfigOverride : sortConfig;

    const requestData = {
      format: requestFormat,
      date_from: dateFrom,
      shift_from: shiftFrom,
      date_to: dateTo,
      shift_to: shiftTo,
      filters,
    };

    if (effectiveSort?.sort_by) requestData.sort = effectiveSort;

    try {
      const response = await axios.post(
        `${API_CONFIG.BASE_URL}/report/${reportType}`,
        requestData,
        download ? { responseType: "blob" } : {}
      );

      if (download) {
        const contentDisposition = response.headers["content-disposition"];
        let filename = `${reportType}_report.csv`;
        if (contentDisposition) {
          const filenameMatch = contentDisposition.match(/filename="?(.+)"?/);
          if (filenameMatch?.[1]) filename = filenameMatch[1];
        }
        const fileURL = window.URL.createObjectURL(new Blob([response.data]));
        const fileLink = document.createElement("a");
        fileLink.href = fileURL;
        fileLink.setAttribute("download", filename);
        document.body.appendChild(fileLink);
        fileLink.click();
        fileLink.remove();
        window.URL.revokeObjectURL(fileURL);
      } else {
        setData(response.data);
      }
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = useMemo(() => {
    return data.length > 0
      ? Object.keys(data[0]).map((key) => ({ Header: key, accessor: key }))
      : [];
  }, [data]);

  return (
    <Stack spacing={2}>
      <Typography variant="h5">
        {reportType.charAt(0).toUpperCase() + reportType.slice(1)} Report
      </Typography>

      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Stack spacing={2}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <FormControl size="small" fullWidth>
              <InputLabel>Report Type</InputLabel>
              <Select
                label="Report Type"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <MenuItem value="mesin">Mesin</MenuItem>
                <MenuItem value="operator">Operator</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" fullWidth>
              <InputLabel>Format</InputLabel>
              <Select
                label="Format"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
              >
                <MenuItem value="imn_dashboard">IMN</MenuItem>
                <MenuItem value="limax_dashboard">Limax</MenuItem>
              </Select>
            </FormControl>

            <TextField
              size="small"
              type="date"
              label="Date From"
              InputLabelProps={{ shrink: true }}
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              fullWidth
            />

            <TextField
              size="small"
              type="date"
              label="Date To"
              InputLabelProps={{ shrink: true }}
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              fullWidth
            />

            <TextField
              size="small"
              type="number"
              label="Shift From"
              inputProps={{ min: 1, max: 3 }}
              value={shiftFrom}
              onChange={(e) => setShiftFrom(parseInt(e.target.value || "1", 10))}
              fullWidth
            />

            <TextField
              size="small"
              type="number"
              label="Shift To"
              inputProps={{ min: 1, max: 3 }}
              value={shiftTo}
              onChange={(e) => setShiftTo(parseInt(e.target.value || "1", 10))}
              fullWidth
            />
          </Stack>

          <Stack direction="row" spacing={1} justifyContent="flex-end">
            <Button
              variant="contained"
              onClick={() => {
                resetFilters();
                fetchReport(false);
              }}
              disabled={isLoading}
            >
              Show
            </Button>

            <Button
              variant="outlined"
              onClick={() => setShowFilters((v) => !v)}
              disabled={isLoading}
            >
              {showFilters ? "Close Filters" : "Filters"}
            </Button>
          </Stack>

          <Collapse in={showFilters}>
            <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Stack spacing={2}>
                <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
                  {["Productivity", "Reject Ratio", "Rework Ratio"].map((filterType) => (
                    <Box key={filterType} sx={{ flex: 1 }}>
                      <Typography variant="subtitle2" sx={{ mb: 1 }}>
                        {filterType}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <TextField
                          size="small"
                          type="number"
                          label="Min"
                          inputProps={{ step: 0.01 }}
                          value={filters[filterType]?.gt ?? ""}
                          onChange={(e) =>
                            handleFilterChange(
                              filterType,
                              "gt",
                              e.target.value === "" ? "" : parseFloat(e.target.value)
                            )
                          }
                          fullWidth
                        />
                        <TextField
                          size="small"
                          type="number"
                          label="Max"
                          inputProps={{ step: 0.01 }}
                          value={filters[filterType]?.lt ?? ""}
                          onChange={(e) =>
                            handleFilterChange(
                              filterType,
                              "lt",
                              e.target.value === "" ? "" : parseFloat(e.target.value)
                            )
                          }
                          fullWidth
                        />
                      </Stack>
                    </Box>
                  ))}
                </Stack>

                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button variant="text" onClick={resetFilters} disabled={isLoading}>
                    Reset
                  </Button>
                  <Button variant="contained" onClick={() => fetchReport(false)} disabled={isLoading}>
                    Apply Filters
                  </Button>
                </Stack>
              </Stack>
            </Paper>
          </Collapse>

          <Stack direction={{ xs: "column", md: "row" }} spacing={1} justifyContent="flex-end">
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel>Sort By</InputLabel>
              <Select
                label="Sort By"
                value={sortConfig.sort_by || ""}
                onChange={(e) => {
                  const selected = e.target.value;
                  setSortConfig((prev) => {
                    const next = { ...prev, sort_by: selected !== "" ? selected : null };
                    fetchReport(false, next.sort_by ? next : null);
                    return next;
                  });
                }}
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="Productivity">Productivity</MenuItem>
                <MenuItem value="Reject Ratio">Reject Ratio</MenuItem>
                <MenuItem value="Rework Ratio">Rework Ratio</MenuItem>
              </Select>
            </FormControl>

            <Button
              variant="outlined"
              onClick={() => {
                setSortConfig((prev) => {
                  const newDirection = prev.direction === "ascending" ? "descending" : "ascending";
                  const next = { ...prev, direction: newDirection };
                  fetchReport(false, next);
                  return next;
                });
              }}
              disabled={!sortConfig.sort_by || isLoading}
            >
              {sortConfig.direction === "ascending" ? "↑ Asc" : "↓ Desc"}
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Box className={styles.mainContainer}>
        {isLoading && (
          <div className={styles.spinnerContainer}>
            <div className={styles.spinner}></div>
          </div>
        )}

        {!isLoading && data.length > 0 && (
          <Stack spacing={1.5}>
            <DataTable
              columns={columns}
              data={data}
              exportFileName={`${reportType}_report_preview`}
              height={680}
            />

            <Stack direction="row" justifyContent="flex-end">
              <Button variant="contained" onClick={() => fetchReport(true)}>
                Download Report (CSV)
              </Button>
            </Stack>
          </Stack>
        )}
      </Box>
    </Stack>
  );
}
