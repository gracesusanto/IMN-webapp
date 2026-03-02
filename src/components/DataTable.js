import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import {
  DataGrid,
} from "@mui/x-data-grid";
import {
  Box,
  Stack,
  Button,
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormControlLabel,
  Checkbox,
  TextField,
  Typography,
  MenuItem,
} from "@mui/material";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import SortIcon from "@mui/icons-material/Sort";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";
import QrCodeIcon from "@mui/icons-material/QrCode";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import axios from "axios";

/**
 * Analyze column content lengths and return statistics
 */
function analyzeColumnStats(data, field) {
  if (!data || data.length === 0) {
    return {
      field,
      count: 0,
      average: 0,
      median: 0,
      percentile60: 0,
      percentile75: 0,
      percentile90: 0,
      min: 0,
      max: 0
    };
  }

  // Get all text lengths for this column
  const lengths = data
    .map(row => {
      const value = row[field];
      if (value === null || value === undefined) return 0;
      return String(value).length;
    })
    .filter(length => length >= 0)
    .sort((a, b) => a - b);

  if (lengths.length === 0) {
    return { field, count: 0, average: 0, median: 0, percentile60: 0, percentile75: 0, percentile90: 0, min: 0, max: 0 };
  }

  // Calculate statistics
  const count = lengths.length;
  const sum = lengths.reduce((a, b) => a + b, 0);
  const average = Math.round(sum / count * 10) / 10; // Round to 1 decimal

  const median = lengths[Math.floor(count * 0.5)];
  const percentile60 = lengths[Math.floor(count * 0.6)];
  const percentile75 = lengths[Math.floor(count * 0.75)];
  const percentile90 = lengths[Math.floor(count * 0.90)];
  const min = lengths[0];
  const max = lengths[count - 1];

  return {
    field,
    count,
    average,
    median,
    percentile60,
    percentile75,
    percentile90,
    min,
    max
  };
}

/**
 * Log column statistics to console for analysis
 */
function logColumnStatistics(data, columns) {
  console.log('📊 COLUMN CONTENT LENGTH ANALYSIS');
  console.log('=====================================');

  const stats = columns.map(c => {
    const field = c.accessor || c.id;
    return analyzeColumnStats(data, field);
  });

  stats.forEach(stat => {
    console.log(`\n🔸 Column: ${stat.field}`);
    console.log(`   Rows analyzed: ${stat.count}`);
    console.log(`   Average length: ${stat.average} characters`);
    console.log(`   Median (50th percentile): ${stat.median} characters`);
    console.log(`   60th percentile: ${stat.percentile60} characters`);
    console.log(`   75th percentile: ${stat.percentile75} characters`);
    console.log(`   90th percentile: ${stat.percentile90} characters`);
    console.log(`   Range: ${stat.min} - ${stat.max} characters`);
    console.log(`   Recommended width: ${stat.percentile75 * 7 + 24}px (75th percentile, compact)`);
  });

  // Summary table
  console.log('\n📋 SUMMARY TABLE');
  console.table(stats.map(s => ({
    Column: s.field,
    'Avg Chars': s.average,
    '60th %ile': s.percentile60,
    '75th %ile': s.percentile75,
    'Compact Width (px)': Math.min(180, Math.max(70, s.percentile60 * 7 + 24))
  })));
}

/**
 * Calculate optimal column width based on content length percentiles
 */
function calculateColumnWidth(data, field, percentile = 0.75) {
  const stats = analyzeColumnStats(data, field);

  let targetLength;
  if (percentile === 0.75) targetLength = stats.percentile75;
  else if (percentile === 0.90) targetLength = stats.percentile90;
  else if (percentile === 0.60) targetLength = stats.percentile60;
  else if (percentile === 0.50) targetLength = stats.median;
  else {
    // Custom percentile calculation
    const lengths = data
      .map(row => String(row[field] || '').length)
      .filter(length => length >= 0)
      .sort((a, b) => a - b);
    const index = Math.floor(lengths.length * percentile);
    targetLength = lengths[Math.max(0, Math.min(index, lengths.length - 1))];
  }

  // Convert character length to approximate pixel width (accounting for padding)
  const baseWidth = Math.max(70, targetLength * 7 + 32); // Include padding space

  // Cap the width to reasonable bounds (more compact but not cramped)
  return Math.min(200, Math.max(80, baseWidth)); // Min 80px to prevent cramping
}

/**
 * Your pages pass react-table style columns:
 *  - { Header, accessor, Cell? }
 * We convert to MUI DataGrid columns with dynamic width:
 *  - { field, headerName, width, renderCell? }
 */
function toMuiColumns(columns, data, widthPercentile = 0.6, containerWidth = 1200, modelType = "mesin", onShowBarcode, handleEdit, confirmDelete) {

  // First pass: calculate compact widths for all columns
  const compactWidths = (columns || []).map((c) => {
    const field = c.accessor || c.id;
    const header = c.Header || field;

    // Calculate dynamic width for text columns
    const dynamicWidth = calculateColumnWidth(data, field, widthPercentile);
    const headerLength = header.length * 6 + 32; // Add extra space for padding
    const optimalWidth = Math.max(dynamicWidth, headerLength);
    return {
      field,
      compactWidth: Math.min(optimalWidth + 8, 150), // Add buffer for padding
      isFlexible: true // Text columns can expand
    };
  });

  // Calculate total compact width
  const totalCompactWidth = compactWidths.reduce((total, col) => total + col.compactWidth, 0);
  const shouldUseCompactMode = totalCompactWidth > containerWidth * 0.95; // Use 95% threshold

  console.log(`📐 Table width analysis: ${totalCompactWidth}px total vs ${containerWidth}px container = ${shouldUseCompactMode ? 'COMPACT' : 'FULL WIDTH'} mode`);

  const dataColumns = (columns || []).map((c, index) => {
    const field = c.accessor || c.id;
    const header = c.Header || field;
    const colInfo = compactWidths[index];

    if (shouldUseCompactMode) {
      // COMPACT MODE: Use fixed widths when table is too wide
      return {
        field,
        headerName: header,
        width: c.width || colInfo.compactWidth,
        flex: 0,
        minWidth: colInfo.isFlexible ? 60 : Math.min(colInfo.compactWidth - 20, 50),
        maxWidth: colInfo.compactWidth + 60,
        sortable: true,
        filterable: true,
        resizable: true,
        renderCell: c.Cell ? (params) => c.Cell({ value: params.value, row: { original: params.row } }) : undefined,
      };
    } else {
      // FULL WIDTH MODE: Use flex to expand when there's space
      const isActionColumn = field.toLowerCase().includes('action') || header.toLowerCase().includes('action');

      return {
        field,
        headerName: header,
        minWidth: colInfo.compactWidth,
        flex: colInfo.isFlexible ? 1 : 0, // Flexible columns expand, fixed ones stay fixed
        width: !colInfo.isFlexible ? colInfo.compactWidth : undefined, // Fixed width for non-flexible columns
        maxWidth: isActionColumn ? 250 : undefined, // Actions column cap to prevent over-expansion
        sortable: true,
        filterable: true,
        resizable: true,
        renderCell: c.Cell ? (params) => c.Cell({ value: params.value, row: { original: params.row } }) : undefined,
      };
    }
  });

  // Only add/enhance Actions for model tables (tooling, operator, mesin) with proper handlers
  const normalizedModelType = modelType.toLowerCase().replace(/s$/, ''); // Remove plural 's'
  const isModelTable = ['tooling', 'operator', 'mesin'].includes(normalizedModelType);
  const hasActionHandlers = typeof handleEdit === 'function' && typeof confirmDelete === 'function';

  // Debug logging
  console.log('DataTable modelType:', modelType, 'normalized:', normalizedModelType, 'isModelTable:', isModelTable, 'hasActionHandlers:', hasActionHandlers);

  // Check if there's already an actions column from the original GenericPage pattern
  const hasExistingActions = dataColumns.some(col =>
    col.field?.toLowerCase().includes('action') ||
    col.headerName?.toLowerCase().includes('action') ||
    col.id?.toLowerCase().includes('action')
  );

  if (isModelTable && hasActionHandlers && hasExistingActions) {
    // Replace existing actions column with full MUI-based buttons
    return dataColumns.map(col => {
      if (col.field?.toLowerCase().includes('action') ||
          col.headerName?.toLowerCase().includes('action') ||
          col.id?.toLowerCase().includes('action')) {

        return {
          ...col,
          field: 'actions',
          headerName: 'Actions',
          width: 180,
          renderCell: (params) => (
            <Stack direction="row" spacing={1}>
              {/* Modify Button */}
              <IconButton
                size="small"
                onClick={() => handleEdit(params.row)}
                sx={{
                  color: '#059669',
                  '&:hover': {
                    backgroundColor: 'rgba(5, 150, 105, 0.1)',
                  },
                }}
                title="Modify"
              >
                <EditIcon fontSize="small" />
              </IconButton>

              {/* Delete Button */}
              <IconButton
                size="small"
                onClick={() => confirmDelete(params.row.id)}
                sx={{
                  color: '#dc2626',
                  '&:hover': {
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                  },
                }}
                title="Delete"
              >
                <DeleteIcon fontSize="small" />
              </IconButton>

              {/* Barcode Button */}
              <IconButton
                size="small"
                onClick={() => onShowBarcode(params.row.id)}
                sx={{
                  color: '#3b82f6',
                  '&:hover': {
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                  },
                }}
                title="Show Barcode"
              >
                <QrCodeIcon fontSize="small" />
              </IconButton>
            </Stack>
          ),
        };
      }
      return col;
    });
  } else if (isModelTable && hasActionHandlers) {
    // No existing actions column for model table - add our own with full functionality
    const actionsColumn = {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      sortable: false,
      filterable: false,
      disableColumnMenu: true,
      renderCell: (params) => (
        <Stack direction="row" spacing={1}>
          {/* Modify Button */}
          <IconButton
            size="small"
            onClick={() => handleEdit(params.row)}
            sx={{
              color: '#059669',
              '&:hover': {
                backgroundColor: 'rgba(5, 150, 105, 0.1)',
              },
            }}
            title="Modify"
          >
            <EditIcon fontSize="small" />
          </IconButton>

          {/* Delete Button */}
          <IconButton
            size="small"
            onClick={() => confirmDelete(params.row.id)}
            sx={{
              color: '#dc2626',
              '&:hover': {
                backgroundColor: 'rgba(220, 38, 38, 0.1)',
              },
            }}
            title="Delete"
          >
            <DeleteIcon fontSize="small" />
          </IconButton>

          {/* Barcode Button */}
          <IconButton
            size="small"
            onClick={() => onShowBarcode(params.row.id)}
            sx={{
              color: '#3b82f6',
              '&:hover': {
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
              },
            }}
            title="Show Barcode"
          >
            <QrCodeIcon fontSize="small" />
          </IconButton>
        </Stack>
      ),
    };

    return [...dataColumns, actionsColumn];
  } else {
    // Not a model table or missing action handlers (reports, etc.) - no Actions column needed
    return dataColumns;
  }
}

// Column Visibility Dialog
function ColumnVisibilityDialog({ open, onClose, columns, columnVisibilityModel, onColumnVisibilityChange }) {
  const handleToggle = (field) => {
    const newModel = { ...columnVisibilityModel };
    newModel[field] = !(columnVisibilityModel[field] ?? true);
    onColumnVisibilityChange(newModel);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Show/Hide Columns</DialogTitle>
      <DialogContent>
        <Stack spacing={1}>
          {columns.map((col) => {
            const field = col.accessor || col.id;
            const header = col.Header || field;
            const isVisible = columnVisibilityModel[field] ?? true;

            return (
              <FormControlLabel
                key={field}
                control={
                  <Checkbox
                    checked={isVisible}
                    onChange={() => handleToggle(field)}
                    size="small"
                  />
                }
                label={header}
                sx={{ fontSize: '0.875rem' }}
              />
            );
          })}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
}

// Multi-Sort Dialog
function MultiSortDialog({ open, onClose, columns, sortModel, onSortChange }) {
  const [localSortModel, setLocalSortModel] = useState([]);

  useEffect(() => {
    setLocalSortModel(sortModel || []);
  }, [sortModel, open]);

  const addSort = () => {
    setLocalSortModel([...localSortModel, { field: columns[0]?.accessor || columns[0]?.id, sort: 'asc' }]);
  };

  const removeSort = (index) => {
    const newModel = localSortModel.filter((_, i) => i !== index);
    setLocalSortModel(newModel);
  };

  const updateSort = (index, field, sort) => {
    const newModel = [...localSortModel];
    newModel[index] = { field, sort };
    setLocalSortModel(newModel);
  };

  const handleApply = () => {
    onSortChange(localSortModel);
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Multi-Column Sorting</DialogTitle>
      <DialogContent>
        <Stack spacing={2}>
          {localSortModel.map((sort, index) => (
            <Stack key={index} direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" sx={{ minWidth: 60 }}>
                {index + 1}.
              </Typography>
              <TextField
                select
                label="Column"
                value={sort.field}
                onChange={(e) => updateSort(index, e.target.value, sort.sort)}
                size="small"
                sx={{ minWidth: 200 }}
              >
                {columns.map((col) => {
                  const field = col.accessor || col.id;
                  const header = col.Header || field;
                  return (
                    <MenuItem key={field} value={field}>
                      {header}
                    </MenuItem>
                  );
                })}
              </TextField>
              <TextField
                select
                label="Order"
                value={sort.sort}
                onChange={(e) => updateSort(index, sort.field, e.target.value)}
                size="small"
                sx={{ minWidth: 120 }}
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </TextField>
              <IconButton onClick={() => removeSort(index)} size="small">
                <ClearIcon />
              </IconButton>
            </Stack>
          ))}
          <Button onClick={addSort} variant="outlined" size="small" sx={{ alignSelf: 'flex-start' }}>
            Add Sort Level
          </Button>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleApply} variant="contained">Apply</Button>
      </DialogActions>
    </Dialog>
  );
}

// Barcode Dialog
function BarcodeDialog({ open, onClose, modelType, recordId }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create a unique URL with timestamp to avoid caching issues
  // Determine correct model from recordId prefix or use modelType
  const getModelFromId = (id) => {
    if (id.startsWith('TL-')) return 'tooling';
    if (id.startsWith('MC-')) return 'mesin';
    if (id.startsWith('OP-')) return 'operator';
    return modelType; // fallback to prop
  };

  const actualModelType = recordId ? getModelFromId(recordId) : modelType;
  const barcodeUrl = recordId ? `/barcode?model=${actualModelType}&id=${encodeURIComponent(recordId)}&t=${Date.now()}` : null;

  useEffect(() => {
    if (open && recordId) {
      setLoading(true);
      setError(null);

      // Test if the barcode URL is accessible
      const testImg = new Image();
      testImg.onload = () => {
        setLoading(false);
        setError(null);
      };
      testImg.onerror = () => {
        setLoading(false);
        setError(`Failed to load barcode for ${recordId}`);
      };
      testImg.src = barcodeUrl;
    }
  }, [open, recordId, barcodeUrl]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Barcode for {actualModelType.toUpperCase()}: {recordId}
      </DialogTitle>
      <DialogContent sx={{ textAlign: 'center', py: 3 }}>
        {loading && (
          <Typography color="text.secondary">Loading barcode...</Typography>
        )}
        {error && (
          <Typography color="error">{error}</Typography>
        )}
        {barcodeUrl && !loading && !error && (
          <img
            src={barcodeUrl}
            alt={`Barcode for ${recordId}`}
            style={{
              maxWidth: '100%',
              height: 'auto',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '16px',
              backgroundColor: 'white'
            }}
            onError={() => setError(`Failed to load barcode for ${recordId}`)}
          />
        )}
        {!loading && !error && !barcodeUrl && (
          <Typography color="text.secondary">No record selected</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {barcodeUrl && !error && (
          <Button
            variant="contained"
            onClick={() => {
              // Download the barcode image by opening in new tab
              window.open(barcodeUrl, '_blank');
            }}
          >
            Download
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}


export default function DataTable({
  columns,
  data,
  exportFileName,
  modelType = "mesin", // "mesin", "operator", "tooling" - determines which model export API endpoint to call
  showExportButton = true, // Show/hide the Export CSV button
  getRowId,
  height = 620,
  widthPercentile = 0.6, // 60th percentile by default - more compact
  showColumnStats = false, // Set to true to log column statistics
  handleEdit, // Function to handle edit button clicks - passed from GenericPage.js
  confirmDelete, // Function to handle delete button clicks - passed from GenericPage.js
}) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(1200); // Default assumption
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({});

  // Add state for toolbar features
  const [searchValue, setSearchValue] = useState('');
  const [sortModel, setSortModel] = useState([]);
  const [filterModel, setFilterModel] = useState({ items: [] });
  const [columnOrderModel, setColumnOrderModel] = useState([]);

  // Dialog states
  const [columnDialogOpen, setColumnDialogOpen] = useState(false);
  const [sortDialogOpen, setSortDialogOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [barcodeDialogOpen, setBarcodeDialogOpen] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);

  // Handle search change
  const handleSearchChange = useCallback((value) => {
    setSearchValue(value);
    if (value) {
      // Create a quick filter for all visible columns
      const visibleFields = columns
        .filter(col => {
          const field = col.accessor || col.id;
          return columnVisibilityModel[field] !== false;
        })
        .map(col => col.accessor || col.id);

      setFilterModel({
        items: [{
          id: 'search',
          field: visibleFields[0] || 'id',
          operator: 'contains',
          value: value,
        }],
        quickFilterValues: [value],
      });
    } else {
      setFilterModel({ items: [] });
    }
  }, [columns, columnVisibilityModel]);

  // Handle clear filters
  const handleClearFilters = useCallback(() => {
    setFilterModel({ items: [] });
    setSearchValue('');
  }, []);

  // Count active filters
  const activeFiltersCount = filterModel.items.filter(item =>
    item.value && item.value !== ''
  ).length;

  // Handle column order change with debugging
  const handleColumnOrderChange = useCallback((newOrder) => {
    console.log('📋 Column order changed:', newOrder);
    setColumnOrderModel(newOrder);
  }, []);

  // Initialize column visibility - hide less important columns by default
  useEffect(() => {
    if (columns && columns.length > 6) {
      const initialVisibility = {};
      columns.forEach(col => {
        const field = col.accessor || col.id;
        const header = col.Header || field;
        const fieldLower = field.toLowerCase();
        const headerLower = header.toLowerCase();

        // Hide columns that are typically less important
        if (
          headerLower.includes('description') ||
          headerLower.includes('keterangan') ||
          headerLower.includes('note') ||
          headerLower.includes('remark') ||
          fieldLower.includes('desc') ||
          fieldLower.includes('comment')
        ) {
          initialVisibility[field] = false;
        }
      });

      // Only update if we have columns to hide and haven't set visibility yet
      if (Object.keys(initialVisibility).length > 0 && Object.keys(columnVisibilityModel).length === 0) {
        setColumnVisibilityModel(initialVisibility);
      }
    }
  }, [columns, columnVisibilityModel]);

  // Detect actual container width
  useEffect(() => {
    const updateWidth = () => {
      if (containerRef.current) {
        const width = containerRef.current.offsetWidth || containerRef.current.clientWidth;
        if (width > 0) {
          setContainerWidth(width);
        }
      } else {
        // Fallback to window width if container not available
        setContainerWidth(Math.min(window.innerWidth - 100, 1400)); // Leave some margin
      }
    };

    updateWidth();
    window.addEventListener('resize', updateWidth);
    return () => window.removeEventListener('resize', updateWidth);
  }, []);

  // Log column statistics for analysis (when requested)
  useEffect(() => {
    if (showColumnStats && data && data.length > 0 && columns) {
      logColumnStatistics(data, columns);
    }
  }, [data, columns, showColumnStats]);

  // Handler for showing barcode
  const handleShowBarcode = useCallback((recordId) => {
    setSelectedRowId(recordId);
    setBarcodeDialogOpen(true);
  }, []);

  const muiColumns = useMemo(() => toMuiColumns(columns, data, widthPercentile, containerWidth, modelType, handleShowBarcode, handleEdit, confirmDelete), [columns, data, widthPercentile, containerWidth, modelType, handleShowBarcode, handleEdit, confirmDelete]);

  const rows = useMemo(() => {
    const arr = data || [];
    // Ensure every row has an id; if caller provides getRowId, DataGrid will use it.
    if (getRowId) return arr;
    return arr.map((r, idx) => {
      if (r && r.id !== undefined && r.id !== null) return r;
      return { id: idx, ...r };
    });
  }, [data, getRowId]);

  // Calculate total width needed for all columns (dynamic based on mode)
  const totalColumnsWidth = useMemo(() => {
    return muiColumns.reduce((total, col) => {
      // For flex columns, estimate based on minWidth; for fixed, use width
      return total + (col.width || col.minWidth || 140);
    }, 0);
  }, [muiColumns]);

  return (
    <Box
      ref={containerRef}
      sx={{
        width: "100%",
        height,
        overflow: 'auto', // Enable horizontal scrolling when needed
      }}
    >
      {/* External Toolbar - This WILL show */}
      <Box
        sx={{
          p: 2,
          backgroundColor: '#f8fafc',
          borderBottom: "1px solid #e2e8f0",
          borderRadius: '8px 8px 0 0',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'stretch',
          gap: 2,
        }}
      >
        {/* Top Row - Control Buttons */}
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          {/* Column Visibility */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<ViewColumnIcon />}
            onClick={() => setColumnDialogOpen(true)}
            sx={{ fontSize: '0.75rem' }}
          >
            Columns ({columns.filter(col => {
              const field = col.accessor || col.id;
              return columnVisibilityModel[field] !== false;
            }).length})
          </Button>

          {/* Multi-Sort */}
          <Button
            variant="outlined"
            size="small"
            startIcon={<SortIcon />}
            onClick={() => setSortDialogOpen(true)}
            sx={{ fontSize: '0.75rem' }}
            color={sortModel?.length > 0 ? 'primary' : 'inherit'}
          >
            Sort {sortModel?.length > 0 && `(${sortModel.length})`}
          </Button>

          {/* Search Toggle */}
          <Button
            variant={searchOpen ? 'contained' : 'outlined'}
            size="small"
            startIcon={<SearchIcon />}
            onClick={() => setSearchOpen(!searchOpen)}
            sx={{ fontSize: '0.75rem' }}
          >
            Search
          </Button>

          {/* Active Filter Count */}
          {activeFiltersCount > 0 && (
            <Chip
              label={`${activeFiltersCount} filter${activeFiltersCount > 1 ? 's' : ''} active`}
              size="small"
              color="primary"
              onDelete={handleClearFilters}
              deleteIcon={<ClearIcon />}
            />
          )}

          {/* Export CSV Button - conditionally shown */}
          {showExportButton && (
            <Button
              variant="contained"
              size="small"
              onClick={async () => {
                try {
                  const response = await axios.get('/export/csv', {
                    params: {
                      model: modelType  // Pass model type as query parameter
                    },
                    responseType: 'blob', // Important for file download
                  });

                  // Create and trigger file download
                  const filename = exportFileName ? `${exportFileName}.csv` : `${modelType}_export.csv`;
                  const fileURL = window.URL.createObjectURL(new Blob([response.data]));
                  const fileLink = document.createElement('a');
                  fileLink.href = fileURL;
                  fileLink.setAttribute('download', filename);
                  document.body.appendChild(fileLink);
                  fileLink.click();
                  fileLink.remove();
                  window.URL.revokeObjectURL(fileURL);
                } catch (error) {
                  console.error('Export failed:', error);
                  alert('Failed to export CSV. Please try again.');
                }
              }}
              sx={{
                backgroundColor: '#3b82f6',
                color: 'white',
                borderRadius: 1,
                fontSize: '0.75rem',
                '&:hover': {
                  backgroundColor: '#2563eb',
                },
              }}
            >
              Export CSV
            </Button>
          )}
        </Stack>

        {/* Bottom Row - Search (when active) */}
        {searchOpen && (
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              placeholder="Search across all columns..."
              value={searchValue || ''}
              onChange={(e) => handleSearchChange(e.target.value)}
              size="small"
              variant="outlined"
              fullWidth
              slotProps={{
                input: {
                  startAdornment: <SearchIcon sx={{ mr: 1, color: '#64748b' }} />,
                },
              }}
              sx={{
                '& .MuiOutlinedInput-root': {
                  backgroundColor: 'white',
                  fontSize: '0.875rem',
                },
              }}
            />
            <IconButton size="small" onClick={() => handleSearchChange('')}>
              <ClearIcon />
            </IconButton>
          </Stack>
        )}
      </Box>

      <DataGrid
        rows={rows}
        columns={muiColumns}
        getRowId={getRowId}
        disableRowSelectionOnClick
        disableColumnReorder={false} // Enable column drag & drop reordering
        disableColumnMenu={false} // Enable column menu with hide/show options
        columnHeaderHeight={56} // Ensure adequate height for drag handles
        rowHeight={52} // Standard row height for better interaction
        hideFooter={false} // Make sure footer is visible
        hideFooterPagination={false} // Ensure pagination is shown
        pagination
        pageSizeOptions={[10, 20, 50, 100]}
        initialState={{
          pagination: { paginationModel: { pageSize: 20, page: 0 } },
        }}
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={setColumnVisibilityModel}
        filterModel={filterModel}
        onFilterModelChange={setFilterModel}
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        columnOrderModel={columnOrderModel}
        onColumnOrderModelChange={handleColumnOrderChange}
        sx={{
          border: 0,
          backgroundColor: "white",
          borderRadius: 2,
          boxShadow: 2,
          minWidth: totalColumnsWidth > containerWidth * 0.95 ? Math.max(600, totalColumnsWidth) : '100%', // Dynamic based on mode

          // Header styling with color
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: '#f8fafc', // Light blue-gray background
            borderBottom: "2px solid #3b82f6", // Blue accent border
            color: '#1e293b', // Dark slate text
            fontWeight: 600,
            fontSize: '0.875rem',
          },

          "& .MuiDataGrid-columnHeader": {
            padding: '0 16px', // Consistent padding for headers
            cursor: 'grab', // Indicate draggable columns
            position: 'relative', // Allow for drag indicators
            '&:hover': {
              backgroundColor: '#f1f5f9', // Slightly darker on hover
            },
            '&:active': {
              cursor: 'grabbing', // Show grabbing cursor when dragging
            },
            '&:first-of-type': {
              paddingLeft: '20px', // Match first cell padding
              paddingRight: '20px',
            },
            // Ensure drag area is not blocked
            '& .MuiDataGrid-columnHeaderTitle': {
              pointerEvents: 'auto',
              flex: 1,
            },
            // Style for when column is being dragged
            '&.MuiDataGrid-columnHeader--moving': {
              backgroundColor: '#e0f2fe',
              opacity: 0.8,
            },
          },

          // Column drag placeholder
          "& .MuiDataGrid-columnHeader--moving": {
            backgroundColor: '#e0f2fe !important',
            boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
          },

          // Drag indicator styling
          "& .MuiDataGrid-columnHeaderDraggableContainer": {
            width: '100%',
          },

          // Column menu styling
          "& .MuiDataGrid-columnMenuIcon": {
            opacity: 0.6,
            '&:hover': {
              opacity: 1,
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
            },
          },

          // Column separator styling for reordering
          "& .MuiDataGrid-columnSeparator": {
            '&:hover': {
              color: '#3b82f6',
            },
            '&.MuiDataGrid-columnSeparator--resizing': {
              color: '#3b82f6',
            },
          },

          // Row styling with alternating colors
          "& .MuiDataGrid-row": {
            '&:nth-of-type(even)': {
              backgroundColor: '#f8fafc', // Light background for even rows
            },
            '&:nth-of-type(odd)': {
              backgroundColor: 'white', // White for odd rows
            },
            '&:hover': {
              backgroundColor: '#e0f2fe !important', // Light blue hover
              cursor: 'pointer',
            },
            borderBottom: "1px solid #e2e8f0", // Subtle border
          },

          // Cell styling with proper alignment
          "& .MuiDataGrid-cell": {
            borderBottom: "1px solid #e2e8f0", // Light gray border
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'flex-start',
            padding: '8px 16px', // More balanced padding
            color: '#334155', // Slate gray text
            overflow: 'visible', // Prevent content cropping

            '&:focus': {
              outline: '2px solid #3b82f6', // Blue focus outline
              outlineOffset: '-2px',
            },

            // First column specific styling to prevent cropping
            '&:first-of-type': {
              paddingLeft: '20px', // Extra padding for first column
              paddingRight: '20px', // Ensure right padding too
            },

            // Ensure text content doesn't get cropped
            '& .MuiDataGrid-cellContent': {
              overflow: 'visible',
              textOverflow: 'initial',
              whiteSpace: 'nowrap',
              width: '100%',
            },
          },

          // Pagination styling
          "& .MuiDataGrid-footerContainer": {
            backgroundColor: '#f8fafc',
            borderTop: "1px solid #e2e8f0",
            color: '#64748b',
          },

          // Toolbar styling
          "& .MuiDataGrid-toolbarContainer": {
            backgroundColor: '#f8fafc !important',
            borderBottom: "1px solid #e2e8f0",
            padding: '0 !important', // Remove default padding as our EnhancedToolbar has its own
            minHeight: '60px',
            display: 'block !important',
            visibility: 'visible !important',
          },

          // Selected row styling
          "& .MuiDataGrid-row.Mui-selected": {
            backgroundColor: '#dbeafe',
            '&:hover': {
              backgroundColor: '#bfdbfe',
            },
          },

          // Scrollbar styling
          "& .MuiDataGrid-virtualScroller": {
            '&::-webkit-scrollbar': {
              width: 8,
              height: 8,
            },
            '&::-webkit-scrollbar-track': {
              backgroundColor: '#f1f5f9',
              borderRadius: 4,
            },
            '&::-webkit-scrollbar-thumb': {
              backgroundColor: '#cbd5e1',
              borderRadius: 4,
              '&:hover': {
                backgroundColor: '#94a3b8',
              },
            },
          },
        }}
      />

      {/* Dialogs */}
      <ColumnVisibilityDialog
        open={columnDialogOpen}
        onClose={() => setColumnDialogOpen(false)}
        columns={columns}
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityChange={setColumnVisibilityModel}
      />

      <MultiSortDialog
        open={sortDialogOpen}
        onClose={() => setSortDialogOpen(false)}
        columns={columns}
        sortModel={sortModel}
        onSortChange={setSortModel}
      />

      <BarcodeDialog
        open={barcodeDialogOpen}
        onClose={() => setBarcodeDialogOpen(false)}
        modelType={modelType}
        recordId={selectedRowId}
      />
    </Box>
  );
}
