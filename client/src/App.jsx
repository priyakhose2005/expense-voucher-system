import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import ProtectedRoute from './routes/ProtectedRoute';
import AppLayout from './components/AppLayout';

import Login from './pages/Login';
import VoucherDetails from './pages/shared/VoucherDetails';
import AllVouchers from './pages/shared/AllVouchers';

import EmployeeDashboard from './pages/employee/Dashboard';
import VoucherForm from './pages/employee/VoucherForm';
import MyVouchers from './pages/employee/MyVouchers';

import DirectorDashboard from './pages/director/Dashboard';
import PendingApprovals from './pages/director/PendingApprovals';

import AccountsDashboard from './pages/accounts/Dashboard';

function RoleHome() {
  const { user } = useAuth();
  if (user.role === 'employee') return <EmployeeDashboard />;
  if (user.role === 'director') return <DirectorDashboard />;
  if (user.role === 'accounts') return <AccountsDashboard />;
  return null;
}

function Shell({ children }) {
  return <AppLayout>{children}</AppLayout>;
}

function RoleScopedVoucherList() {
  const { user } = useAuth();
  if (user.role === 'employee') return <MyVouchers />;
  return <AllVouchers />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />

          <Route path="/" element={
            <ProtectedRoute><Shell><RoleHome /></Shell></ProtectedRoute>
          } />

          <Route path="/vouchers/new" element={
            <ProtectedRoute roles={['employee']}><Shell><VoucherForm /></Shell></ProtectedRoute>
          } />
          <Route path="/vouchers/:id/edit" element={
            <ProtectedRoute roles={['employee']}><Shell><VoucherForm /></Shell></ProtectedRoute>
          } />

          <Route path="/vouchers" element={
            <ProtectedRoute><Shell><RoleScopedVoucherList /></Shell></ProtectedRoute>
          } />

          <Route path="/vouchers/:id" element={
            <ProtectedRoute><Shell><VoucherDetails /></Shell></ProtectedRoute>
          } />

          <Route path="/pending" element={
            <ProtectedRoute roles={['director']}><Shell><PendingApprovals /></Shell></ProtectedRoute>
          } />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
