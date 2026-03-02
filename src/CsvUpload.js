import * as React from "react";
import axios from "axios";
import { Alert, Button, Stack, Typography } from "@mui/material";

export default function CsvUpload({ onUploadSuccess, uploadUrl }) {
  const [file, setFile] = React.useState(null);
  const [status, setStatus] = React.useState({ type: "", text: "" });

  const handleFileChange = (event) => {
    setFile(event.target.files?.[0] || null);
    setStatus({ type: "", text: "" });
  };

  const handleUpload = async () => {
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      await axios.post(
        `${process.env.REACT_APP_API_URL}/${uploadUrl}/upload_csv`,
        formData,
        { headers: { "Content-Type": "multipart/form-data" } }
      );
      setStatus({ type: "success", text: "File uploaded successfully." });
      onUploadSuccess?.();
    } catch (error) {
      const errorMessage =
        error.response && error.response.data
          ? (error.response.data.detail || "Error uploading file")
          : "Error uploading file";
      setStatus({ type: "error", text: String(errorMessage) });
    }
  };

  return (
    <Stack spacing={1.5}>
      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap">
        <Button variant="outlined" component="label">
          Choose CSV
          <input type="file" hidden accept=".csv" onChange={handleFileChange} />
        </Button>
        <Typography variant="body2" sx={{ opacity: 0.8 }}>
          {file ? file.name : "No file selected"}
        </Typography>
        <Button variant="contained" onClick={handleUpload} disabled={!file}>
          Upload
        </Button>
      </Stack>

      {status.text ? (
        <Alert severity={status.type === "error" ? "error" : "success"}>
          {status.text}
        </Alert>
      ) : null}
    </Stack>
  );
}
