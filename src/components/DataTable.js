import { useState, useEffect, useRef, useMemo, useCallback, memo } from "react";
import { DataGrid } from "@mui/x-data-grid";
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
import FilterAltIcon from "@mui/icons-material/FilterAlt";
import AddIcon from "@mui/icons-material/Add";
import {
  applyAdvancedFilters,
  getColumnField,
  getColumnHeader,
  getFilterType,
  getOperatorsForColumn,
} from "../utils/filterUtils";
import "./DataTable.css";

/** Small debounce helper */
function useDebouncedValue(value, delay = 200) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(t);
  }, [value, delay]);
  return debounced;
}

/** Convert react-table style columns -> MUI columns (simple sizing) */
function toMuiColumns(columns, modelType = "mesin", onShowBarcode, handleEdit, confirmDelete) {
  const dataColumns = (columns || []).map((c) => {
    const field = c.accessor || c.id;
    const header = c.Header || field;

    const isActionLike =
      field?.toLowerCase().includes("action") ||
      header?.toLowerCase().includes("action") ||
      c.id?.toLowerCase().includes("action");

    // Basic sizing: let most columns flex; small minWidth based on header length
    const minWidth = Math.max(90, Math.min(220, header.length * 9 + 32));

    return {
      field,
      headerName: header,
      flex: isActionLike ? 0 : 1,
      minWidth: isActionLike ? 120 : minWidth,
      sortable: true,
      filterable: true,
      resizable: true,
      renderCell: c.Cell
        ? (params) => c.Cell({ value: params.value, row: { original: params.row } })
        : undefined,
    };
  });

  // Only add/enhance Actions for model tables with proper handlers
  const normalizedModelType = String(modelType).toLowerCase().replace(/s$/, "");
  const isModelTable = ["tooling", "operator", "mesin"].includes(normalizedModelType);
  const hasActionHandlers = typeof handleEdit === "function" && typeof confirmDelete === "function";

  const hasExistingActions = dataColumns.some(
    (col) =>
      col.field?.toLowerCase().includes("action") ||
      col.headerName?.toLowerCase().includes("action") ||
      col.id?.toLowerCase().includes("action")
  );

  const actionsCol = {
    field: "actions",
    headerName: "Actions",
    width: 170,
    sortable: false,
    filterable: false,
    disableColumnMenu: true,
    renderCell: (params) => (
      <Stack direction="row" spacing={1}>
        <IconButton
          size="small"
          onClick={() => handleEdit(params.row)}
          sx={{
            color: "#059669",
            "&:hover": { backgroundColor: "rgba(5, 150, 105, 0.1)" },
          }}
          title="Modify"
        >
          <EditIcon fontSize="small" />
        </IconButton>

        <IconButton
          size="small"
          onClick={() => confirmDelete(params.row.id)}
          sx={{
            color: "#dc2626",
            "&:hover": { backgroundColor: "rgba(220, 38, 38, 0.1)" },
          }}
          title="Delete"
        >
          <DeleteIcon fontSize="small" />
        </IconButton>

        <IconButton
          size="small"
          onClick={() => onShowBarcode(params.row.id)}
          sx={{
            color: "#3b82f6",
            "&:hover": { backgroundColor: "rgba(59, 130, 246, 0.1)" },
          }}
          title="Show Barcode"
        >
          <QrCodeIcon fontSize="small" />
        </IconButton>
      </Stack>
    ),
  };

  if (!isModelTable || !hasActionHandlers) return dataColumns;

  if (hasExistingActions) {
    return dataColumns.map((col) => {
      const isExisting =
        col.field?.toLowerCase().includes("action") ||
        col.headerName?.toLowerCase().includes("action") ||
        col.id?.toLowerCase().includes("action");
      return isExisting ? actionsCol : col;
    });
  }

  return [...dataColumns, actionsCol];
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

  const visibleCount = columns.filter((col) => {
    const field = col.accessor || col.id;
    return columnVisibilityModel[field] ?? true;
  }).length;

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between">
          <Typography variant="h6">Show/Hide Columns</Typography>
          <Chip label={`${visibleCount} of ${columns.length} visible`} size="small" color="primary" variant="outlined" />
        </Stack>
      </DialogTitle>

      <DialogContent>
        <Stack direction="row" spacing={1} sx={{ mb: 2 }}>
          <Button variant="outlined" size="small" onClick={handleSelectAll} disabled={visibleCount === columns.length}>
            Select All
          </Button>
          <Button variant="outlined" size="small" onClick={handleUnselectAll} disabled={visibleCount === 0}>
            Unselect All
          </Button>
        </Stack>

        <Stack spacing={1}>
          {columns.map((col) => {
            const field = col.accessor || col.id;
            const header = col.Header || field;
            const isVisible = columnVisibilityModel[field] ?? true;

            return (
              <FormControlLabel
                key={field}
                control={<Checkbox checked={isVisible} onChange={() => handleToggle(field)} size="small" />}
                label={header}
                sx={{ fontSize: "0.875rem" }}
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

// Multi-Sort Dialog (kept)
function MultiSortDialog({ open, onClose, columns, sortModel, onSortChange }) {
  const [localSortModel, setLocalSortModel] = useState([]);

  useEffect(() => {
    setLocalSortModel(sortModel || []);
  }, [sortModel, open]);

  const addSort = () => {
    const firstField = columns[0]?.accessor || columns[0]?.id || "id";
    setLocalSortModel([...localSortModel, { field: firstField, sort: "asc" }]);
  };

  const removeSort = (index) => {
    setLocalSortModel(localSortModel.filter((_, i) => i !== index));
  };

  const updateSort = (index, field, sort) => {
    const next = [...localSortModel];
    next[index] = { field, sort };
    setLocalSortModel(next);
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
          {localSortModel.map((s, index) => (
            <Stack key={index} direction="row" spacing={1} alignItems="center">
              <Typography variant="body2" sx={{ minWidth: 60 }}>
                {index + 1}.
              </Typography>

              <TextField
                select
                label="Column"
                value={s.field}
                onChange={(e) => updateSort(index, e.target.value, s.sort)}
                size="small"
                sx={{ minWidth: 220 }}
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
                value={s.sort}
                onChange={(e) => updateSort(index, s.field, e.target.value)}
                size="small"
                sx={{ minWidth: 140 }}
              >
                <MenuItem value="asc">Ascending</MenuItem>
                <MenuItem value="desc">Descending</MenuItem>
              </TextField>

              <IconButton onClick={() => removeSort(index)} size="small" title="Remove">
                <ClearIcon />
              </IconButton>
            </Stack>
          ))}

          <Button onClick={addSort} variant="outlined" size="small" sx={{ alignSelf: "flex-start" }}>
            Add Sort Level
          </Button>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleApply} variant="contained">
          Apply
        </Button>
      </DialogActions>
    </Dialog>
  );
}

// Barcode Dialog (simplified)
function BarcodeDialog({ open, onClose, modelType, recordId, getBarcodeUrl }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const actualModelType = useMemo(() => {
    if (!recordId) return modelType;
    if (recordId.startsWith("TL-")) return "tooling";
    if (recordId.startsWith("MC-")) return "mesin";
    if (recordId.startsWith("OP-")) return "operator";
    return modelType;
  }, [recordId, modelType]);

  const barcodeUrl = useMemo(() => {
    if (!open || !recordId || !getBarcodeUrl) return null;
    return getBarcodeUrl(recordId);
  }, [open, recordId, getBarcodeUrl]);

  useEffect(() => {
    if (!open) {
      setLoading(false);
      setError(null);
      return;
    }
    if (open && recordId && barcodeUrl) {
      setLoading(true);
      setError(null);
    }
  }, [open, recordId, barcodeUrl]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        Barcode for {String(actualModelType).toUpperCase()}: {recordId || ""}
      </DialogTitle>

      <DialogContent sx={{ textAlign: "center", py: 3 }}>
        {!recordId && <Typography color="text.secondary">No record selected</Typography>}

        {recordId && !barcodeUrl && <Typography color="error">Barcode URL unavailable</Typography>}

        {recordId && barcodeUrl && (
          <>
            {loading && <Typography color="text.secondary">Loading barcode...</Typography>}
            {error && <Typography color="error">{error}</Typography>}

            <img
              src={barcodeUrl}
              alt={`Barcode for ${recordId}`}
              onLoad={() => setLoading(false)}
              onError={() => {
                setLoading(false);
                setError(`Failed to load barcode for ${recordId}`);
              }}
              style={{
                display: loading ? "none" : "inline-block",
                maxWidth: "100%",
                height: "auto",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
                padding: "16px",
                backgroundColor: "white",
              }}
            />
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Close</Button>
        {barcodeUrl && !error && (
          <Button variant="contained" onClick={() => window.open(barcodeUrl, "_blank")}>
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
  modelType = "mesin",
  showExportButton = true,
  getRowId,
  height = 620,
  handleEdit,
  confirmDelete,
  exportCsv,
  getBarcodeUrl,
}) {
  const [columnVisibilityModel, setColumnVisibilityModel] = useState({});

  // Toolbar state
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchValue, setSearchValue] = useState("");
  const debouncedSearch = useDebouncedValue(searchValue, 200);

  const [filters, setFilters] = useState([]);
  const [filterOpen, setFilterOpen] = useState(false);

  const [sortModel, setSortModel] = useState([]);
  const [columnDialogOpen, setColumnDialogOpen] = useState(false);
  const [sortDialogOpen, setSortDialogOpen] = useState(false);

  const [barcodeDialogOpen, setBarcodeDialogOpen] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState(null);

  // Pagination state for MUI DataGrid v8 compatibility
  const [paginationModel, setPaginationModel] = useState({
    pageSize: 20,
    page: 0
  });

  const handleShowBarcode = useCallback((recordId) => {
    setSelectedRowId(recordId);
    setBarcodeDialogOpen(true);
  }, []);

  // Build MUI columns (simple) — include handler deps
  const muiColumns = useMemo(
    () => toMuiColumns(columns, modelType, handleShowBarcode, handleEdit, confirmDelete),
    [columns, modelType, handleShowBarcode, handleEdit, confirmDelete]
  );

  // Ensure row ids
  const rows = useMemo(() => {
    const arr = data || [];
    if (getRowId) return arr;
    return arr.map((r, idx) => {
      if (r && r.id !== undefined && r.id !== null) return r;
      return { id: idx, ...r };
    });
  }, [data, getRowId]);

  // Reset to page 0 when the dataset meaningfully changes (e.g. search or new data or filter)
  useEffect(() => {
    setPaginationModel((prev) => ({ ...prev, page: 0 }));
  }, [debouncedSearch, rows.length, filters]);

  // Visible fields for global search
  const visibleFields = useMemo(() => {
    return (columns || [])
      .map((c) => c.accessor || c.id)
      .filter((f) => f && columnVisibilityModel[f] !== false);
  }, [columns, columnVisibilityModel]);

  // Column filters
  const filterableColumns = useMemo(() => {
    return (columns || []).filter((c) => !!c.filter);
  }, [columns]);

  const addFilter = () => {
    const firstColumn = filterableColumns[0];
    if (!firstColumn) return;

    const field = getColumnField(firstColumn);
    const operators = getOperatorsForColumn(firstColumn);

    setFilters((prev) => [
      ...prev,
      {
        id: crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}_${prev.length}`,
        field,
        operator: operators[0] || "contains",
        value: "",
        valueTo: "",
      },
    ]);
  };

  const removeFilter = (id) => {
    setFilters((prev) => prev.filter((f) => f.id !== id));
  };

  const updateFilter = (id, patch) => {
    setFilters((prev) =>
      prev.map((f) => (f.id === id ? { ...f, ...patch } : f))
    );
  };

  const clearFilters = () => setFilters([]);

  // Client-side global filter (Community-safe, 500 rows is fine)
  // Search on top of filter
  const searchFilteredRows = useMemo(() => {
    const q = String(debouncedSearch || "").trim().toLowerCase();
    if (!q) return rows;

    return rows.filter((row) => {
      for (const field of visibleFields) {
        const v = row?.[field];
        if (v === null || v === undefined) continue;
        if (String(v).toLowerCase().includes(q)) return true;
      }
      return false;
    });
  }, [rows, debouncedSearch, visibleFields]);

  const filteredRows = useMemo(() => {
    return applyAdvancedFilters(searchFilteredRows, filters, columns || []);
  }, [searchFilteredRows, filters, columns]);

  const activeSearch = Boolean(String(searchValue || "").trim());

  return (
    <Box
      sx={{
        width: "100%",
        height,
        display: "flex",
        overflow: "hidden",
        flexDirection: "column",
        minHeight: 0,
      }}
    >
      {/* External Toolbar */}
      <Box
        sx={{
          p: 2,
          backgroundColor: "#f8fafc",
          borderBottom: "1px solid #e2e8f0",
          borderRadius: "8px 8px 0 0",
          display: "flex",
          flexDirection: "column",
          alignItems: "stretch",
          gap: 2,
        }}
      >
        <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
          <Button
            variant="outlined"
            size="small"
            startIcon={<ViewColumnIcon />}
            onClick={() => setColumnDialogOpen(true)}
            sx={{ fontSize: "0.75rem" }}
          >
            Columns ({visibleFields.length})
          </Button>

          <Button
            variant="outlined"
            size="small"
            startIcon={<SortIcon />}
            onClick={() => setSortDialogOpen(true)}
            sx={{ fontSize: "0.75rem" }}
            color={sortModel?.length > 0 ? "primary" : "inherit"}
          >
            Sort {sortModel?.length > 0 && `(${sortModel.length})`}
          </Button>

          <Button
            variant={searchOpen ? "contained" : "outlined"}
            size="small"
            startIcon={<SearchIcon />}
            onClick={() => setSearchOpen((s) => !s)}
            sx={{ fontSize: "0.75rem" }}
          >
            Search
          </Button>

          <Button
            variant={filterOpen ? "contained" : "outlined"}
            size="small"
            startIcon={<FilterAltIcon />}
            onClick={() => setFilterOpen((s) => !s)}
            sx={{ fontSize: "0.75rem" }}
          >
            Filters {filters.length > 0 && `(${filters.length})`}
          </Button>

          {activeSearch && (
            <Chip
              label="Search active"
              size="small"
              color="primary"
              onDelete={() => setSearchValue("")}
              deleteIcon={<ClearIcon />}
            />
          )}

          {showExportButton && exportCsv ? (
            <Button
              variant="contained"
              size="small"
              onClick={async () => {
                try {
                  const result = await exportCsv(exportFileName);
                  if (!result?.success) {
                    console.error("Export failed:", result?.message);
                    alert("Failed to export CSV. Please try again.");
                  }
                } catch (error) {
                  console.error("Export failed:", error);
                  alert("Failed to export CSV. Please try again.");
                }
              }}
              sx={{
                backgroundColor: "#3b82f6",
                color: "white",
                borderRadius: 1,
                fontSize: "0.75rem",
                "&:hover": { backgroundColor: "#2563eb" },
              }}
            >
              Export CSV
            </Button>
          ) : showExportButton ? (
            <Button variant="outlined" size="small" disabled sx={{ fontSize: "0.75rem" }}>
              Export Not Available
            </Button>
          ) : null}
        </Stack>

        {searchOpen && (
          <Stack direction="row" spacing={1} alignItems="center">
            <TextField
              placeholder="Search across visible columns..."
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              size="small"
              variant="outlined"
              fullWidth
              slotProps={{
                input: {
                  startAdornment: <SearchIcon sx={{ mr: 1, color: "#64748b" }} />,
                },
              }}
              sx={{
                "& .MuiOutlinedInput-root": {
                  backgroundColor: "white",
                  fontSize: "0.875rem",
                },
              }}
            />
            <IconButton size="small" onClick={() => setSearchValue("")} title="Clear">
              <ClearIcon />
            </IconButton>
          </Stack>
        )}

        {filterOpen && (
          <Box
            sx={{
              p: 2,
              border: "1px solid #e2e8f0",
              borderRadius: 2,
              backgroundColor: "white",
            }}
          >
            <Stack spacing={2}>
              {filters.map((filter) => {
                const selectedColumn = filterableColumns.find(
                  (c) => getColumnField(c) === filter.field
                );
                const operators = getOperatorsForColumn(selectedColumn);
                const type = getFilterType(selectedColumn);

                return (
                  <Stack
                    key={filter.id}
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    flexWrap="wrap"
                  >
                    <TextField
                      select
                      label="Column"
                      size="small"
                      value={filter.field}
                      sx={{ minWidth: 180 }}
                      onChange={(e) => {
                        const nextColumn = filterableColumns.find(
                          (c) => getColumnField(c) === e.target.value
                        );
                        const nextOperators = getOperatorsForColumn(nextColumn);

                        updateFilter(filter.id, {
                          field: e.target.value,
                          operator: nextOperators[0] || "contains",
                          value: "",
                          valueTo: "",
                        });
                      }}
                    >
                      {filterableColumns.map((col) => (
                        <MenuItem
                          key={getColumnField(col)}
                          value={getColumnField(col)}
                        >
                          {getColumnHeader(col)}
                        </MenuItem>
                      ))}
                    </TextField>

                    <TextField
                      select
                      label="Operator"
                      size="small"
                      value={filter.operator}
                      sx={{ minWidth: 150 }}
                      onChange={(e) =>
                        updateFilter(filter.id, {
                          operator: e.target.value,
                          value: "",
                          valueTo: "",
                        })
                      }
                    >
                      {operators.map((op) => (
                        <MenuItem key={op} value={op}>
                          {op}
                        </MenuItem>
                      ))}
                    </TextField>

                    {filter.operator !== "isEmpty" && filter.operator !== "isNotEmpty" && (
                      <TextField
                        label="Value"
                        size="small"
                        type={type === "number" ? "number" : type === "date" ? "datetime-local" : "text"}
                        value={filter.value}
                        onChange={(e) =>
                          updateFilter(filter.id, { value: e.target.value })
                        }
                      />
                    )}

                    {filter.operator === "between" && (
                      <TextField
                        label="To"
                        size="small"
                        type={type === "number" ? "number" : type === "date" ? "datetime-local" : "text"}
                        value={filter.valueTo}
                        onChange={(e) =>
                          updateFilter(filter.id, { valueTo: e.target.value })
                        }
                      />
                    )}

                    <IconButton
                      onClick={() => removeFilter(filter.id)}
                      size="small"
                      title="Remove"
                    >
                      <ClearIcon />
                    </IconButton>
                  </Stack>
                );
              })}

              <Stack direction="row" spacing={1}>
                <Button
                  variant="outlined"
                  startIcon={<AddIcon />}
                  onClick={addFilter}
                  size="small"
                  disabled={filterableColumns.length === 0}
                >
                  Add Filter
                </Button>

                <Button
                  variant="text"
                  onClick={clearFilters}
                  size="small"
                  disabled={filters.length === 0}
                >
                  Clear Filters
                </Button>
              </Stack>
            </Stack>
          </Box>
        )}
      </Box>

      <DataGrid
        rows={filteredRows}
        columns={muiColumns}
        getRowId={getRowId}
        disableRowSelectionOnClick
        disableColumnReorder
        disableColumnMenu={false}
        columnHeaderHeight={56}
        getRowHeight={() => "auto"}
        pagination
        pageSizeOptions={[10, 20, 50, 100]}
        paginationModel={paginationModel}
        onPaginationModelChange={setPaginationModel}
        columnVisibilityModel={columnVisibilityModel}
        onColumnVisibilityModelChange={setColumnVisibilityModel}
        sortModel={sortModel}
        onSortModelChange={setSortModel}
        className="imn-data-grid"
        sx={{
          width: "100%",
          height: "100%",
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

export default memo(DataTable);
