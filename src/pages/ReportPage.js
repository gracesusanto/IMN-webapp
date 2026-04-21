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
import { REPORT_FILTER_FIELDS, REPORT_OPERATORS } from '../constants/formFields';

const getTodayDateJakarta = () => {
  const now = new Date();
  const jakartaTime = new Date(now.getTime() + 7 * 60 * 60 * 1000);
  return jakartaTime.toISOString().split("T")[0];
};

// filter related functions
function emptyFilterRule(fieldConfig) {
  const firstOperator = REPORT_OPERATORS[fieldConfig.type][0]?.value || "contains";
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random()}`,
    field: fieldConfig.field,
    type: fieldConfig.type,
    operator: firstOperator,
    value: "",
    valueTo: "",
  };
}

function buildBackendFilters(filterRules) {
  const result = {};

  for (const rule of filterRules) {
    if (!rule.field || !rule.operator) continue;

    const value = rule.value;
    const valueTo = rule.valueTo;

    const isBlank = value === "" || value === null || value === undefined;
    const isBlankTo = valueTo === "" || valueTo === null || valueTo === undefined;

    if (rule.operator !== "between" && isBlank) continue;
    if (rule.operator === "between" && isBlank && isBlankTo) continue;

    const payload = { type: rule.type };

    if (rule.operator === "between") {
      payload.between = [
        isBlank ? null : value,
        isBlankTo ? null : valueTo,
      ];
    } else {
      payload[rule.operator] = value;
    }

    result[rule.field] = {
      ...(result[rule.field] || {}),
      ...payload,
    };
  }

  return result;
}

export default function ReportPage() {
  const [reportType, setReportType] = useState("mesin");
  const [format, setFormat] = useState("imn_dashboard");
  const [dateFrom, setDateFrom] = useState(getTodayDateJakarta());
  const [dateTo, setDateTo] = useState(getTodayDateJakarta());
  const [shiftFrom, setShiftFrom] = useState(1);
  const [shiftTo, setShiftTo] = useState(3);

  const [rows, setRows] = useState([]);
  const [rowCount, setRowCount] = useState(0);
  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: 20,
  });
  const [isLoading, setIsLoading] = useState(false);

  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState([]);

  const [sortConfig, setSortConfig] = useState({
    sort_by: null,
    direction: "ascending",
  });

  const fetchReport = async (download = false, sortConfigOverride = null, pageOverride = null) => {
    setIsLoading(true);

    let requestFormat = format;
    if (download) requestFormat = format.replace("_dashboard", "");

    const effectiveSort = sortConfigOverride !== null ? sortConfigOverride : sortConfig;
    const effectivePage = pageOverride !== null ? pageOverride : paginationModel;

    const requestData = {
      format: requestFormat,
      date_from: dateFrom,
      shift_from: shiftFrom,
      date_to: dateTo,
      shift_to: shiftTo,
      filters: buildBackendFilters(filters),
    };

    if (!download) {
      requestData.pagination = {
        page: effectivePage.page + 1,
        page_size: effectivePage.pageSize,
      };
    }

    if (effectiveSort?.sort_by) {
      requestData.sort = effectiveSort;
    }

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
        setRows(response.data.rows || []);
        setRowCount(response.data.total || 0);
      }
    } catch (error) {
      console.error("Error fetching report:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const columns = useMemo(() => {
    return rows.length > 0
      ? Object.keys(rows[0]).map((key) => ({ Header: key, accessor: key }))
      : [];
  }, [rows]);

  const activeFilterFields = useMemo(
    () => REPORT_FILTER_FIELDS[reportType] || [],
    [reportType]
  );

  const addFilter = () => {
    if (activeFilterFields.length === 0) return;
    setFilters((prev) => [...prev, emptyFilterRule(activeFilterFields[0])]);
  };

  const updateFilter = (id, patch) => {
    setFilters((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  };

  const removeFilter = (id) => {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  };

  const resetFilters = () => {
    setFilters([]);
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  };

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
                onChange={(e) => {
                  const nextType = e.target.value;
                  setReportType(nextType);
                  setFilters([]);
                  setRows([]);
                  setRowCount(0);
                  setPaginationModel((prev) => ({ ...prev, page: 0 }));
                }}
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
                setPaginationModel((prev) => ({ ...prev, page: 0 }));
                fetchReport(false, null, { ...paginationModel, page: 0 });
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
                {filters.map((filter) => {
                  const fieldConfig =
                    activeFilterFields.find((f) => f.field === filter.field) || activeFilterFields[0];

                  const type = fieldConfig?.type || "string";
                  const operators = REPORT_OPERATORS[type] || REPORT_OPERATORS.string;

                  return (
                    <Stack
                      key={filter.id}
                      direction={{ xs: "column", md: "row" }}
                      spacing={1}
                      alignItems={{ md: "center" }}
                    >
                      <FormControl size="small" sx={{ minWidth: 220 }}>
                        <InputLabel>Field</InputLabel>
                        <Select
                          label="Field"
                          value={filter.field}
                          onChange={(e) => {
                            const nextField = activeFilterFields.find((f) => f.field === e.target.value);
                            updateFilter(filter.id, {
                              field: nextField.field,
                              type: nextField.type,
                              operator: REPORT_OPERATORS[nextField.type][0].value,
                              value: "",
                              valueTo: "",
                            });
                          }}
                        >
                          {activeFilterFields.map((f) => (
                            <MenuItem key={f.field} value={f.field}>
                              {f.field}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <FormControl size="small" sx={{ minWidth: 180 }}>
                        <InputLabel>Operator</InputLabel>
                        <Select
                          label="Operator"
                          value={filter.operator}
                          onChange={(e) =>
                            updateFilter(filter.id, {
                              operator: e.target.value,
                              value: "",
                              valueTo: "",
                            })
                          }
                        >
                          {operators.map((op) => (
                            <MenuItem key={op.value} value={op.value}>
                              {op.label}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>

                      <TextField
                        size="small"
                        label="Value"
                        type={type === "number" ? "number" : type === "date" ? "datetime-local" : "text"}
                        value={filter.value}
                        onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                        InputLabelProps={type === "date" ? { shrink: true } : undefined}
                        sx={{ minWidth: 220 }}
                      />

                      {filter.operator === "between" && (
                        <TextField
                          size="small"
                          label="To"
                          type={type === "number" ? "number" : type === "date" ? "datetime-local" : "text"}
                          value={filter.valueTo}
                          onChange={(e) => updateFilter(filter.id, { valueTo: e.target.value })}
                          InputLabelProps={type === "date" ? { shrink: true } : undefined}
                          sx={{ minWidth: 220 }}
                        />
                      )}

                      <Button color="error" onClick={() => removeFilter(filter.id)}>
                        Remove
                      </Button>
                    </Stack>
                  );
                })}

                <Stack direction="row" spacing={1} justifyContent="space-between">
                  <Button variant="outlined" onClick={addFilter}>
                    Add Filter
                  </Button>

                  <Stack direction="row" spacing={1}>
                    <Button variant="text" onClick={resetFilters} disabled={isLoading}>
                      Reset
                    </Button>
                    <Button
                      variant="contained"
                      onClick={() => {
                        setPaginationModel((prev) => ({ ...prev, page: 0 }));
                        fetchReport(false, null, { ...paginationModel, page: 0 });
                      }}
                      disabled={isLoading}
                    >
                      Apply Filters
                    </Button>
                  </Stack>
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

        {!isLoading && rows.length > 0 && (
          <Stack spacing={1.5}>
            <DataTable
              columns={columns}
              data={rows}
              exportFileName={`${reportType}_report_preview`}
              height={680}
              loading={isLoading}
              serverPagination
              rowCount={rowCount}
              externalPaginationModel={paginationModel}
              onExternalPaginationModelChange={(next) => {
                setPaginationModel(next);
                fetchReport(false, null, next);
              }}
              disableClientSearch
              disableClientFilters
              disableClientSort
            />

            <Stack direction="row" justifyContent="flex-end">
              <Button variant="contained" onClick={() => fetchReport(true)}>
                Download Report (CSV)
              </Button>
            </Stack>
          </Stack>
        )}

        {!isLoading && rows.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="text.secondary">
              No data available. Click "Show" to load report data.
            </Typography>
          </Box>
        )}
      </Box>
    </Stack>
  );
}
