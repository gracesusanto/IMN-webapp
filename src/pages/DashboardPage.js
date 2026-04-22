import { useState, useMemo, useEffect } from "react";
import axios from "axios";
import {
  Box,
  Button,
  Stack,
  Typography,
  Tabs,
  Tab,
  Paper,
  Autocomplete,
  TextField,
  Chip,
} from "@mui/material";

// Import our new dashboard components
import DashboardFilters from "../components/DashboardFilters";
import ReportTable from "../components/ReportTable";
import KpiCardRow from "../components/KpiCardRow";
import SummaryCharts from "../components/SummaryCharts";
import SummaryTable from "../components/SummaryTable";
import OeeDashboardPanel from "../components/OeeDashboardPanel";

import { API_CONFIG } from "../constants/config";
import styles from "./ReportPage.module.css";
import { REPORT_FILTER_FIELDS, REPORT_OPERATORS } from '../constants/formFields';

const getTodayDateJakarta = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Filter utility functions
function emptyFilterRule(fieldConfig) {
  const firstOperator = REPORT_OPERATORS[fieldConfig.type][0]?.value || "contains";
  return {
    id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${Math.random()}`,
    field: fieldConfig.field,
    type: fieldConfig.type,
    operator: firstOperator,
    value: "",
  };
}

function buildBackendFilters(filterRules, selectedMachines = [], selectedOperators = []) {
  const result = {};

  // Add standard filters
  for (const rule of filterRules) {
    if (!rule.field || !rule.operator || !rule.value) continue;

    result[rule.field] = {
      type: rule.type,
      [rule.operator]: rule.value,
    };
  }

  // Add MC filters - use selectedMachines dropdown
  if (selectedMachines.length > 0) {
    result.mc = { type: "string", in: selectedMachines };
  }

  // Add Operator filters - use selectedOperators dropdown
  if (selectedOperators.length > 0) {
    result.operator = { type: "string", in: selectedOperators };
  }

  return result;
}

export default function DashboardPage() {
  // Core state
  const [reportType, setReportType] = useState("mesin");
  const [dateFrom, setDateFrom] = useState(getTodayDateJakarta());
  const [dateTo, setDateTo] = useState(getTodayDateJakarta());
  const [shiftFrom, setShiftFrom] = useState(1);
  const [shiftTo, setShiftTo] = useState(3);

  // Data state
  const [dashboardData, setDashboardData] = useState(null);
  const [detailData, setDetailData] = useState([]);
  const [totalRows, setTotalRows] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  // UI state
  const [activeTab, setActiveTab] = useState(0);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Filter state (text filters removed - using dropdown selectors only)
  const [filters, setFilters] = useState([]);
  const [availableMachines, setAvailableMachines] = useState([]);
  const [selectedMachines, setSelectedMachines] = useState([]);
  const [availableOperators, setAvailableOperators] = useState([]);
  const [selectedOperators, setSelectedOperators] = useState([]);

  // Pagination state (for detail table)
  const [detailPagination, setDetailPagination] = useState({
    page: 0,
    pageSize: 20,
  });

  const activeFilterFields = useMemo(
    () => REPORT_FILTER_FIELDS[reportType] || [],
    [reportType]
  );

  // Filter management functions
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
    setSelectedMachines([]);
    setSelectedOperators([]);
    setDetailPagination({ page: 0, pageSize: 20 });
  };

  // Extract available machines from current data
  const extractAvailableMachines = (data) => {
    const machines = [...new Set(data.map(row => row.mc_no).filter(mc => mc && mc !== '-'))];
    return machines.sort();
  };

  // Extract available operators from current data
  const extractAvailableOperators = (data) => {
    const operators = [...new Set(data.map(row => row.operator).filter(op => op && op !== '-'))];
    return operators.sort();
  };

  // API fetch functions
  const fetchDashboardData = async () => {
    setIsLoading(true);

    try {
      const endpoint = reportType === 'mesin'
        ? `/api/reports/dashboard/machine-summary`
        : `/api/reports/dashboard/operator-summary`;
      const requestData = {
        date_from: dateFrom,
        shift_from: shiftFrom,
        date_to: dateTo,
        shift_to: shiftTo,
        filters: buildBackendFilters(filters, selectedMachines, selectedOperators),
      };

      const response = await axios.post(`${API_CONFIG.BASE_URL}${endpoint}`, requestData);
      setDashboardData(response.data);
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      setDashboardData(null);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchDetailData = async (page = 0, pageSize = 20) => {
    setIsLoading(true);

    // Clear stale rows before new fetch to avoid flash of old data
    setDetailData([]);
    setTotalRows(0);

    try {
      const endpoint = `/api/reports/dashboard/detail`;
      const requestData = {
        report_type: reportType,
        date_from: dateFrom || null,
        shift_from: shiftFrom || 1,
        date_to: dateTo || null,
        shift_to: shiftTo || 3,
        filters: buildBackendFilters(filters, selectedMachines, selectedOperators),
        pagination: {
          page: page + 1, // Backend uses 1-based pagination
          page_size: pageSize,
        },
      };

      // Dev logging for debugging filtering issues
      console.log('Request payload:', requestData);

      const response = await axios.post(`${API_CONFIG.BASE_URL}${endpoint}`, requestData);

      const newData = response.data.rows || [];
      const total = response.data.total || 0;

      // Dev logging - check first returned row
      if (newData.length > 0) {
        console.log('First returned row:', {
          tanggal: newData[0].tanggal,
          shift: newData[0].shift,
          mc_no: newData[0].mc_no,
        });
      }

      setDetailData(newData);
      setTotalRows(total);

      // Update available machines and operators from the current data
      setAvailableMachines(extractAvailableMachines(newData));
      setAvailableOperators(extractAvailableOperators(newData));
    } catch (error) {
      console.error("Error fetching detail data:", error);
      console.error("Request that failed:", {
        report_type: reportType,
        date_from: dateFrom,
        date_to: dateTo,
        shift_from: shiftFrom,
        shift_to: shiftTo,
      });
      setDetailData([]);
      setTotalRows(0);
    } finally {
      setIsLoading(false);
    }
  };

  const downloadReport = async () => {
    try {
      const endpoint = `/api/reports/dashboard/detail`;
      const requestData = {
        report_type: reportType,
        date_from: dateFrom,
        shift_from: shiftFrom,
        date_to: dateTo,
        shift_to: shiftTo,
        filters: buildBackendFilters(filters, selectedMachines, selectedOperators),
      };

      const response = await axios.post(
        `${API_CONFIG.BASE_URL}${endpoint}`,
        requestData,
        { responseType: "blob" }
      );

      const fileURL = window.URL.createObjectURL(new Blob([response.data]));
      const fileLink = document.createElement("a");
      fileLink.href = fileURL;
      fileLink.setAttribute("download", `${reportType}_dashboard_report.csv`);
      document.body.appendChild(fileLink);
      fileLink.click();
      fileLink.remove();
      window.URL.revokeObjectURL(fileURL);
    } catch (error) {
      console.error("Error downloading report:", error);
    }
  };

  // Event handlers
  const handleApplyFilters = () => {
    // Reset pagination to page 0 when filters change
    setDetailPagination(prev => ({ ...prev, page: 0 }));

    if (activeTab === 0) {
      fetchDetailData(0, detailPagination.pageSize);
    } else {
      fetchDashboardData();
    }
  };

  const handleResetFilters = () => {
    resetFilters();
    // Reset pagination to page 0 when filters are reset
    setDetailPagination({ page: 0, pageSize: 20 });

    if (activeTab === 0) {
      fetchDetailData(0, 20);
    } else {
      fetchDashboardData();
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Only Report Table tab exists now, always fetch detail data
    fetchDetailData(0, detailPagination.pageSize);
  };

  const handlePageChange = (event, newPage) => {
    setDetailPagination(prev => ({ ...prev, page: newPage }));
    fetchDetailData(newPage, detailPagination.pageSize);
  };

  const handlePageSizeChange = (event) => {
    const newPageSize = parseInt(event.target.value, 10);
    setDetailPagination({ page: 0, pageSize: newPageSize });
    fetchDetailData(0, newPageSize);
  };

  const handleReportTypeChange = (newReportType) => {
    setReportType(newReportType);
    setFilters([]);
    setSelectedMachines([]);
    setSelectedOperators([]);
    setDashboardData(null);
    // Clear stale data immediately when changing report type
    setDetailData([]);
    setTotalRows(0);
    setDetailPagination({ page: 0, pageSize: 20 });
  };

  // Auto-load data when report type changes
  useEffect(() => {
    fetchDetailData(0, detailPagination.pageSize);
  }, [reportType]); // Reload when report type changes

  // Load data on initial page load
  useEffect(() => {
    fetchDetailData(0, detailPagination.pageSize);
  }, []); // Only run once on mount

  return (
    <Stack spacing={2}>
      <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
        📊 Production Dashboard
      </Typography>

      {/* Dashboard Filters */}
      <DashboardFilters
        reportType={reportType}
        setReportType={handleReportTypeChange}
        dateFrom={dateFrom}
        setDateFrom={setDateFrom}
        dateTo={dateTo}
        setDateTo={setDateTo}
        shiftFrom={shiftFrom}
        setShiftFrom={setShiftFrom}
        shiftTo={shiftTo}
        setShiftTo={setShiftTo}
        showAdvancedFilters={showAdvancedFilters}
        setShowAdvancedFilters={setShowAdvancedFilters}
        filters={filters}
        setFilters={setFilters}
        onApplyFilters={handleApplyFilters}
        onResetFilters={handleResetFilters}
        isLoading={isLoading}
        activeFilterFields={activeFilterFields}
        updateFilter={updateFilter}
        removeFilter={removeFilter}
        addFilter={addFilter}
        // New props for machine and operator selection
        availableMachines={availableMachines}
        selectedMachines={selectedMachines}
        setSelectedMachines={setSelectedMachines}
        availableOperators={availableOperators}
        selectedOperators={selectedOperators}
        setSelectedOperators={setSelectedOperators}
      />


      {/* Tab Navigation */}
      <Paper sx={{ borderRadius: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          sx={{ borderRadius: 2 }}
        >
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>📋</span>
                <span>Report Table</span>
              </Box>
            }
          />
          {/* TODO: Re-enable Summary and OEE tabs later
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>📊</span>
                <span>Summary Dashboard</span>
              </Box>
            }
          />
          <Tab
            label={
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <span>🎯</span>
                <span>OEE Dashboard</span>
              </Box>
            }
          />
          */}
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box sx={{ minHeight: '600px' }}>
        {/* Active Filter Summary */}
        {!isLoading && (detailData.length > 0 || totalRows > 0) && (
          <Paper sx={{ p: 2, mb: 2, backgroundColor: 'info.light' }}>
            <Typography variant="body2" color="info.contrastText">
              Showing {reportType === 'mesin' ? 'Machine' : 'Operator'} Report for{' '}
              <strong>{dateFrom}</strong> to <strong>{dateTo}</strong>, shifts{' '}
              <strong>{shiftFrom}–{shiftTo}</strong>
              {selectedMachines.length > 0 && (
                <span>, machines: <strong>{selectedMachines.join(', ')}</strong></span>
              )}
              {selectedOperators.length > 0 && (
                <span>, operators: <strong>{selectedOperators.join(', ')}</strong></span>
              )}
              {filters.length > 0 && (
                <span>, {filters.length} advanced filter{filters.length > 1 ? 's' : ''}</span>
              )}
            </Typography>
            <Typography variant="caption" color="info.contrastText">
              Total: {totalRows} records
            </Typography>
          </Paper>
        )}

        {/* Report Table - Always show since it's the only tab now */}
        <ReportTable
          data={detailData}
          reportType={reportType}
          rowCount={totalRows}
          page={detailPagination.page}
          pageSize={detailPagination.pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          onDownload={downloadReport}
          isLoading={isLoading}
        />

        {/* TODO: Re-enable when Summary/OEE tabs are needed
        {activeTab === 1 && (
          <Stack spacing={3}>
            <KpiCardRow kpis={dashboardData?.kpis || {}} type="summary" />
            <SummaryCharts dashboardData={dashboardData} reportType={reportType} />
            <SummaryTable data={dashboardData?.rows || []} reportType={reportType} isLoading={isLoading} />
          </Stack>
        )}

        {activeTab === 2 && (
          <Stack spacing={3}>
            <KpiCardRow kpis={dashboardData?.kpis || {}} type="oee" />
            <SummaryCharts dashboardData={dashboardData} reportType={reportType} />
            <OeeDashboardPanel dashboardData={dashboardData} reportType={reportType} />
          </Stack>
        )}
        */}

        {/* Loading State */}
        {isLoading && (
          <Box sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '400px'
          }}>
            <div className={styles.spinnerContainer}>
              <div className={styles.spinner}></div>
            </div>
          </Box>
        )}

        {/* Empty State - Only for Report Table now */}
        {!isLoading && detailData.length === 0 && totalRows === 0 && (
          <Box sx={{
            textAlign: 'center',
            py: 8,
            minHeight: '400px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center'
          }}>
            <Typography variant="h6" color="text.secondary" gutterBottom>
              No report data available
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Click "Show Dashboard" to load report data for your selected date range
            </Typography>
            <Button
              variant="contained"
              onClick={handleApplyFilters}
              sx={{ maxWidth: 200, mx: 'auto' }}
            >
              📊 Show Dashboard
            </Button>
          </Box>
        )}
      </Box>
    </Stack>
  );
}
