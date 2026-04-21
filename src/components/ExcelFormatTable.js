import React, { useMemo } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box } from '@mui/material';

const ExcelFormatTable = ({ data, loading, rowCount, paginationModel, onPaginationModelChange }) => {
  // Define columns matching exact Excel order
  const columns = useMemo(() => [
    { field: 'status', headerName: 'STATUS', width: 80, sortable: true },
    { field: 'mc_no', headerName: 'MC NO.', width: 100, sortable: true },
    { field: 'part_no_name', headerName: 'PART NO / NAME', width: 250, sortable: true },
    { field: 'proses', headerName: 'PROSES', width: 80, sortable: true },
    { field: 'target_per_jam', headerName: 'TARGET PER JAM', width: 130, type: 'number', sortable: true },
    { field: 'target_qty', headerName: 'TARGET QTY.', width: 120, type: 'number', sortable: true },
    { field: 'output', headerName: 'OUTPUT', width: 100, type: 'number', sortable: true },
    { field: 'reject', headerName: 'REJECT', width: 100, type: 'number', sortable: true },
    { field: 'plan', headerName: 'PLAN', width: 100, sortable: true },
    { field: 'rt', headerName: 'RT', width: 100, sortable: true },
    { field: 'tp', headerName: 'TP', width: 100, sortable: true },
    { field: 'ts', headerName: 'TS', width: 100, sortable: true },
    { field: 'qc', headerName: 'QC', width: 100, sortable: true },
    { field: 'cm', headerName: 'CM', width: 100, sortable: true },
    { field: 'no', headerName: 'NO', width: 100, sortable: true },
    { field: 'np', headerName: 'NP', width: 100, sortable: true },
    { field: 'nm', headerName: 'NM', width: 100, sortable: true },
    { field: 'mp', headerName: 'MP', width: 100, sortable: true },
    { field: 'catatan', headerName: 'CATATAN', width: 200, sortable: true },
    { field: 'per', headerName: 'PER', width: 80, sortable: true },
    { field: 'otr', headerName: 'OTR', width: 80, sortable: true },
    { field: 'qr', headerName: 'QR', width: 80, sortable: true },
    { field: 'oee', headerName: 'OEE', width: 80, sortable: true },
    { field: 'tanggal', headerName: 'Tanggal', width: 120, sortable: true },
    { field: 'shift', headerName: 'Shift', width: 80, type: 'number', sortable: true },
  ], []);

  // Add unique IDs to rows for DataGrid
  const rowsWithIds = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];
    return data.map((row, index) => ({
      id: index,
      ...row
    }));
  }, [data]);

  return (
    <Box sx={{ height: 600, width: '100%' }}>
      <DataGrid
        rows={rowsWithIds}
        columns={columns}
        loading={loading}
        paginationMode="server"
        rowCount={rowCount}
        paginationModel={paginationModel}
        onPaginationModelChange={onPaginationModelChange}
        pageSizeOptions={[10, 20, 50, 100]}
        disableRowSelectionOnClick
        sortingMode="server"
        filterMode="server"
        sx={{
          '& .MuiDataGrid-columnHeaders': {
            backgroundColor: '#f5f5f5',
            fontWeight: 'bold',
          },
          '& .MuiDataGrid-cell': {
            fontSize: '0.875rem',
          },
          '& .MuiDataGrid-columnHeader': {
            fontSize: '0.875rem',
            fontWeight: 'bold',
          }
        }}
      />
    </Box>
  );
};

export default ExcelFormatTable;