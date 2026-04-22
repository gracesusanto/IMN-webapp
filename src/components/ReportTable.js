import React, { useState } from 'react';
import axios from 'axios';
import {
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Chip,
  Box,
  Button,
  Collapse,
  IconButton,
  Alert,
  Tooltip,
  Drawer,
  Divider,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { ExpandMore, ExpandLess, Help, Info, Analytics, History } from '@mui/icons-material';
import { API_CONFIG } from '../constants/config';

const ReportTable = ({
  data,
  columns,
  reportType,
  rowCount = 0,
  page = 0,
  pageSize = 20,
  onPageChange,
  onPageSizeChange,
  onDownload,
  onRowClick,
  isLoading = false
}) => {
  const [viewMode, setViewMode] = useState('compact');
  const [helpExpanded, setHelpExpanded] = useState(false);
  const [selectedRow, setSelectedRow] = useState(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rowHistory, setRowHistory] = useState(null);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Helper functions for consistent KPI calculations
  const getPctNumber = (value) => {
    if (value == null) return 0;
    if (typeof value === 'number') return value;
    const parsed = parseFloat(String(value).replace('%', ''));
    return Number.isFinite(parsed) ? parsed : 0;
  };

  const toMinutesFromHHMM = (value) => {
    if (!value || typeof value !== 'string' || !value.includes(':')) return 0;
    const [hh, mm] = value.split(':').map((v) => parseInt(v, 10));
    if (!Number.isFinite(hh) || !Number.isFinite(mm)) return 0;
    return hh * 60 + mm;
  };

  const formatPct = (num) => `${Number(num || 0).toFixed(1)}%`;

  const formatPieces = (num) => Number(num || 0).toFixed(1);

  const getDisplayRow = (selectedRow, rowHistory) => {
    if (rowHistory?.summary && Object.keys(rowHistory.summary).length > 0) {
      return rowHistory.summary;
    }
    return selectedRow;
  };

  const getDrawerMetrics = (selectedRow, rowHistory) => {
    const displayRow = getDisplayRow(selectedRow, rowHistory);

    const planMinutes =
      rowHistory?.calculation?.plan_minutes ??
      displayRow?.plan_minutes ??
      toMinutesFromHHMM(displayRow?.plan);

    const utilityMinutes =
      rowHistory?.calculation?.utility_minutes ??
      displayRow?.utility_minutes ??
      toMinutesFromHHMM(displayRow?.utility);

    const downtimeMinutes =
      rowHistory?.calculation?.downtime_minutes ??
      displayRow?.downtime_minutes ??
      Math.max(0, planMinutes - utilityMinutes);

    const output = Number(displayRow?.output || 0);
    const reject = Number(displayRow?.reject || 0);
    const rework = Number(displayRow?.rework || 0);
    const totalOutput = output + reject + rework;
    const targetPerHour = Number(
      rowHistory?.calculation?.target_per_jam ??
      displayRow?.target_per_jam ??
      0
    );

    const runtimeHours = utilityMinutes / 60;
    const expectedOutput = runtimeHours * targetPerHour;

    const otrNum =
      rowHistory?.calculation?.otr_num ??
      (planMinutes > 0 ? (utilityMinutes / planMinutes) * 100 : 0);

    const perNum =
      rowHistory?.calculation?.per_num ??
      (expectedOutput > 0 ? (output / expectedOutput) * 100 : 0);

    const qrNum =
      rowHistory?.calculation?.qr_num ??
      (totalOutput > 0 ? (output / totalOutput) * 100 : 0);

    const oeeNum =
      rowHistory?.calculation?.oee_num ??
      ((otrNum * perNum * qrNum) / 10000);

    return {
      displayRow,
      planMinutes,
      utilityMinutes,
      downtimeMinutes,
      output,
      reject,
      rework,
      totalOutput,
      targetPerHour,
      runtimeHours,
      expectedOutput,
      otrNum,
      perNum,
      qrNum,
      oeeNum,
    };
  };
  // Get column configuration based on mode and report type
  const getColumns = () => {
    if (viewMode === 'compact') {
      return getCompactColumns();
    } else {
      return getDetailedColumns();
    }
  };

  // Compact columns for production investigation (recommended by user)
  const getCompactColumns = () => {
    let compactColumns;

    if (reportType === 'operator') {
      // Operator Report: STATUS | OPERATOR | MC NO. | PART NO / NAME | PROSES | ...
      compactColumns = [
        { key: 'status', label: 'STATUS', width: 80, frozen: true, frozenOffset: 0 },
        { key: 'operator', label: 'OPERATOR', width: 120, frozen: true, frozenOffset: 80 },
        { key: 'mc_no', label: 'MC NO.', width: 100, frozen: true, frozenOffset: 200 },
        { key: 'part_no_name', label: 'PART NO / NAME', width: 250, frozen: true, frozenOffset: 300 },
        { key: 'proses', label: 'PROSES', width: 80, frozen: true, frozenOffset: 550 },
        { key: 'target_per_jam', label: 'STD/JAM', width: 90 },
        { key: 'output', label: 'OUTPUT', width: 80 },
        { key: 'reject', label: 'REJECT', width: 80 },
        { key: 'plan', label: 'PLAN', width: 80 },
        { key: 'utility', label: 'RT', width: 80 },
        { key: 'total_dt', label: 'TOTAL DT', width: 80 },
        { key: 'per', label: 'PER', width: 80 },
        { key: 'otr', label: 'OTR', width: 80 },
        { key: 'qr', label: 'QR', width: 80 },
        { key: 'oee', label: 'OEE', width: 80 },
        { key: 'catatan', label: 'CATATAN', width: 200 },
        { key: 'tanggal', label: 'TANGGAL', width: 100 },
        { key: 'shift', label: 'SHIFT', width: 80 },
      ];
    } else {
      // Machine Report: STATUS | MC NO. | PART NO / NAME | PROSES | ...
      compactColumns = [
        { key: 'status', label: 'STATUS', width: 80, frozen: true, frozenOffset: 0 },
        { key: 'mc_no', label: 'MC NO.', width: 100, frozen: true, frozenOffset: 80 },
        { key: 'part_no_name', label: 'PART NO / NAME', width: 250, frozen: true, frozenOffset: 180 },
        { key: 'proses', label: 'PROSES', width: 80, frozen: true, frozenOffset: 430 },
        { key: 'target_per_jam', label: 'STD/JAM', width: 90 },
        { key: 'output', label: 'OUTPUT', width: 80 },
        { key: 'reject', label: 'REJECT', width: 80 },
        { key: 'plan', label: 'PLAN', width: 80 },
        { key: 'utility', label: 'RT', width: 80 },
        { key: 'total_dt', label: 'TOTAL DT', width: 80 },
        { key: 'per', label: 'PER', width: 80 },
        { key: 'otr', label: 'OTR', width: 80 },
        { key: 'qr', label: 'QR', width: 80 },
        { key: 'oee', label: 'OEE', width: 80 },
        { key: 'catatan', label: 'CATATAN', width: 200 },
        { key: 'tanggal', label: 'TANGGAL', width: 100 },
        { key: 'shift', label: 'SHIFT', width: 80 },
      ];
    }

    return compactColumns;
  };

  // Detailed columns with all time buckets (for advanced users)
  const getDetailedColumns = () => {
    const detailedColumns = [
      { key: 'status', label: 'STATUS', width: 80, frozen: true },
      { key: 'mc_no', label: 'MC NO.', width: 100, frozen: true },
      { key: 'part_no_name', label: 'PART NO / NAME', width: 200, frozen: true },
      { key: 'proses', label: 'PROSES', width: 80, frozen: true },
      { key: 'target_per_jam', label: 'TARGET PER JAM', width: 120 },
      { key: 'target_qty', label: 'TARGET QTY', width: 100 },
      { key: 'output', label: 'OUTPUT', width: 80 },
      { key: 'reject', label: 'REJECT', width: 80 },
      { key: 'plan', label: 'PLAN', width: 80 },
      { key: 'utility', label: 'RT', width: 80 },
      { key: 'tp', label: 'TP', width: 80 },
      { key: 'ts', label: 'TS', width: 80 },
      { key: 'qc', label: 'QC', width: 80 },
      { key: 'cm', label: 'CM', width: 80 },
      { key: 'no', label: 'NO', width: 80 },
      { key: 'np', label: 'NP', width: 80 },
      { key: 'nm', label: 'NM', width: 80 },
      { key: 'mp', label: 'MP', width: 80 },
      { key: 'bt', label: 'BT', width: 80 },
      { key: 'br', label: 'BR', width: 80 },
      { key: 'per', label: 'PER', width: 80 },
      { key: 'otr', label: 'OTR', width: 80 },
      { key: 'qr', label: 'QR', width: 80 },
      { key: 'oee', label: 'OEE', width: 80 },
      { key: 'catatan', label: 'CATATAN', width: 200 },
      { key: 'tanggal', label: 'TANGGAL', width: 100 },
      { key: 'shift', label: 'SHIFT', width: 80 },
    ];

    if (reportType === 'operator') {
      // Insert operator column after status for operator reports
      detailedColumns.splice(1, 0, { key: 'operator', label: 'OPERATOR', width: 120, frozen: true });
    }

    return detailedColumns;
  };

  const tableColumns = getColumns();

  // Column header tooltips
  const getColumnTooltip = (columnKey) => {
    const tooltips = {
      'status': 'Status of the summary row. Shows main condition: OK = normal running, MP = machine problem, TP = tooling problem, etc.',
      'operator': 'Operator name for this summary row (shown in Operator Report)',
      'mc_no': 'Machine number used in this summary row',
      'part_no_name': 'Part number and part name produced in this row',
      'proses': 'Process step for the part/tooling',
      'target_per_jam': 'Standard output per hour from tooling master. Used as target rate in performance calculation.',
      'output': 'Good output quantity in this row',
      'reject': 'Rejected quantity in this row',
      'plan': 'Counted planned production time for the row. Used as denominator for OTR.',
      'utility': 'Running Time / Utility Time (U). Time spent actually running productively.',
      'total_dt': 'Total Downtime within counted plan time. Formula: Plan − RT',
      'per': 'Performance Ratio = Output ÷ (RT × Std/Jam). Can exceed 100% when faster than target.',
      'otr': 'Operation Time Ratio / Availability = RT ÷ Plan. Low OTR = lost time/downtime.',
      'qr': 'Quality Ratio = Output ÷ (Output + Reject + Rework). Low QR = more quality loss.',
      'oee': 'Overall Equipment Effectiveness = OTR × PER × QR. Combines utilization, speed, and quality.',
      'catatan': 'Operational note/explanation for the row. May include problem descriptions or grouped notes.'
    };
    return tooltips[columnKey] || null;
  };

  // KPI calculation breakdowns for tooltips
  const getKpiBreakdown = (row, kpiType) => {
    const planMinutes = row.plan_minutes || 0;
    const rtMinutes = row.utility_minutes || 0;
    const output = row.output || 0;
    const reject = row.reject || 0;
    const rework = row.rework || 0;
    const targetPerHour = row.target_per_jam || 0;
    const totalOutput = output + reject + rework;

    // Avoid division by zero
    if (planMinutes === 0 || rtMinutes === 0 || targetPerHour === 0) {
      return 'Insufficient data for calculation';
    }

    switch (kpiType) {
      case 'otr':
        return `OTR = RT ÷ Plan

RT: ${rtMinutes} min
Plan: ${planMinutes} min

Calculated OTR: ${Math.round((rtMinutes / planMinutes) * 100)}%`;
      case 'per':
        const rtHours = rtMinutes / 60;
        const expectedOutput = rtHours * targetPerHour;
        return `PER = Output ÷ (RT × Std/Jam)

Output: ${output}
RT: ${rtHours.toFixed(1)} hours
Std/Jam: ${targetPerHour}

Expected Output: ${Math.round(expectedOutput)}
Calculated PER: ${expectedOutput > 0 ? Math.round((output / expectedOutput) * 100) : 0}%

Note: PER can exceed 100% when faster than target`;
      case 'qr':
        return `QR = Output ÷ (Output + Reject + Rework)

Output: ${output}
Reject: ${reject}
Rework: ${rework}
Total Output: ${totalOutput}

Calculated QR: ${totalOutput > 0 ? Math.round((output / totalOutput) * 100) : 0}%`;
      case 'oee':
        const otr = planMinutes > 0 ? (rtMinutes / planMinutes) * 100 : 0;
        const expectedOut = rtMinutes / 60 * targetPerHour;
        const per = expectedOut > 0 ? (output / expectedOut) * 100 : 0;
        const qr = totalOutput > 0 ? (output / totalOutput) * 100 : 0;
        return `OEE = OTR × PER × QR

OTR: ${Math.round(otr)}%
PER: ${Math.round(per)}%
QR: ${Math.round(qr)}%

Calculated OEE: ${Math.round(otr * per * qr / 10000)}%`;
      default:
        return '';
    }
  };

  // Get main downtime contributor
  const getMainDowntimeContributor = (row) => {
    const downtimeCodes = ['tp', 'ts', 'qc', 'cm', 'no', 'np', 'nm', 'mp', 'bt', 'br', 'tl'];
    let maxMinutes = 0;
    let maxCode = 'None';

    downtimeCodes.forEach(code => {
      const minutes = row[`${code}_minutes`] || 0;
      if (minutes > maxMinutes) {
        maxMinutes = minutes;
        maxCode = code.toUpperCase();
      }
    });

    return maxMinutes > 0 ? `${maxCode} (${Math.round(maxMinutes)} min)` : 'None';
  };

  const handleRowClick = async (row) => {
    console.log('Clicked row:', row);
    console.log('Clicked history_key:', row.history_key);
    setSelectedRow(row);
    setRowHistory(null);
    setDrawerOpen(true);

    // Check if row has history_key for the new API
    if (row.history_key) {
      setHistoryLoading(true);
      try {
        const response = await axios.post(
          `${API_CONFIG.BASE_URL}/api/reports/dashboard/row-history`,
          row.history_key
        );
        console.log('Row history response:', response.data);
        setRowHistory(response.data);
      } catch (error) {
        console.error('Failed to fetch row history:', error);
        // Check if it's a specific row history reconstruction failure
        if (error.response?.data?.found === false || error.response?.data?.error) {
          setRowHistory({
            error: error.response.data.error || 'Row history reconstruction failed',
            found: false
          });
        } else {
          setRowHistory({
            error: 'Failed to load timeline data. Please try again.',
            found: false
          });
        }
      } finally {
        setHistoryLoading(false);
      }
    } else {
      // No history_key - cannot reconstruct timeline/calculation details
      console.log('Row clicked without history_key:', row);
      setRowHistory({
        error: 'This row does not include history_key, so timeline/calculation details cannot be reconstructed.',
        found: false,
        summary: row,  // Still show the basic row info
        timeline: [],
        calculation: {}
      });
    }
  };

  const getStatusChip = (status) => {
    const statusMap = {
      'OK': { color: 'success', label: 'OK' },
      'MP': { color: 'error', label: 'MP' },
      'TP': { color: 'warning', label: 'TP' },
      'TS': { color: 'info', label: 'TS' },
      'QC': { color: 'warning', label: 'QC' },
      'CM': { color: 'warning', label: 'CM' },
      'NO': { color: 'default', label: 'NO' },
      'NP': { color: 'default', label: 'NP' },
      'NM': { color: 'default', label: 'NM' },
    };

    const config = statusMap[status] || { color: 'default', label: status };
    return <Chip label={config.label} color={config.color} size="small" />;
  };

  const formatCellValue = (value, column) => {
    if (!value && value !== 0) return '-';

    // Time columns (hours:minutes format)
    if (['plan', 'utility', 'tp', 'ts', 'qc', 'cm', 'no', 'np', 'nm', 'mp', 'bt', 'br', 'total_dt'].includes(column.key)) {
      return value;
    }

    // Percentage columns
    if (['per', 'otr', 'qr', 'oee'].includes(column.key)) {
      return typeof value === 'string' && value.includes('%') ? value : `${value}%`;
    }

    // Numeric columns
    if (['output', 'reject', 'target_qty', 'target_per_jam'].includes(column.key)) {
      return typeof value === 'number' ? value.toLocaleString() : value;
    }

    // CATATAN truncation for better scanability
    if (column.key === 'catatan') {
      if (!value) return '-';
      // Clean up raw transition text and truncate for compact view
      let cleanValue = value
        .replace(/^Keterangan:\s*/i, '')  // Remove "Keterangan:" prefix
        .replace(/,\s*Coil No:.*$/i, '')  // Remove coil/lot/pack details for compact view
        .trim();
      return cleanValue.length > 60 ? cleanValue.substring(0, 57) + '...' : cleanValue;
    }

    return value;
  };

  // Get color coding for KPI cells
  const getKpiCellStyle = (value, column) => {
    if (!['per', 'otr', 'qr', 'oee'].includes(column.key)) return {};

    const numValue = typeof value === 'string'
      ? parseFloat(value.replace('%', ''))
      : parseFloat(value) || 0;

    let color = 'inherit';
    let backgroundColor = 'transparent';

    if (column.key === 'oee') {
      if (numValue >= 85) {
        color = '#2e7d32'; // green
        backgroundColor = '#e8f5e8';
      } else if (numValue >= 70) {
        color = '#ed6c02'; // orange
        backgroundColor = '#fff4e6';
      } else {
        color = '#d32f2f'; // red
        backgroundColor = '#ffebee';
      }
    } else if (column.key === 'otr') {
      if (numValue >= 90) {
        color = '#2e7d32';
        backgroundColor = '#e8f5e8';
      } else if (numValue >= 75) {
        color = '#ed6c02';
        backgroundColor = '#fff4e6';
      } else {
        color = '#d32f2f';
        backgroundColor = '#ffebee';
      }
    } else if (column.key === 'per') {
      if (numValue >= 95) {
        color = '#2e7d32';
        backgroundColor = '#e8f5e8';
      } else if (numValue >= 80) {
        color = '#ed6c02';
        backgroundColor = '#fff4e6';
      } else {
        color = '#d32f2f';
        backgroundColor = '#ffebee';
      }
    } else if (column.key === 'qr') {
      if (numValue >= 99) {
        color = '#2e7d32';
        backgroundColor = '#e8f5e8';
      } else if (numValue >= 95) {
        color = '#ed6c02';
        backgroundColor = '#fff4e6';
      } else {
        color = '#d32f2f';
        backgroundColor = '#ffebee';
      }
    }

    return { color, backgroundColor };
  };

  if (isLoading) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          Loading report data...
        </Typography>
      </Paper>
    );
  }

  if (!data || data.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="h6" color="text.secondary">
          No report data available
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
          Try adjusting your filters or date range
        </Typography>
      </Paper>
    );
  }

  const HelpSection = () => (
    <Paper sx={{ mb: 2, border: '1px solid', borderColor: 'divider' }}>
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center',
          p: 1.5,
          cursor: 'pointer',
          '&:hover': { bgcolor: 'action.hover' }
        }}
        onClick={() => setHelpExpanded(!helpExpanded)}
      >
        <Help sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="subtitle1" sx={{ flexGrow: 1, fontWeight: 500 }}>
          How to read this table
        </Typography>
        <IconButton size="small">
          {helpExpanded ? <ExpandLess /> : <ExpandMore />}
        </IconButton>
      </Box>

      {!helpExpanded && (
        <Box sx={{ px: 2, pb: 1.5, color: 'text.secondary', fontSize: '0.875rem' }}>
          Each row = one shift summary. Hover over KPIs for formulas, column headers for definitions, click rows for calculation details.
        </Box>
      )}

      <Collapse in={helpExpanded}>
        <Box sx={{ p: 2, pt: 0 }}>
          {/* Section A - What one row means */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              📊 What one row means
            </Typography>
            <Alert severity="info" sx={{ mb: 1 }}>
              <Typography variant="body2">
                <strong>{reportType === 'mesin' ? 'Machine Report row meaning' : 'Operator Report row meaning'}</strong>
                <br />
                {reportType === 'mesin'
                  ? 'Each row represents Tanggal + Shift + Machine + Part + Proses. If the same machine runs the same part and proses multiple times in the same shift, those activities are merged into one summary row.'
                  : 'Each row represents Tanggal + Shift + Operator + Machine + Part + Proses. If the same operator works on the same machine-part-proses multiple times in the same shift, those activities are merged into one summary row.'
                }
              </Typography>
            </Alert>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              <strong>Why some {reportType === 'operator' ? 'operator ' : ''}rows have no machine or part:</strong>
              <br />
              Categories like <strong>NP (No Plan)</strong>, <strong>BT (Breaktime)</strong>, and <strong>BR (Briefing)</strong> are treated as non-machine activities. For those rows, machine/tooling/part may be blank or shown as "-".
            </Typography>
          </Box>

          {/* Section B - Column glossary */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              📚 Column glossary
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 2 }}>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>Identity</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                  • STATUS: main condition (OK, MP, TP, etc.)<br />
                  • MC NO.: machine<br />
                  {reportType === 'operator' && '• OPERATOR: operator name\n'}
                  • PART NO / NAME: product<br />
                  • PROSES: process step
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>Output</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                  • TARGET PER JAM: hourly target<br />
                  • TARGET QTY: expected quantity<br />
                  • OUTPUT: good output<br />
                  • REJECT: rejected quantity
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>Time</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                  • PLAN: counted planned time<br />
                  • RT: running / utility time (U: Utility)<br />
                  • TOTAL DT: counted downtime
                </Typography>
              </Box>
              <Box>
                <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.main' }}>Performance</Typography>
                <Typography variant="body2" sx={{ fontSize: '0.8rem' }}>
                  • PER: performance ratio<br />
                  • OTR: operation time ratio<br />
                  • QR: quality ratio<br />
                  • OEE: combined effectiveness
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Section C - Formulas */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              🧮 Formulas used in this table
            </Typography>
            <Paper sx={{ p: 1.5, bgcolor: 'grey.50', fontFamily: 'monospace', fontSize: '0.8rem' }}>
              <strong>Target Qty</strong> = Target per Jam × Plan Time (hours)<br />
              <strong>OTR</strong> = RT ÷ Plan<br />
              <strong>PER</strong> = Output ÷ (RT × Std/Jam)<br />
              <strong>QR</strong> = Good Output ÷ Total Output<br />
              <strong>OEE</strong> = OTR × PER × QR<br />
              <strong>Total Downtime</strong> = Plan − RT<br />
              <br />
              <em>Total Output = Output + Reject + Rework</em><br />
              <em>Good Output = Output</em><br />
              <br />
              <strong>Can a KPI exceed 100%?</strong><br />
              • <strong>PER</strong> can be above 100% if actual output is higher than standard target<br />
              • <strong>OTR</strong> and <strong>QR</strong> should normally stay at or below 100%<br />
              • <strong>OEE</strong> can exceed 100% only if PER exceeds 100%
            </Paper>
          </Box>

          {/* Section D - How to interpret */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              🎯 How to understand the numbers
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 1 }}>
              <Alert severity="warning" sx={{ py: 0.5 }}>
                <Typography variant="body2"><strong>Low OTR:</strong> utilization/downtime problem</Typography>
              </Alert>
              <Alert severity="info" sx={{ py: 0.5 }}>
                <Typography variant="body2"><strong>Low PER:</strong> slower than target</Typography>
              </Alert>
              <Alert severity="error" sx={{ py: 0.5 }}>
                <Typography variant="body2"><strong>Low QR:</strong> quality loss problem</Typography>
              </Alert>
              <Alert severity="success" sx={{ py: 0.5 }}>
                <Typography variant="body2"><strong>High OEE:</strong> all factors working well</Typography>
              </Alert>
            </Box>
            <Typography variant="body2" sx={{ mt: 1, color: 'text.secondary' }}>
              <strong>Read the row in this order:</strong> Status → Plan/RT/Total DT → PER/OTR/QR/OEE → Catatan → Click for history
            </Typography>
          </Box>

          {/* Section E - Merged rows */}
          <Box>
            <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 600 }}>
              🔗 Merged row behavior
            </Typography>
            <Typography variant="body2" sx={{ color: 'text.secondary' }}>
              A summary row may combine several underlying activities from the same shift. That is why:
            </Typography>
            <Typography variant="body2" sx={{ mt: 1, ml: 2, color: 'text.secondary' }}>
              • Time buckets are summed<br />
              • Output/reject/rework are summed<br />
              • Catatan may contain multiple notes<br />
              <br />
              <strong>Click the row to see the underlying activity history used to build that summary.</strong>
            </Typography>
          </Box>
        </Box>
      </Collapse>
    </Paper>
  );

  return (
    <Box>
      {/* Help Section */}
      <HelpSection />

      {/* Header and Controls */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          📋 {reportType === 'mesin' ? 'Machine' : 'Operator'} Dashboard Table
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Button
            variant={viewMode === 'compact' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('compact')}
            size="small"
          >
            Compact
          </Button>
          <Button
            variant={viewMode === 'detailed' ? 'contained' : 'outlined'}
            onClick={() => setViewMode('detailed')}
            size="small"
          >
            Detailed
          </Button>
          <Button
            variant="contained"
            onClick={onDownload}
            disabled={isLoading}
          >
            Download CSV
          </Button>
        </Box>
      </Box>

      {/* Table */}
      <TableContainer component={Paper} sx={{ maxHeight: 600, overflowX: 'auto' }}>
        <Table stickyHeader size="small" sx={{ minWidth: 2000 }}>
          <TableHead>
            <TableRow>
              {tableColumns.map((column) => {
                const tooltip = getColumnTooltip(column.key);
                const headerContent = (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                    {column.label}
                    {tooltip && <Info sx={{ fontSize: 14, opacity: 0.7 }} />}
                  </Box>
                );

                return (
                  <TableCell
                    key={column.key}
                    sx={{
                      fontWeight: 'bold',
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      minWidth: column.width,
                      whiteSpace: 'nowrap',
                      ...(column.frozen && {
                        position: 'sticky',
                        left: column.frozenOffset || 0,
                        zIndex: 10,
                      }),
                    }}
                  >
                    {tooltip ? (
                      <Tooltip title={tooltip} arrow placement="top">
                        {headerContent}
                      </Tooltip>
                    ) : (
                      column.label
                    )}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>

          <TableBody>
            {data.map((row, index) => (
              <TableRow
                key={index}
                hover
                onClick={() => handleRowClick(row)}
                sx={{
                  '&:nth-of-type(odd)': { bgcolor: 'action.hover' },
                  cursor: 'pointer',
                  '&:hover': { bgcolor: 'primary.light', '& *': { color: 'primary.contrastText !important' } }
                }}
              >
                {tableColumns.map((column) => {
                  const isKpiColumn = ['per', 'otr', 'qr', 'oee'].includes(column.key);
                  const cellContent = column.key === 'status' ?
                    getStatusChip(row[column.key]) :
                    formatCellValue(row[column.key], column);

                  return (
                    <TableCell
                      key={column.key}
                      sx={{
                        whiteSpace: 'nowrap',
                        fontSize: '0.75rem',
                        ...(column.frozen && {
                          position: 'sticky',
                          left: column.frozenOffset || 0,
                          backgroundColor: 'background.paper',
                          zIndex: 5,
                        }),
                        // Special styling for PART NO / NAME column
                        ...(column.key === 'part_no_name' && {
                          maxWidth: column.width,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          fontWeight: '500',
                        }),
                        ...getKpiCellStyle(row[column.key], column),
                      }}
                    >
                      {isKpiColumn && row[column.key] !== '-' ? (
                        <Tooltip
                          title={getKpiBreakdown(row, column.key)}
                          arrow
                          placement="top"
                          componentsProps={{
                            tooltip: { sx: { whiteSpace: 'pre-line', maxWidth: 300 } }
                          }}
                        >
                          <Box component="span" sx={{ cursor: 'help' }}>
                            {cellContent}
                          </Box>
                        </Tooltip>
                      ) : (
                        cellContent
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Pagination */}
      <TablePagination
        component="div"
        count={rowCount}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={pageSize}
        onRowsPerPageChange={onPageSizeChange}
        rowsPerPageOptions={[10, 20, 50, 100]}
        showFirstButton
        showLastButton
      />

      {/* Row History Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        PaperProps={{ sx: { width: 600, p: 3 } }}
      >
        {selectedRow && (() => {
          const {
            displayRow,
            planMinutes,
            utilityMinutes,
            downtimeMinutes,
            output,
            reject,
            rework,
            totalOutput,
            targetPerHour,
            runtimeHours,
            expectedOutput,
            otrNum,
            perNum,
            qrNum,
            oeeNum,
          } = getDrawerMetrics(selectedRow, rowHistory);

          return (
          <Box>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <History sx={{ mr: 1, color: 'primary.main' }} />
              <Typography variant="h6">Row History & Timeline</Typography>
            </Box>

            {/* Row Identity */}
            <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
              <Typography variant="subtitle2" gutterBottom>Row Summary</Typography>
              <Typography variant="body2">
                <strong>Machine:</strong> {displayRow.mc_no}<br />
                {reportType === 'operator' && (
                  <>
                    <strong>Operator:</strong> {displayRow.operator}<br />
                  </>
                )}
                <strong>Part:</strong> {displayRow.part_no_name}<br />
                <strong>Process:</strong> {displayRow.proses}<br />
                <strong>Date/Shift:</strong> {displayRow.tanggal} Shift {displayRow.shift}<br />
                <strong>Status:</strong> {displayRow.status}
              </Typography>
            </Paper>

            {/* Loading State */}
            {historyLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                <CircularProgress />
                <Typography sx={{ ml: 2 }}>Loading timeline...</Typography>
              </Box>
            )}

            {/* Row History Content */}
            {rowHistory && !historyLoading && (
              <>
                {/* Error State */}
                {rowHistory.error && (
                  <Alert severity="error" sx={{ mb: 2 }}>
                    {rowHistory.error}
                  </Alert>
                )}

                {/* Timeline */}
                {rowHistory.timeline && rowHistory.timeline.length > 0 && (
                  <>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                      🕒 Activity Timeline ({rowHistory.timeline.length} activities)
                    </Typography>

                    <Paper sx={{ maxHeight: 300, overflow: 'auto', mb: 3 }}>
                      <List dense>
                        {rowHistory.timeline.map((activity, index) => (
                          <ListItem key={index} divider>
                            <ListItemText
                              primary={
                                <Box>
                                  <Typography variant="body2" component="span" sx={{ fontWeight: 500 }}>
                                    {activity.desc}
                                  </Typography>
                                  <Chip
                                    label={`${Math.round(activity.duration_minutes)} min`}
                                    size="small"
                                    sx={{ ml: 1 }}
                                  />
                                </Box>
                              }
                              secondary={
                                <Box sx={{ mt: 0.5 }}>
                                  <Typography variant="caption" display="block">
                                    {new Date(activity.start_time).toLocaleTimeString('id-ID')} - {new Date(activity.stop_time).toLocaleTimeString('id-ID')}
                                  </Typography>
                                  {(activity.qty > 0 || activity.reject > 0 || activity.rework > 0) && (
                                    <Typography variant="caption" display="block">
                                      Output: {activity.qty} | Reject: {activity.reject} | Rework: {activity.rework}
                                    </Typography>
                                  )}
                                  {activity.keterangan && (
                                    <Typography variant="caption" display="block" sx={{ fontStyle: 'italic' }}>
                                      {activity.keterangan}
                                    </Typography>
                                  )}
                                </Box>
                              }
                            />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  </>
                )}

                {/* KPI Calculations - corrected with consistent source */}
                {rowHistory && !historyLoading && !rowHistory.error && rowHistory.calculation && Object.keys(rowHistory.calculation).length > 0 && (
                  <>
                    <Typography variant="subtitle1" sx={{ mb: 2, fontWeight: 600 }}>
                      📊 KPI Calculation Breakdown
                    </Typography>

                    <Paper sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        OTR (Operation Time Rate): {displayRow.otr || formatPct(otrNum)}
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre-line' }}>
                        {`Formula: utility_minutes / plan_minutes
Utility Time (U): ${utilityMinutes.toFixed(1)} min
Plan Time: ${planMinutes.toFixed(1)} min
Calculation: ${utilityMinutes.toFixed(1)} ÷ ${planMinutes.toFixed(1)}
Result: ${formatPct(otrNum)} = ${displayRow.otr || formatPct(otrNum)}`}
                      </Typography>
                    </Paper>

                    <Paper sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        PER (Performance Rate): {displayRow.per || formatPct(perNum)}
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre-line' }}>
                        {`Formula: output / (utility_hours * target_per_jam)
Good Output: ${output}
Utility Time (U): ${utilityMinutes.toFixed(1)} min = ${runtimeHours.toFixed(2)} hours
Std/Jam: ${targetPerHour}
Expected Output: ${formatPieces(expectedOutput)} pieces
Calculation: ${output} ÷ ${formatPieces(expectedOutput)}
Result: ${formatPct(perNum)} = ${displayRow.per || formatPct(perNum)}`}
                      </Typography>
                      {perNum > 100 && (
                        <Typography variant="caption" sx={{ color: 'success.main', display: 'block', mt: 1 }}>
                          ✓ Faster than standard target
                        </Typography>
                      )}
                    </Paper>

                    <Paper sx={{ p: 2, mb: 2 }}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        QR (Quality Rate): {displayRow.qr || formatPct(qrNum)}
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre-line' }}>
                        {`Formula: output / (output + reject + rework)
Calculation: ${output} ÷ ${totalOutput}
Result: ${formatPct(qrNum)} = ${displayRow.qr || formatPct(qrNum)}`}
                      </Typography>
                    </Paper>

                    <Paper sx={{ p: 2, mb: 2, bgcolor: 'primary.light', color: 'primary.contrastText' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        OEE (Overall Equipment Effectiveness): {displayRow.oee || formatPct(oeeNum)}
                      </Typography>
                      <Typography variant="body2" sx={{ fontFamily: 'monospace', fontSize: '0.8rem', whiteSpace: 'pre-line' }}>
                        {`Formula: otr * per * qr
Calculation: ${formatPct(otrNum)} × ${formatPct(perNum)} × ${formatPct(qrNum)}
Result: ${formatPct(oeeNum)} = ${displayRow.oee || formatPct(oeeNum)}`}
                      </Typography>
                    </Paper>

                    <Paper sx={{ p: 2, bgcolor: 'warning.light' }}>
                      <Typography variant="subtitle2" gutterBottom>
                        🔧 Time Breakdown
                      </Typography>
                      <Typography variant="body2">
                        <strong>Plan Time:</strong> {planMinutes.toFixed(1)} min<br />
                        <strong>Utility Time (U):</strong> {utilityMinutes.toFixed(1)} min<br />
                        <strong>Downtime:</strong> {downtimeMinutes.toFixed(1)} min<br />
                        <strong>Main Downtime:</strong> {getMainDowntimeContributor(displayRow)}
                      </Typography>
                    </Paper>
                  </>
                )}

                {/* Empty State Messages */}
                {rowHistory && !rowHistory.timeline?.length && !rowHistory.error && (!rowHistory.calculation || Object.keys(rowHistory.calculation).length === 0) && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No detailed history data available for this row. This may happen if the row data was not found during reconstruction.
                  </Alert>
                )}

                {rowHistory && !rowHistory.timeline?.length && !rowHistory.error && rowHistory.calculation && Object.keys(rowHistory.calculation).length > 0 && (
                  <Alert severity="info" sx={{ mt: 2 }}>
                    No detailed timeline data available, but KPI calculations are shown above.
                  </Alert>
                )}
              </>
            )}
          </Box>
          );
        })()}
      </Drawer>
    </Box>
  );
};

export default ReportTable;