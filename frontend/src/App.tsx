import React from 'react';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import StockList from './pages/StockList';
import StockDetail from './pages/StockDetail';
import AgentList from './pages/AgentList';
import { Dashboard } from './pages/Dashboard';
import ReportList from './pages/ReportList';
import ReportDetail from './pages/ReportDetail';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="container">
        <nav className="nav">
          <Link to="/">Stocks</Link>
          <Link to="/dashboard">Dashboard</Link>
          <Link to="/agents">Agents</Link>
          <Link to="/reports">Reports</Link>
        </nav>
        <Routes>
          <Route path="/" element={<StockList />} />
          <Route path="/stock/:symbol" element={<StockDetail />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/agents" element={<AgentList />} />
          <Route path="/reports" element={<ReportList />} />
          <Route path="/reports/:id" element={<ReportDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;