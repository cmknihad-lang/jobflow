import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layout/MainLayout';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Leads from './pages/Leads';
import Quotations from './pages/Quotations';
import Jobs from './pages/Jobs';
import Payments from './pages/Payments';
import FollowUpMessages from './pages/FollowUpMessages';
import Login from './pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/" element={<MainLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="customers" element={<Customers />} />
          <Route path="leads" element={<Leads />} />
          <Route path="quotations" element={<Quotations />} />
          <Route path="jobs" element={<Jobs />} />
          <Route path="payments" element={<Payments />} />
          <Route path="messages" element={<FollowUpMessages />} />
          <Route path="settings" element={<div className="card">Settings Page</div>} />
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;