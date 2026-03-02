import GenericPage from '../components/GenericPage';
import { API_CONFIG } from '../constants/config';
import { TOOLING_FORM_FIELDS, TOOLING_COLUMNS, CSV_FORMATS } from '../constants/formFields';

const ToolingPage = () => (
  <GenericPage
    apiUrl={API_CONFIG.BASE_URL}
    model="tooling"
    formFields={TOOLING_FORM_FIELDS}
    csvFormat={CSV_FORMATS.tooling}
    dataColumns={TOOLING_COLUMNS}
    buttonText="Submit Tooling Data"
    downloadText="Download Tooling Barcodes"
    uploadText="Update Tooling via CSV"
    addNewText="Add New Tooling"
  />
);

export default ToolingPage;