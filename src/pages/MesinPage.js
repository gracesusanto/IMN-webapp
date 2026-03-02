import GenericPage from '../components/GenericPage';
import { API_CONFIG } from '../constants/config';
import { MESIN_FORM_FIELDS, MESIN_COLUMNS, CSV_FORMATS } from '../constants/formFields';

const MesinPage = () => (
  <GenericPage
    apiUrl={API_CONFIG.BASE_URL}
    model="mesin"
    formFields={MESIN_FORM_FIELDS}
    csvFormat={CSV_FORMATS.mesin}
    dataColumns={MESIN_COLUMNS}
    buttonText="Submit Mesin Data"
  />
);

export default MesinPage;