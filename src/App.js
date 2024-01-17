import React from 'react';
import { BrowserRouter as Router, Route, Link, Routes } from 'react-router-dom';
import ToolingPage from './ToolingPage';
import OperatorPage from './OperatorPage';
import MesinPage from './MesinPage';
import RunningMesinPage from './RunningMesinPage';
import './App.css';

function App() {
  return (
    <Router>
      <div className="main-container">
        <nav>
          <ul>
            <li><Link to="/tooling">Tooling</Link></li>
            <li><Link to="/operator">Operator</Link></li>
            <li><Link to="/mesin">Mesin</Link></li>
            <li><Link to="/running-mesin">Running Mesin</Link></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/tooling" element={<ToolingPage />} />
          <Route path="/operator" element={<OperatorPage />} />
          <Route path="/mesin" element={<MesinPage />} />
          <Route path="/running-mesin" element={<RunningMesinPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
