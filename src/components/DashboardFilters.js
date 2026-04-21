import React from 'react';
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
} from '@mui/material';

const DashboardFilters = ({
  reportType,
  setReportType,
  dateFrom,
  setDateFrom,
  dateTo,
  setDateTo,
  shiftFrom,
  setShiftFrom,
  shiftTo,
  setShiftTo,
  mcFilter,
  setMcFilter,
  opFilter,
  setOpFilter,
  showAdvancedFilters,
  setShowAdvancedFilters,
  filters,
  setFilters,
  onApplyFilters,
  onResetFilters,
  isLoading,
  activeFilterFields,
  updateFilter,
  removeFilter,
  addFilter,
}) => {
  return (
    <Paper sx={{ p: 2, borderRadius: 2, mb: 2 }}>
      <Stack spacing={2}>
        {/* Main Filters */}
        <Stack direction={{ xs: "column", lg: "row" }} spacing={2}>
          <FormControl size="small" fullWidth>
            <InputLabel>Report Type</InputLabel>
            <Select
              label="Report Type"
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <MenuItem value="mesin">Machine Report</MenuItem>
              <MenuItem value="operator">Operator Report</MenuItem>
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

        {/* Quick Filters */}
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <TextField
            size="small"
            label="Machine Filter"
            placeholder="Filter by machine..."
            value={mcFilter}
            onChange={(e) => setMcFilter(e.target.value)}
            fullWidth
          />

          <TextField
            size="small"
            label="Operator Filter"
            placeholder="Filter by operator..."
            value={opFilter}
            onChange={(e) => setOpFilter(e.target.value)}
            fullWidth
          />
        </Stack>

        {/* Action Buttons */}
        <Stack direction="row" spacing={1} justifyContent="space-between">
          <Button
            variant="outlined"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            disabled={isLoading}
          >
            {showAdvancedFilters ? "Hide" : "Show"} Advanced Filters
          </Button>

          <Stack direction="row" spacing={1}>
            <Button
              variant="outlined"
              onClick={onResetFilters}
              disabled={isLoading}
            >
              Reset
            </Button>
            <Button
              variant="contained"
              onClick={onApplyFilters}
              disabled={isLoading}
              size="large"
              sx={{
                px: 4,
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}
            >
              📊 Show Dashboard
            </Button>
          </Stack>
        </Stack>

        {/* Advanced Filters */}
        <Collapse in={showAdvancedFilters}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Stack spacing={2}>
              <Typography variant="h6">Advanced Filters</Typography>

              {filters.map((filter) => (
                <Stack
                  key={filter.id}
                  direction={{ xs: "column", md: "row" }}
                  spacing={1}
                  alignItems={{ md: "center" }}
                >
                  <FormControl size="small" sx={{ minWidth: 200 }}>
                    <InputLabel>Field</InputLabel>
                    <Select
                      label="Field"
                      value={filter.field}
                      onChange={(e) => {
                        const nextField = activeFilterFields.find((f) => f.field === e.target.value);
                        updateFilter(filter.id, {
                          field: nextField.field,
                          type: nextField.type,
                          operator: "contains",
                          value: "",
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

                  <TextField
                    size="small"
                    label="Value"
                    value={filter.value}
                    onChange={(e) => updateFilter(filter.id, { value: e.target.value })}
                    sx={{ minWidth: 200 }}
                  />

                  <Button
                    color="error"
                    onClick={() => removeFilter(filter.id)}
                  >
                    Remove
                  </Button>
                </Stack>
              ))}

              <Stack direction="row" spacing={1} justifyContent="flex-start">
                <Button variant="outlined" onClick={addFilter}>
                  Add Filter
                </Button>
              </Stack>
            </Stack>
          </Paper>
        </Collapse>
      </Stack>
    </Paper>
  );
};

export default DashboardFilters;