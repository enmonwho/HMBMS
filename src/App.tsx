import { Routes, Route } from 'react-router-dom';
import PublicLayout from './PublicLayout';
import HomePage from './HomePage';
import DonateForm from './DonateForm';
import AboutUs from './AboutUs';
import WhoWeHelp from './WhoWeHelp';
import MilkyWay from './MilkyWay';
import SupsupTodo from './SupsupTodo';
import MomsAct from './MomsAct';
import Procedure from './Procedure';
import Process from './Process';
import Safety from './Safety';

import AdminLayout from './admin/AdminLayout';
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

function App() {
  return (
    <Routes>
      {/* ── Public site ── */}
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

      {/* ── Admin (no public NavBar/Footer) ── */}
      <Route path="/admin/login" element={<Login />} />
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
    </Routes>
  );
}

export default App;
