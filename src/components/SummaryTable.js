import React from 'react';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Chip,
  Box,
} from '@mui/material';

const SummaryTable = ({ data, reportType, isLoading = false }) => {
  // Define summary columns based on report type
  const getSummaryColumns = () => {
    const baseColumns = [
      { key: 'tanggal', label: 'Date', width: 100 },
      { key: 'shift', label: 'Shift', width: 60 },
      { key: 'status', label: 'Status', width: 80 },
    ];

    if (reportType === 'mesin') {
      baseColumns.push(
        { key: 'mc', label: 'Machine', width: 100 },
        { key: 'part_no', label: 'Part No', width: 120 },
        { key: 'part_name', label: 'Part Name', width: 150 },
        { key: 'proses', label: 'Process', width: 80 },
        { key: 'output', label: 'Output', width: 80, align: 'right' },
        { key: 'plan', label: 'Plan Time', width: 90 },
        { key: 'rt', label: 'RT', width: 80 },
        { key: 'total_downtime', label: 'Total Downtime', width: 120 },
        { key: 'per', label: 'PER', width: 80, align: 'center' },
        { key: 'otr', label: 'OTR', width: 80, align: 'center' },
        { key: 'qr', label: 'QR', width: 80, align: 'center' },
        { key: 'oee', label: 'OEE', width: 80, align: 'center' },
      );
    } else {
      baseColumns.push(
        { key: 'operator', label: 'Operator', width: 120 },
        { key: 'mc', label: 'Machine', width: 100 },
        { key: 'part_no', label: 'Part No', width: 120 },
        { key: 'part_name', label: 'Part Name', width: 150 },
        { key: 'proses', label: 'Process', width: 80 },
        { key: 'output', label: 'Output', width: 80, align: 'right' },
        { key: 'plan', label: 'Plan Time', width: 90 },
        { key: 'rt', label: 'RT', width: 80 },
        { key: 'total_downtime', label: 'Total Downtime', width: 120 },
        { key: 'per', label: 'PER', width: 80, align: 'center' },
        { key: 'otr', label: 'OTR', width: 80, align: 'center' },
        { key: 'qr', label: 'QR', width: 80, align: 'center' },
        { key: 'oee', label: 'OEE', width: 80, align: 'center' },
      );
    }

    return baseColumns;
  };

  const summaryColumns = getSummaryColumns();

  const getStatusChip = (status) => {
    const statusMap = {
      'OK': { color: 'success', label: 'OK' },
      'MP': { color: 'error', label: 'MP' },
      'TP': { color: 'warning', label: 'TP' },
      'TS': { color: 'info', label: 'TS' },
      'QC': { color: 'warning', label: 'QC' },
    };

    const config = statusMap[status] || { color: 'default', label: status };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const getPerformanceChip = (value, type) => {
    const numValue = typeof value === 'string' ? parseFloat(value.replace('%', '')) : parseFloat(value);

    if (type === 'oee') {
      if (numValue >= 85) return <Chip label={value} color="success" size="small" />;
      if (numValue >= 70) return <Chip label={value} color="warning" size="small" />;
      return <Chip label={value} color="error" size="small" />;
    }

    if (type === 'otr') {
      if (numValue >= 90) return <Chip label={value} color="success" size="small" />;
      if (numValue >= 75) return <Chip label={value} color="warning" size="small" />;
      return <Chip label={value} color="error" size="small" />;
    }

    if (type === 'per') {
      if (numValue >= 95) return <Chip label={value} color="success" size="small" />;
      if (numValue >= 80) return <Chip label={value} color="warning" size="small" />;
      return <Chip label={value} color="error" size="small" />;
    }

    if (type === 'qr') {
      if (numValue >= 99) return <Chip label={value} color="success" size="small" />;
      if (numValue >= 95) return <Chip label={value} color="warning" size="small" />;
      return <Chip label={value} color="error" size="small" />;
    }

    return value || '-';
  };

  const formatCellValue = (value, column) => {
    if (!value && value !== 0) return '-';

    // Status column
    if (column.key === 'status') {
      return getStatusChip(value);
    }

    // Performance columns with color coding
    if (['per', 'otr', 'qr', 'oee'].includes(column.key)) {
      return getPerformanceChip(value, column.key);
    }

    // Numeric columns with thousand separators
    if (['output'].includes(column.key)) {
      return typeof value === 'number' ? value.toLocaleString() : value;
    }

    // Time columns
    if (['plan', 'rt', 'total_downtime'].includes(column.key)) {
      return value;
    }

    return value;
  };

  if (isLoading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Loading summary data...
        </Typography>
      </Paper>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No summary data available
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Summary data will appear here after applying filters
        </Typography>
      </Paper>
    );
  }

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        📊 {reportType === 'mesin' ? 'Machine' : 'Operator'} Summary Table
      </Typography>

      <TableContainer component={Paper} sx={{ maxHeight: 400 }}>
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {summaryColumns.map((column) => (
                <TableCell
                  key={column.key}
                  align={column.align || 'left'}
                  sx={{
                    fontWeight: 'bold',
                    backgroundColor: 'secondary.main',
                    color: 'secondary.contrastText',
                    minWidth: column.width,
                    whiteSpace: 'nowrap',
                  }}
                >
                  {column.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {data.slice(0, 10).map((row, index) => (
              <TableRow
                key={index}
                hover
                sx={{ '&:nth-of-type(odd)': { bgcolor: 'action.hover' } }}
              >
                {summaryColumns.map((column) => (
                  <TableCell
                    key={column.key}
                    align={column.align || 'left'}
                    sx={{
                      whiteSpace: 'nowrap',
                      fontSize: '0.8rem',
                    }}
                  >
                    {formatCellValue(row[column.key], column)}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {data.length > 10 && (
        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
          Showing first 10 of {data.length} records
        </Typography>
      )}
    </Box>
  );
};

export default SummaryTable;