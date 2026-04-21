// Application configuration constants
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_URL || 'http://192.168.1.142:8001',
};

export const ROUTES = {
  ROOT: '/',
  TOOLING: '/tooling',
  OPERATOR: '/operator',
  MESIN: '/mesin',
  RUNNING_MESIN: '/running-mesin',
  REPORT: '/report',
  NAVIGATOR: '/navigator',
};

export const NAVIGATION_TABS = [
  { label: "Tooling", to: ROUTES.TOOLING },
  { label: "Operator", to: ROUTES.OPERATOR },
  { label: "Mesin", to: ROUTES.MESIN },
  { label: "Running Mesin", to: ROUTES.RUNNING_MESIN },
  { label: "Report", to: ROUTES.REPORT },
  { label: "📊 Navigator", to: ROUTES.NAVIGATOR },
];

export const APP_CONFIG = {
  TITLE: 'IMN Dashboard',
  DEFAULT_ROUTE: ROUTES.TOOLING,
};