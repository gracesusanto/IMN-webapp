import * as React from "react";
import { DataGrid } from "@mui/x-data-grid";
import { Box } from "@mui/material";

/**
 * Adapter: your pages pass react-table style columns:
 *  - { Header, accessor, Cell? }
 * We convert to MUI columns:
 *  - { field, headerName, flex/width, renderCell? }
 */
function toMuiColumns(columns) {
  return (columns || []).map((c) => {
    const field = c.accessor || c.id; // accessor is what your code uses
    return {
      field,
      headerName: c.Header ?? field,
      flex: 1,
      minWidth: 120,
      sortable: true,
      filterable: true,
      resizable: true, // MUI will allow resizing in newer versions
      renderCell: c.Cell
        ? (params) => c.Cell({ value: params.value, row: { original: params.row } })
        : undefined,
    };
  });
}

export default function DataTable({ columns, data }) {
  const muiColumns = React.useMemo(() => toMuiColumns(columns), [columns]);

  // DataGrid expects each row to have a stable `id` field
  const rows = React.useMemo(() => {
    return (data || []).map((r, idx) => {
      if (r && (r.id !== undefined && r.id !== null)) return r;
      return { id: idx, ...r }; // fallback if API data doesn’t include id
    });
  }, [data]);

  return (
    <Box sx={{ width: "100%" }}>
      <DataGrid
        rows={rows}
        columns={muiColumns}
        autoHeight
        disableRowSelectionOnClick
        pagination
        initialState={{
          pagination: { paginationModel: { pageSize: 20, page: 0 } },
        }}
        pageSizeOptions={[10, 20, 50, 100]}
        density="compact"
        sx={{
          border: 0,
          "& .MuiDataGrid-columnHeaders": { borderBottom: "1px solid rgba(224,224,224,1)" },
          "& .MuiDataGrid-cell": { borderBottom: "1px solid rgba(224,224,224,1)" },
        }}
      />
    </Box>
  );
}
