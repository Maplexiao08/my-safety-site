import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import CaseLibrary from './components/CaseLibrary';
import CaseDetail from './components/CaseDetail';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app">
        <header className="header">
          <div className="header-inner">
            <Link to="/" className="logo">安全事故数据平台</Link>
            <span className="subtitle">HSE Safety Incident Dashboard</span>
            <nav className="nav">
              <Link to="/" className="nav-link">首页</Link>
              <Link to="/cases" className="nav-link">案例库</Link>
            </nav>
          </div>
        </header>

        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/cases" element={<CaseLibrary />} />
          <Route path="/case/:id" element={<CaseDetail />} />
        </Routes>

        <footer className="footer">
          <span>数据来源：应急管理部事故调查报告 &middot; 仅供内部参考</span>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;