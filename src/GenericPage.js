import * as React from "react";
import axios from "axios";
import { Box, Button, Paper, Stack, Typography } from "@mui/material";

import DataTable from "./DataTable";
import CsvUpload from "./CsvUpload";
import GenericForm from "./GenericForm";

export default function GenericPage({
  apiUrl,
  model,
  formFields,
  csvFormat,
  dataColumns,
  buttonText,
}) {
  const [data, setData] = React.useState([]);
  const [currentItem, setCurrentItem] = React.useState({
    id: "",
    ...formFields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {}),
  });
  const [message, setMessage] = React.useState("");
  const [errors, setErrors] = React.useState({});

  const fetchData = () => {
    axios
      .get(`${apiUrl}/${model}/`)
      .then((response) => setData(response.data))
      .catch((error) => {
        console.error("Error fetching data: ", error);
        setMessage(`Error fetching ${model}.`);
      });
  };

  React.useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const response = await axios.post(`${apiUrl}/${model}/`, currentItem);
      fetchData();
      setMessage(`Data ${response.data.id} added successfully!`);
      setCurrentItem(
        formFields.reduce((acc, field) => ({ ...acc, [field.name]: "" }), {})
      );
      setErrors({});
    } catch (error) {
      console.error(`Error submitting ${model}:`, error);
      setMessage("");
      if (error.response?.data?.detail) {
        const formErrors = error.response.data.detail.reduce((acc, err) => {
          acc[err.loc[1]] = err.msg;
          return acc;
        }, {});
        setErrors(formErrors);
      } else {
        setMessage(`Error adding ${model}: ${error.message}`);
      }
    }
  };

  const handleEdit = (item) => setCurrentItem(item);

  const confirmDelete = (id) => {
    const enteredId = window.prompt(`Enter the ID of the ${model} to delete (${id}):`);
    if (enteredId && enteredId === id) {
      handleDelete(id);
    } else {
      window.alert(`The entered ID does not match the ${model} ID.`);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.delete(`${apiUrl}/${model}/${id}`);
      fetchData();
      window.alert(`Data ${id} deleted successfully!`);
    } catch (error) {
      window.alert(`Error deleting ${model} ${id}.`);
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

  const columnsWithActions = React.useMemo(
    () => [...dataColumns, actionColumn],
    [dataColumns]
  );

  const handleDownloadBarcode = async () => {
    try {
      const response = await axios.get(`${apiUrl}/download-barcode/${model}/`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `${model}_barcodes.xlsx`);
      document.body.appendChild(link);
      link.click();
      window.URL.revokeObjectURL(url);
      link.remove();
    } catch (error) {
      console.error("Error downloading barcodes:", error);
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
          <DataTable
            data={data}
            columns={columnsWithActions}
            exportFileName={`${model}_table`}
            handleEdit={handleEdit}
            confirmDelete={confirmDelete}
          />
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
