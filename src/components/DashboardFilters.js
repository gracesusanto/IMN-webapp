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
  Autocomplete,
  Chip,
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
  sortBy,
  setSortBy,
  sortDirection,
  setSortDirection,
  availableMachines = [],
  selectedMachines = [],
  setSelectedMachines,
  availableOperators = [],
  selectedOperators = [],
  setSelectedOperators,
}) => {
  const getFieldConfig = (fieldName) =>
    activeFilterFields.find((f) => f.field === fieldName);

  const getDisplayType = (fieldConfig) => {
    if (!fieldConfig) return 'string';
    if (fieldConfig.inputKind === 'time_minutes') return 'minutes';
    if (fieldConfig.inputKind === 'percent') return 'percent';
    return fieldConfig.type;
  };

  const getAvailableOperators = (fieldConfig) => {
    if (!fieldConfig) {
      return [{ value: 'contains', label: 'contains' }];
    }

    const isTime = fieldConfig.inputKind === 'time_minutes';
    const isPercentage = fieldConfig.inputKind === 'percent';
    const isNumeric =
      fieldConfig.type === 'number' || fieldConfig.type === 'integer';
    const isString = fieldConfig.type === 'string';
    const isDate = fieldConfig.type === 'date';

    if (isTime || isPercentage || isNumeric) {
      return [
        { value: 'eq', label: '=' },
        { value: 'ne', label: '!=' },
        { value: 'gt', label: '>' },
        { value: 'gte', label: '>=' },
        { value: 'lt', label: '<' },
        { value: 'lte', label: '<=' },
        { value: 'in', label: 'in' },
      ];
    }

    if (isDate) {
      return [
        { value: 'eq', label: '=' },
        { value: 'before', label: '<' },
        { value: 'on_or_before', label: '<=' },
        { value: 'after', label: '>' },
        { value: 'on_or_after', label: '>=' },
        { value: 'in', label: 'in' },
      ];
    }

    if (isString) {
      return [
        { value: 'contains', label: 'contains' },
        { value: 'not_contains', label: 'not contains' },
        { value: 'eq', label: '=' },
        { value: 'ne', label: '!=' },
        { value: 'starts_with', label: 'starts with' },
        { value: 'ends_with', label: 'ends with' },
        { value: 'in', label: 'in' },
      ];
    }

    return [{ value: 'contains', label: 'contains' }];
  };

  const getDefaultOperator = (fieldConfig) => {
    if (!fieldConfig) return 'contains';
    if (
      fieldConfig.type === 'number' ||
      fieldConfig.type === 'integer' ||
      fieldConfig.type === 'date' ||
      fieldConfig.inputKind === 'time_minutes' ||
      fieldConfig.inputKind === 'percent'
    ) {
      return 'eq';
    }
    return 'contains';
  };

  const getValuePlaceholder = (fieldConfig, isListOperator) => {
    if (!fieldConfig) return 'Value';

    const isTime = fieldConfig.inputKind === 'time_minutes';
    const isPercentage = fieldConfig.inputKind === 'percent';
    const isNumeric =
      fieldConfig.type === 'number' || fieldConfig.type === 'integer';
    const isDate = fieldConfig.type === 'date';

    if (isListOperator) {
      if (isTime) return 'e.g. 01:30,90,02:15';
      if (isPercentage) return 'e.g. 80,95,100';
      if (isNumeric) return 'e.g. 100,200,300';
      if (isDate) return 'e.g. 2026-04-20,2026-04-21';
      return 'e.g. A,B,C';
    }

    if (isTime) return 'e.g. 01:30 or 90';
    if (isPercentage) return 'e.g. 82.5';
    if (isNumeric) return 'e.g. 100';
    if (isDate) return 'yyyy-mm-dd';
    return 'e.g. search text';
  };

  const getValueHelperText = (fieldConfig, isListOperator) => {
    if (!fieldConfig) return '';

    const isTime = fieldConfig.inputKind === 'time_minutes';
    const isPercentage = fieldConfig.inputKind === 'percent';
    const isNumeric =
      fieldConfig.type === 'number' || fieldConfig.type === 'integer';
    const isDate = fieldConfig.type === 'date';

    if (isListOperator) {
      if (isTime) return 'Comma-separated values. Use HH:MM or minutes.';
      if (isPercentage) return 'Comma-separated numbers. Do not include %.';
      if (isNumeric) return 'Comma-separated numbers.';
      if (isDate) return 'Comma-separated dates in yyyy-mm-dd.';
      return 'Comma-separated values.';
    }

    if (isTime) return 'Use HH:MM or minutes. Compared as total minutes.';
    if (isPercentage) return 'Enter a number only, without %.';
    if (isDate) return 'Enter date in yyyy-mm-dd.';
    return `Field type: ${getDisplayType(fieldConfig)}`;
  };

  return (
    <Paper sx={{ p: 2, borderRadius: 2, mb: 2 }}>
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', lg: 'row' }} spacing={2}>
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
            onChange={(e) => setShiftFrom(parseInt(e.target.value || '1', 10))}
            fullWidth
          />

          <TextField
            size="small"
            type="number"
            label="Shift To"
            inputProps={{ min: 1, max: 3 }}
            value={shiftTo}
            onChange={(e) => setShiftTo(parseInt(e.target.value || '1', 10))}
            fullWidth
          />
        </Stack>

        <Stack spacing={2}>
          {availableMachines.length > 0 && (
            <Box>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{ fontWeight: 600, color: 'primary.main' }}
              >
                🔧 Machine Filter
              </Typography>
              <Autocomplete
                multiple
                size="small"
                options={availableMachines}
                value={selectedMachines}
                onChange={(event, newValue) => {
                  setSelectedMachines(newValue);
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      size="small"
                      {...getTagProps({ index })}
                      key={option}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select machines"
                    placeholder={
                      selectedMachines.length === 0 ? 'Choose machines...' : ''
                    }
                    helperText={`${selectedMachines.length} of ${availableMachines.length} selected. Leave empty for all machines.`}
                  />
                )}
              />
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setSelectedMachines([])}
                  disabled={selectedMachines.length === 0}
                >
                  Clear
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setSelectedMachines([...availableMachines])}
                  disabled={selectedMachines.length === availableMachines.length}
                >
                  Select All
                </Button>
              </Box>
            </Box>
          )}

          {availableOperators.length > 0 && reportType === 'operator' && (
            <Box>
              <Typography
                variant="subtitle2"
                gutterBottom
                sx={{ fontWeight: 600, color: 'primary.main' }}
              >
                👤 Operator Filter
              </Typography>
              <Autocomplete
                multiple
                size="small"
                options={availableOperators}
                value={selectedOperators}
                onChange={(event, newValue) => {
                  setSelectedOperators(newValue);
                }}
                renderTags={(value, getTagProps) =>
                  value.map((option, index) => (
                    <Chip
                      variant="outlined"
                      label={option}
                      size="small"
                      {...getTagProps({ index })}
                      key={option}
                    />
                  ))
                }
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Select operators"
                    placeholder={
                      selectedOperators.length === 0 ? 'Choose operators...' : ''
                    }
                    helperText={`${selectedOperators.length} of ${availableOperators.length} selected. Leave empty for all operators.`}
                  />
                )}
              />
              <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setSelectedOperators([])}
                  disabled={selectedOperators.length === 0}
                >
                  Clear
                </Button>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => setSelectedOperators([...availableOperators])}
                  disabled={selectedOperators.length === availableOperators.length}
                >
                  Select All
                </Button>
              </Box>
            </Box>
          )}
        </Stack>

        <Stack direction="row" spacing={1} justifyContent="space-between">
          <Button
            variant="outlined"
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            disabled={isLoading}
          >
            {showAdvancedFilters ? 'Hide' : 'Show'} Advanced Filters
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
              sx={{ px: 4, fontSize: '1.1rem', fontWeight: 'bold' }}
            >
              📊 Show Dashboard
            </Button>
          </Stack>
        </Stack>

        <Collapse in={showAdvancedFilters}>
          <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <Stack spacing={2}>
              <Typography variant="h6">Advanced Filters</Typography>

              {filters.map((filter) => {
                const fieldConfig = getFieldConfig(filter.field);
                const isListOperator = filter.operator === 'in';
                const availableOps = getAvailableOperators(fieldConfig);

                return (
                  <Stack
                    key={filter.id}
                    direction={{ xs: 'column', md: 'row' }}
                    spacing={1}
                    alignItems={{ md: 'center' }}
                  >
                    <FormControl size="small" sx={{ minWidth: 220 }}>
                      <InputLabel>Field</InputLabel>
                      <Select
                        label="Field"
                        value={filter.field}
                        onChange={(e) => {
                          const nextField = getFieldConfig(e.target.value);
                          updateFilter(filter.id, {
                            field: nextField.field,
                            type: nextField.type,
                            operator: getDefaultOperator(nextField),
                            value: '',
                          });
                        }}
                      >
                        {activeFilterFields.map((f) => (
                          <MenuItem key={f.field} value={f.field}>
                            {f.label || f.field}
                            <Typography variant="caption" sx={{ ml: 1, opacity: 0.7 }}>
                              ({getDisplayType(f)})
                            </Typography>
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <FormControl size="small" sx={{ minWidth: 180 }}>
                      <InputLabel>Comparison</InputLabel>
                      <Select
                        label="Comparison"
                        value={filter.operator}
                        onChange={(e) =>
                          updateFilter(filter.id, {
                            operator: e.target.value,
                            value: '',
                          })
                        }
                      >
                        {availableOps.map((op) => (
                          <MenuItem key={op.value} value={op.value}>
                            {op.label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>

                    <TextField
                      size="small"
                      label={isListOperator ? 'Values' : 'Value'}
                      value={filter.value}
                      onChange={(e) =>
                        updateFilter(filter.id, { value: e.target.value })
                      }
                      sx={{ minWidth: 220, flexGrow: 1 }}
                      type="text"
                      placeholder={getValuePlaceholder(fieldConfig, isListOperator)}
                      helperText={getValueHelperText(fieldConfig, isListOperator)}
                    />

                    <Button
                      color="error"
                      onClick={() => removeFilter(filter.id)}
                      variant="outlined"
                      size="small"
                    >
                      Remove
                    </Button>
                  </Stack>
                );
              })}

              <Stack direction="row" spacing={1} justifyContent="flex-start">
                <Button variant="outlined" onClick={addFilter}>
                  Add Filter
                </Button>
              </Stack>

              <Box sx={{ mt: 3, pt: 2, borderTop: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" gutterBottom>
                  Sort By
                </Typography>
                <Stack
                  direction={{ xs: 'column', md: 'row' }}
                  spacing={2}
                  alignItems={{ md: 'center' }}
                >
                  <FormControl size="small" sx={{ minWidth: 220 }}>
                    <InputLabel>Sort Field</InputLabel>
                    <Select
                      label="Sort Field"
                      value={sortBy || ''}
                      onChange={(e) => setSortBy(e.target.value)}
                    >
                      <MenuItem value="">
                        <em>No sorting</em>
                      </MenuItem>
                      {activeFilterFields.map((f) => (
                        <MenuItem key={f.field} value={f.field}>
                          {f.label || f.field}
                          <Typography variant="caption" sx={{ ml: 1, opacity: 0.7 }}>
                            ({getDisplayType(f)})
                          </Typography>
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>

                  {sortBy && (
                    <FormControl size="small" sx={{ minWidth: 160 }}>
                      <InputLabel>Direction</InputLabel>
                      <Select
                        label="Direction"
                        value={sortDirection || 'asc'}
                        onChange={(e) => setSortDirection(e.target.value)}
                      >
                        <MenuItem value="asc">asc</MenuItem>
                        <MenuItem value="desc">desc</MenuItem>
                      </Select>
                    </FormControl>
                  )}

                  {sortBy && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={() => {
                        setSortBy('');
                        setSortDirection('asc');
                      }}
                    >
                      Clear Sort
                    </Button>
                  )}
                </Stack>
              </Box>
            </Stack>
          </Paper>
        </Collapse>
      </Stack>
    </Paper>
  );
};

export default DashboardFilters;