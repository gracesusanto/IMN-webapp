import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AppBar, Box, Container, Tab, Tabs, Toolbar, Typography } from "@mui/material";

import ToolingPage from "./pages/ToolingPage";
import OperatorPage from "./pages/OperatorPage";
import MesinPage from "./pages/MesinPage";
import RunningMesinPage from "./pages/RunningMesinPage";
import ReportPage from "./pages/ReportPage";
import NavigatorPage from "./pages/NavigatorPage";
import { NAVIGATION_TABS, APP_CONFIG, ROUTES } from "./constants/config";

function NavTabs() {
  const location = useLocation();
  const current = NAVIGATION_TABS.find((t) => location.pathname.startsWith(t.to))?.to || APP_CONFIG.DEFAULT_ROUTE;

  return (
    <Tabs
      value={current}
      textColor="inherit"
      indicatorColor="secondary"
      variant="scrollable"
      scrollButtons="auto"
      sx={{ ml: 2, flex: 1 }}
    >
      {NAVIGATION_TABS.map((tab) => (
        <Tab key={tab.to} label={tab.label} value={tab.to} component={Link} to={tab.to} />
      ))}
    </Tabs>
  );
}

export default function App() {
  return (
    <Router>
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
        <AppBar position="sticky" elevation={1}>
          <Toolbar>
            <Typography variant="h6" sx={{ whiteSpace: "nowrap" }}>
              {APP_CONFIG.TITLE}
            </Typography>
            <NavTabs />
          </Toolbar>
        </AppBar>

        <Container component="main" maxWidth={false} sx={{ flex: 1, py: 3 }}>
          <Routes>
            <Route path={ROUTES.ROOT} element={<Navigate to={APP_CONFIG.DEFAULT_ROUTE} replace />} />
            <Route path={ROUTES.TOOLING} element={<ToolingPage />} />
            <Route path={ROUTES.OPERATOR} element={<OperatorPage />} />
            <Route path={ROUTES.MESIN} element={<MesinPage />} />
            <Route path={ROUTES.RUNNING_MESIN} element={<RunningMesinPage />} />
            <Route path={ROUTES.REPORT} element={<ReportPage />} />
            <Route path={ROUTES.NAVIGATOR} element={<NavigatorPage />} />
            <Route path="*" element={<Navigate to={APP_CONFIG.DEFAULT_ROUTE} replace />} />
          </Routes>
        </Container>
      </Box>
    </Router>
  );
}
