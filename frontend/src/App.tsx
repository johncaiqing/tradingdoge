import React from 'react';
import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom';
import StockList from './pages/StockList';
import StockDetail from './pages/StockDetail';
import AgentList from './pages/AgentList';
import ReportList from './pages/ReportList';
import ReportDetail from './pages/ReportDetail';

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <div className="container">
        <nav className="nav">
          <Link to="/stocks">US Stocks</Link>
          <Link to="/crypto">Crypto</Link>
          <Link to="/reports">Reports</Link>
          <Link to="/agents">Agents</Link>
        </nav>
        <Routes>
          <Route path="/" element={<Navigate to="/stocks" replace />} />
          <Route path="/stocks" element={<StockList category="stock" />} />
          <Route path="/crypto" element={<StockList category="crypto" />} />
          <Route path="/stock/:symbol" element={<StockDetail />} />
          <Route path="/agents" element={<AgentList />} />
          <Route path="/reports" element={<ReportList />} />
          <Route path="/reports/:id" element={<ReportDetail />} />
        </Routes>
      </div>
    </BrowserRouter>
  );
};

export default App;