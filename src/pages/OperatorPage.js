import GenericPage from '../components/GenericPage';
import { API_CONFIG } from '../constants/config';
import { OPERATOR_FORM_FIELDS, OPERATOR_COLUMNS, CSV_FORMATS } from '../constants/formFields';

const OperatorPage = () => (
  <GenericPage
    apiUrl={API_CONFIG.BASE_URL}
    model="operator"
    formFields={OPERATOR_FORM_FIELDS}
    csvFormat={CSV_FORMATS.operator}
    dataColumns={OPERATOR_COLUMNS}
    buttonText="Add Operator"
  />
);

export default OperatorPage;