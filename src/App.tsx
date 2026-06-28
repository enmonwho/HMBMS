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
import Process from './public-site/pages/Process';
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

function App() {
  return (
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
        <Route path="/process" element={<Process />} />
        <Route path="/safety" element={<Safety />} />
      </Route>

      {/* Admin Panel */}
      <Route path="/admin/login" element={<Login />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="donor-management/applicants" element={<Applicants />} />
          <Route path="donor-management/donors" element={<Donors />} />
          <Route path="donor-management/collections" element={<Collections />} />
          <Route path="processing/laboratory" element={<Laboratory />} />
          <Route path="processing/pasteurization" element={<Pasteurization />} />
          <Route path="processing/inventory" element={<Inventory />} />
          <Route path="beneficiaries/list" element={<Beneficiaries />} />
          <Route path="beneficiaries/dispensing" element={<Dispensing />} />
          <Route path="support/hotline" element={<Hotline />} />
          <Route path="reports" element={<Reports />} />
          <Route path="administration/user-management" element={<UserManagement />} />
        </Route>
      </Route>
    </Routes>
  );
}

export default App;
