export const DEFAULT_OPERATORS = {
  string: ['contains', 'equals', 'notContains', 'notEquals', 'startsWith', 'endsWith', 'isEmpty', 'isNotEmpty'],
  number: ['equals', 'notEquals', 'gt', 'gte', 'lt', 'lte', 'between'],
  date: ['equals', 'notEquals', 'gt', 'gte', 'lt', 'lte', 'between'],
};

export function getColumnField(col) {
  return col.accessor || col.id;
}

export function getColumnHeader(col) {
  return col.Header || col.headerName || getColumnField(col);
}

export function getFilterType(col) {
  return col?.filter?.type || 'string';
}

export function getOperatorsForColumn(col) {
  const type = getFilterType(col);
  return col?.filter?.operators || DEFAULT_OPERATORS[type] || DEFAULT_OPERATORS.string;
}

function normalize(value) {
  if (value === null || value === undefined) return '';
  return value;
}

function applyStringFilter(rawValue, operator, filterValue) {
  const rowValue = String(normalize(rawValue)).toLowerCase();
  const value = String(normalize(filterValue)).toLowerCase();

  switch (operator) {
    case 'contains':
      return rowValue.includes(value);
    case 'notContains':
      return !rowValue.includes(value);
    case 'equals':
      return rowValue === value;
    case 'notEquals':
      return rowValue !== value;
    case 'startsWith':
      return rowValue.startsWith(value);
    case 'endsWith':
      return rowValue.endsWith(value);
    case 'isEmpty':
      return rowValue.trim() === '';
    case 'isNotEmpty':
      return rowValue.trim() !== '';
    default:
      return true;
  }
}

function applyNumberFilter(rawValue, operator, filterValue, secondValue) {
  const rowValue = Number(rawValue);
  if (Number.isNaN(rowValue)) return false;

  const value = Number(filterValue);
  const second = Number(secondValue);

  switch (operator) {
    case 'equals':
      return rowValue === value;
    case 'notEquals':
      return rowValue !== value;
    case 'gt':
      return rowValue > value;
    case 'gte':
      return rowValue >= value;
    case 'lt':
      return rowValue < value;
    case 'lte':
      return rowValue <= value;
    case 'between': {
      const hasMin = filterValue !== '' && filterValue !== null && filterValue !== undefined;
      const hasMax = secondValue !== '' && secondValue !== null && secondValue !== undefined;
      if (hasMin && rowValue < value) return false;
      if (hasMax && rowValue > second) return false;
      return true;
    }
    default:
      return true;
  }
}

export function applyAdvancedFilters(rows, filters, columns) {
  if (!filters || filters.length === 0) return rows;

  const columnMap = new Map(columns.map((col) => [getColumnField(col), col]));

  return rows.filter((row) => {
    return filters.every((filter) => {
      if (!filter.field || !filter.operator) return true;

      const col = columnMap.get(filter.field);
      const type = getFilterType(col);
      const rawValue = row?.[filter.field];

      if (type === 'number') {
        return applyNumberFilter(rawValue, filter.operator, filter.value, filter.valueTo);
      }

      if (type === 'date') {
        return applyDateFilter(rawValue, filters.operator, filters.value, filters.valueTo);
      }

      return applyStringFilter(rawValue, filter.operator, filter.value);
    });
  });
}

function toTimestamp(value) {
  if (value === null || value === undefined || value === '') return null;
  const ts = new Date(value).getTime();
  return Number.isNaN(ts) ? null : ts;
}

function applyDateFilter(rawValue, operator, filterValue, secondValue) {
  const rowValue = toTimestamp(rawValue);
  if (rowValue === null) return false;

  const value = toTimestamp(filterValue);
  const second = toTimestamp(secondValue);

  switch (operator) {
    case 'equals':
      return value !== null && rowValue === value;
    case 'notEquals':
      return value !== null && rowValue !== value;
    case 'gt':
      return value !== null && rowValue > value;
    case 'gte':
      return value !== null && rowValue >= value;
    case 'lt':
      return value !== null && rowValue < value;
    case 'lte':
      return value !== null && rowValue <= value;
    case 'between': {
      const hasMin = value !== null;
      const hasMax = second !== null;
      if (hasMin && rowValue < value) return false;
      if (hasMax && rowValue > second) return false;
      return true;
    }
    default:
      return true;
  }
}
