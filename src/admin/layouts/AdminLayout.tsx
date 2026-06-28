import { useState } from 'react';
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom';
import {
  House,
  User,
  Flask,
  Baby,
  Phone,
  Gear,
  ChartBar,
  CaretDown,
  type IconProps
} from '@phosphor-icons/react';
import logo from '../../assets/mhmb-logo.png';
import { adminNavGroups } from '../components/navConfig';
import { supabase } from '../../shared/lib/supabase';
import { useAuth } from '../../shared/lib/AuthContext';
import '../admin.css';

// Maps each nav group label to its line-icon component, matching the
// clean outline style from the Canva design (replaces the old emoji icons).
const GROUP_ICONS: Record<string, React.FC<IconProps>> = {
  'DONOR MANAGEMENT': User,
  'PROCESSING': Flask,
  'BENEFICIARIES': Baby,
  'SUPPORT': Phone,
  'ADMINISTRATION': Gear,
};

export default function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();

  const { role } = useAuth();
  
  // Expand whichever group contains the current route by default.
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>(() => {
    const initial: Record<string, boolean> = {};
    adminNavGroups.forEach(group => {
      initial[group.label] = location.pathname.startsWith(group.basePath);
    });
    return initial;
  });

  const toggleGroup = (label: string) => {
    setOpenGroups(prev => ({ ...prev, [label]: !prev[label] }));
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/admin/login');
  };

  // Filter groups and children based on user role
  const visibleGroups = adminNavGroups
    .filter(group => !role || group.allowedRoles.includes(role))
    .map(group => ({
      ...group,
      children: group.children.filter(child => !role || child.allowedRoles.includes(role))
    }))
    .filter(group => group.children.length > 0);

  return (
    <div className="admin-root">
      <div className="admin-page">
        <div className="admin-topbar">
          <div className="admin-topbar-brand">
            <div className="admin-sidebar-logo">
              <img src={logo} alt="Makati Human Milk Bank" />
              <span>MAKATI HUMAN MILK BANK</span>
            </div>
          </div>
          <div className="admin-topbar-fill" />
        </div>

        <div className="admin-shell">
          <aside className="admin-sidebar" aria-label="Admin navigation">
            <nav className="admin-nav">
            <NavLink
              to="/admin/dashboard"
              className={({ isActive }) =>
                `admin-nav-toplink${isActive ? ' active' : ''}`
              }
            >
              <span className="admin-nav-icon" aria-hidden="true"><House size={17} weight="bold" /></span>
              DASHBOARD
            </NavLink>

            {visibleGroups.map(group => {
              const isOpen = !!openGroups[group.label];
              const hasActive = location.pathname.startsWith(group.basePath);
              const GroupIcon = GROUP_ICONS[group.label] ?? User;
              return (
                <div
                  key={group.label}
                  className={`admin-nav-group${hasActive ? ' has-active' : ''}`}
                >
                  <button
                    type="button"
                    className={`admin-nav-grouptoggle${hasActive ? ' has-active' : ''}`}
                    aria-expanded={isOpen}
                    onClick={() => toggleGroup(group.label)}
                  >
                    <span className="admin-nav-icon" aria-hidden="true"><GroupIcon size={17} weight="bold" /></span>
                    {group.label}
                    <span className="admin-nav-caret" aria-hidden="true"><CaretDown size={13} weight="bold" /></span>
                  </button>
                  {isOpen && (
                    <div className="admin-nav-sublist">
                      {group.children.map(child => (
                        <NavLink
                          key={child.path}
                          to={child.path}
                          className={({ isActive }) =>
                            `admin-nav-sublink${isActive ? ' active' : ''}`
                          }
                        >
                          {child.label}
                        </NavLink>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}

            {(!role || ['Administrator', 'Coordinator', 'Medical Technologist'].includes(role)) && (
              <NavLink
              to="/admin/reports"
              className={({ isActive }) =>
                `admin-nav-toplink${isActive ? ' active' : ''}`
              }
            >
              <span className="admin-nav-icon" aria-hidden="true"><ChartBar size={17} weight="bold" /></span>
              REPORTS
            </NavLink>
            )}
            </nav>

            <div className="admin-sidebar-footer">
              <button type="button" className="admin-logout-btn" onClick={handleLogout}>
                LOG OUT
              </button>
            </div>
          </aside>

          <div className="admin-main">
            <div className="admin-content">
              <Outlet />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
