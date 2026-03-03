import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
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
import './DataTable.css';

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
function logColumnStatistics() {
  // Column statistics logging removed to prevent console spam
  // This function is kept for the showColumnStats prop but outputs nothing
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

  // Debug logging removed to prevent console spam during form input

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

  const handleSelectAll = () => {
    const newModel = {};
    columns.forEach((col) => {
      const field = col.accessor || col.id;
      newModel[field] = true;
    });
    onColumnVisibilityChange(newModel);
  };

  const handleUnselectAll = () => {
    const newModel = {};
    columns.forEach((col) => {
      const field = col.accessor || col.id;
      newModel[field] = false;
    });
    onColumnVisibilityChange(newModel);
  };

  // Count visible columns
  const visibleCount = columns.filter((col) => {
    const field = col.accessor || col.id;
    return columnVisibilityModel[field] ?? true;
  }).length;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Show/Hide Columns</Typography>
          <Chip
            label={`${visibleCount} of ${columns.length} visible`}
            size="small"
            color="primary"
            variant="outlined"
          />
        </Stack>
      </DialogTitle>
      <DialogContent>
        {/* Bulk Action Buttons */}
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button
            variant="outlined"
            size="small"
            onClick={handleSelectAll}
            disabled={visibleCount === columns.length}
          >
            Select All
          </Button>
          <Button
            variant="outlined"
            size="small"
            onClick={handleUnselectAll}
            disabled={visibleCount === 0}
          >
            Unselect All
          </Button>
        </Stack>

        {/* Column Checkboxes */}
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
function BarcodeDialog({ open, onClose, modelType, recordId, getBarcodeUrl }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [currentImage, setCurrentImage] = useState(null);

  // Determine model type for display (can still be useful for dialog title)
  const getModelFromId = (id) => {
    if (id.startsWith('TL-')) return 'tooling';
    if (id.startsWith('MC-')) return 'mesin';
    if (id.startsWith('OP-')) return 'operator';
    return modelType; // fallback to prop
  };

  const actualModelType = recordId ? getModelFromId(recordId) : modelType;

  useEffect(() => {
    if (open && recordId && getBarcodeUrl) {
      // Generate URL only once when dialog opens
      const barcodeUrl = getBarcodeUrl(recordId);

      setLoading(true);
      setError(null);
      setCurrentImage(null);

      // Load image - one request only
      const img = new Image();

      const handleLoad = () => {
        setLoading(false);
        setError(null);
        setCurrentImage(barcodeUrl);
      };

      const handleError = () => {
        setLoading(false);
        setCurrentImage(null);
        setError(`Failed to load barcode for ${recordId}`);
      };

      img.addEventListener('load', handleLoad);
      img.addEventListener('error', handleError);

      // Load immediately
      img.src = barcodeUrl;

      // Cleanup
      return () => {
        img.removeEventListener('load', handleLoad);
        img.removeEventListener('error', handleError);
      };
    } else if (!open) {
      setLoading(false);
      setError(null);
      setCurrentImage(null);
    }
  }, [open, recordId, getBarcodeUrl]); // Only depend on these, not barcodeUrl

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
        {currentImage && !loading && !error && (
          <img
            src={currentImage}
            alt={`Barcode for ${recordId}`}
            style={{
              maxWidth: '100%',
              height: 'auto',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              padding: '16px',
              backgroundColor: 'white'
            }}
          />
        )}
        {!loading && !error && !currentImage && (
          <Typography color="text.secondary">No record selected</Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {currentImage && !error && (
          <Button
            variant="contained"
            onClick={() => {
              // Download the barcode image by opening in new tab
              window.open(currentImage, '_blank');
            }}
          >
            Download
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}


function DataTable({
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
  exportCsv, // Function to handle CSV export - passed from useApi hook
  getBarcodeUrl, // Function to generate barcode URL - passed from useApi hook
}) {
  const containerRef = useRef(null);
  const [containerWidth, setContainerWidth] = useState(1200); // Default assumption
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({});

  // Add state for toolbar features
  const [searchValue, setSearchValue] = useState('');
  const [sortModel, setSortModel] = useState([]);
  const [filterModel, setFilterModel] = useState({ items: [] });

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
      logColumnStatistics();
    }
  }, [data, columns, showColumnStats]);

  // Handler for showing barcode
  const handleShowBarcode = useCallback((recordId) => {
    setSelectedRowId(recordId);
    setBarcodeDialogOpen(true);
  }, []);

  const muiColumns = useMemo(() => toMuiColumns(columns, data, widthPercentile, containerWidth, modelType, handleShowBarcode, handleEdit, confirmDelete), [columns, data, widthPercentile, containerWidth, modelType, handleShowBarcode]);

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
        overflow: 'hidden', // Prevent container-level scrolling, let DataGrid handle it
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
          {showExportButton && exportCsv ? (
            <Button
              variant="contained"
              size="small"
              onClick={async () => {
                try {
                  const result = await exportCsv(exportFileName);
                  if (!result.success) {
                    console.error('Export failed:', result.message);
                    alert('Failed to export CSV. Please try again.');
                  }
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
          ) : showExportButton ? (
            <Button
              variant="outlined"
              size="small"
              disabled
              sx={{ fontSize: '0.75rem' }}
            >
              Export Not Available
            </Button>
          ) : null}
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
        disableColumnReorder={true} // Disable column drag & drop reordering
        disableColumnMenu={false} // Enable column menu with hide/show options
        columnHeaderHeight={56}
        getRowHeight={() => 'auto'} // Dynamic row height to accommodate wrapped text
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
        className="imn-data-grid"
        sx={{
          width: '100%', // Force full width to prevent horizontal container scrolling
          overflow: 'auto', // Let DataGrid handle its own scrolling
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
        getBarcodeUrl={getBarcodeUrl}
      />
    </Box>
  );
}

// Memoize the DataTable component to prevent unnecessary re-renders
// when parent components re-render (e.g., during form input)
export default memo(DataTable);
