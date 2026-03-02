import * as React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useLocation,
} from "react-router-dom";
import { AppBar, Box, Container, Tab, Tabs, Toolbar, Typography } from "@mui/material";

import ToolingPage from "./ToolingPage";
import OperatorPage from "./OperatorPage";
import MesinPage from "./MesinPage";
import RunningMesinPage from "./RunningMesinPage";
import ReportPage from "./ReportPage";
import "./App.css";

const tabs = [
  { label: "Tooling", to: "/tooling" },
  { label: "Operator", to: "/operator" },
  { label: "Mesin", to: "/mesin" },
  { label: "Running Mesin", to: "/running-mesin" },
  { label: "Report", to: "/report" },
];

function NavTabs() {
  const location = useLocation();
  const current = tabs.find((t) => location.pathname.startsWith(t.to))?.to || "/tooling";

  return (
    <Tabs
      value={current}
      textColor="inherit"
      indicatorColor="secondary"
      variant="scrollable"
      scrollButtons="auto"
      sx={{ ml: 2, flex: 1 }}
    >
      {tabs.map((t) => (
        <Tab key={t.to} label={t.label} value={t.to} component={Link} to={t.to} />
      ))}
    </Tabs>
  );
}

function AppShell() {
  return (
    <Box className="App">
      <AppBar position="sticky" elevation={1}>
        <Toolbar>
          <Typography variant="h6" sx={{ whiteSpace: "nowrap" }}>
            IMN Dashboard
          </Typography>
          <NavTabs />
        </Toolbar>
      </AppBar>

      <Container className="main-container" maxWidth={false}>
        <Routes>
          <Route path="/" element={<Navigate to="/tooling" replace />} />
          <Route path="/tooling" element={<ToolingPage />} />
          <Route path="/operator" element={<OperatorPage />} />
          <Route path="/mesin" element={<MesinPage />} />
          <Route path="/running-mesin" element={<RunningMesinPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="*" element={<Navigate to="/tooling" replace />} />
        </Routes>
      </Container>
    </Box>
  );
}

export default function App() {
  return (
    <Router>
      <AppShell />
    </Router>
  );
}
