import { Routes, Route } from 'react-router-dom';
import PublicLayout from './public-site/layouts/PublicLayout';
import HomePage from './public-site/pages/HomePage';
import DonateForm from './public-site/pages/DonateForm';
import AboutUs from './public-site/pages/AboutUs';
import WhoWeHelp from './public-site/pages/WhoWeHelp';
import MilkyWay from './public-site/pages/MilkyWay';
import SupsupTodo from './public-site/pages/SupsupTodo';
import MomsAct from './public-site/pages/MomsAct';
import Procedure from './public-site/pages/Procedure';
import Safety from './public-site/pages/Safety';

import AdminLayout from './admin/layouts/AdminLayout';
import Login from './admin/pages/Login';
import Dashboard from './admin/pages/Dashboard';
import Applicants from './admin/pages/Applicants';
import Donors from './admin/pages/Donors';
import Collections from './admin/pages/Collections';
import Laboratory from './admin/pages/Laboratory';
import Pasteurization from './admin/pages/Pasteurization';
import Inventory from './admin/pages/Inventory';
import Beneficiaries from './admin/pages/Beneficiaries';
import Dispensing from './admin/pages/Dispensing';
import Hotline from './admin/pages/Hotline';
import Reports from './admin/pages/Reports';
import UserManagement from './admin/pages/UserManagement';
import ProtectedRoute from './admin/components/ProtectedRoute';

import { AuthProvider } from './shared/lib/AuthContext';

import { Navigate } from 'react-router-dom';

function App() {
  const hostname = window.location.hostname;
  // Support admin.hmbms.com, admin.localhost, and Vercel preview domains starting with admin-
  const isAdminDomain = hostname.startsWith('admin.') || hostname.startsWith('admin-');

  if (isAdminDomain) {
    return (
      <AuthProvider>
        <Routes>
          {/* Admin Panel */}
          <Route path="/login" element={<Login />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<AdminLayout />}>
              <Route path="dashboard" element={<Dashboard />} />
              
              <Route element={<ProtectedRoute allowedRoles={['Administrator', 'Coordinator', 'Nurse', 'Midwife', 'Medical Technologist']} />}>
                <Route path="donor-management/applicants" element={<Applicants />} />
              </Route>
              
              <Route element={<ProtectedRoute allowedRoles={['Administrator', 'Coordinator', 'Nurse', 'Nurse Attendant', 'Midwife', 'Medical Technologist']} />}>
                <Route path="donor-management/donors" element={<Donors />} />
              </Route>
              
              <Route element={<ProtectedRoute allowedRoles={['Administrator', 'Coordinator', 'Nurse', 'Nurse Attendant', 'Midwife']} />}>
                <Route path="donor-management/collections" element={<Collections />} />
              </Route>
              
              <Route element={<ProtectedRoute allowedRoles={['Administrator', 'Coordinator', 'Nurse', 'Midwife', 'Medical Technologist']} />}>
                <Route path="processing/laboratory" element={<Laboratory />} />
              </Route>
              
              <Route element={<ProtectedRoute allowedRoles={['Administrator', 'Coordinator', 'Nurse', 'Nurse Attendant', 'Medical Technologist']} />}>
                <Route path="processing/pasteurization" element={<Pasteurization />} />
                <Route path="processing/inventory" element={<Inventory />} />
              </Route>
              
              <Route element={<ProtectedRoute allowedRoles={['Administrator', 'Coordinator', 'Nurse', 'Nurse Attendant', 'Midwife']} />}>
                <Route path="beneficiaries/list" element={<Beneficiaries />} />
                <Route path="beneficiaries/dispensing" element={<Dispensing />} />
              </Route>
              
              <Route path="support/hotline" element={<Hotline />} />
              
              <Route element={<ProtectedRoute allowedRoles={['Administrator', 'Coordinator', 'Medical Technologist']} />}>
                <Route path="reports" element={<Reports />} />
              </Route>
              
              <Route element={<ProtectedRoute allowedRoles={['Administrator']} />}>
                <Route path="administration/user-management" element={<UserManagement />} />
              </Route>
            </Route>
          </Route>
          {/* Fallback for admin domain */}
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </AuthProvider>
    );
  }

  // Public Domain
  return (
    <AuthProvider>
      <Routes>
        {/* Public site */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/donate" element={<DonateForm />} />
          <Route path="/about" element={<AboutUs />} />
          <Route path="/who" element={<WhoWeHelp />} />
          <Route path="/milky-way" element={<MilkyWay />} />
          <Route path="/supsup-todo" element={<SupsupTodo />} />
          <Route path="/moms-act" element={<MomsAct />} />
          <Route path="/procedure" element={<Procedure />} />
          <Route path="/safety" element={<Safety />} />
        </Route>
        {/* Fallback for public domain */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
}

export default App;
