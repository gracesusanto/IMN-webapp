import { useState, useEffect, useMemo } from "react";
import { Box, Button, Paper, Stack, Typography, CircularProgress } from "@mui/material";

import DataTable from "./DataTable";
import CsvUpload from "./CsvUpload";
import GenericForm from "./GenericForm";
import { useApi } from "../hooks/useApi";

export default function GenericPage({
  apiUrl, // Keep for backwards compatibility but we'll use useApi instead
  model,
  formFields,
  csvFormat,
  dataColumns,
  buttonText,
}) {
  // Use the useApi hook for all API operations
  const {
    data,
    loading,
    error,
    fetchData,
    createItem,
    updateItem,
    deleteItem,
    downloadBarcode,
    exportCsv,
    getBarcodeUrl
  } = useApi(model);

  const [currentItem, setCurrentItem] = useState({
    id: "",
    ...formFields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {}),
  });
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const result = await createItem(currentItem);
      if (result.success) {
        setMessage(`Data ${result.data.id} added successfully!`);
        setCurrentItem(
          formFields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {})
        );
        setErrors({});
      } else {
        setMessage("");
        if (result.errors) {
          setErrors(result.errors);
        } else {
          setMessage(result.message || `Error adding ${model}`);
        }
      }
    } catch (error) {
      console.error(`Error submitting ${model}:`, error);
      setMessage(`Error adding ${model}: ${error.message}`);
    }
  };

  const handleEdit = (item) => setCurrentItem(item);

  const confirmDelete = async (id) => {
    const enteredId = window.prompt(`Enter the ID of the ${model} to delete (${id}):`);
    if (enteredId && enteredId === id) {
      try {
        const result = await deleteItem(id);
        if (result.success) {
          window.alert(`Data ${id} deleted successfully!`);
        } else {
          window.alert(result.message || `Error deleting ${model} ${id}.`);
        }
      } catch (error) {
        window.alert(`Error deleting ${model} ${id}.`);
      }
    } else if (enteredId) {
      window.alert(`The entered ID does not match the ${model} ID.`);
    }
  };

  const actionColumn = {
    Header: "Actions",
    id: "actions",
    Cell: ({ row }) => (
      <Stack direction="row" spacing={1}>
        <Button size="small" variant="outlined" onClick={() => handleEdit(row.original)}>
          Modify
        </Button>
        <Button
          size="small"
          variant="contained"
          color="error"
          onClick={() => confirmDelete(row.original.id)}
        >
          Delete
        </Button>
      </Stack>
    ),
  };

  // Only add action column for model tables (tooling, mesin, operator)
  const isModelTable = ['tooling', 'mesin', 'operator'].includes(model.toLowerCase());

  const columnsWithActions = useMemo(
    () => isModelTable ? [...dataColumns, actionColumn] : dataColumns,
    [dataColumns, isModelTable]
  );

  const handleDownloadBarcode = async () => {
    try {
      const result = await downloadBarcode();
      if (!result.success) {
        console.error("Error downloading barcodes:", result.message);
        window.alert("Failed to download barcodes. Please try again.");
      }
    } catch (error) {
      console.error("Error downloading barcodes:", error);
      window.alert("Failed to download barcodes. Please try again.");
    }
  };

  return (
    <Stack spacing={3}>
      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
          <Typography variant="h6">
            {model.charAt(0).toUpperCase() + model.slice(1)} Table
          </Typography>
          <Button variant="outlined" onClick={handleDownloadBarcode}>
            Download Barcode
          </Button>
        </Stack>

        <Box sx={{ mt: 2 }}>
          {loading ? (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight={400}>
              <CircularProgress />
            </Box>
          ) : error ? (
            <Typography color="error" align="center">{error}</Typography>
          ) : (
            <DataTable
              data={data}
              columns={columnsWithActions}
              exportFileName={`${model}_table`}
              modelType={model}
              handleEdit={handleEdit}
              confirmDelete={confirmDelete}
              exportCsv={exportCsv}
              getBarcodeUrl={getBarcodeUrl}
            />
          )}
        </Box>
      </Paper>

      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>
          Add / Modify {model.charAt(0).toUpperCase() + model.slice(1)}
        </Typography>

        <GenericForm
          currentData={currentItem}
          setCurrentData={setCurrentItem}
          handleSubmit={handleSubmit}
          message={{ text: message, buttonText: buttonText }}
          fields={formFields}
          errors={setErrors ? errors : {}}
        />
      </Paper>

      <Paper sx={{ p: 2, borderRadius: 2 }}>
        <Typography variant="h6" sx={{ mb: 1 }}>
          Update {model.charAt(0).toUpperCase() + model.slice(1)} via CSV
        </Typography>
        <Typography variant="body2" sx={{ opacity: 0.85, mb: 2 }}>
          Expected CSV format: <br />
          {csvFormat}
        </Typography>
        <CsvUpload onUploadSuccess={fetchData} uploadUrl={`${model}`} />
      </Paper>
    </Stack>
  );
}
