import React, { useState } from 'react';
import axios from 'axios';

const CsvUpload = ({ onUploadSuccess, uploadUrl }) => {
    const [file, setFile] = useState(null);

    const handleFileChange = (event) => {
        setFile(event.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/${uploadUrl}/upload_csv`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            alert('File uploaded successfully');
            if (onUploadSuccess) {
                onUploadSuccess();  // Call the passed function to refresh data
            }
        } catch (error) {
            console.error('Error uploading file: ', error);
            const errorMessage = error.response && error.response.data ? error.response.data.detail : "Error uploading file";
            alert(errorMessage);
        }
    };

    return (
        <div>
            <input type="file" onChange={handleFileChange} accept=".csv" />
            <button onClick={handleUpload}>Upload CSV</button>
        </div>
    );
};

export default CsvUpload;