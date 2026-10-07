import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  UserCheck,
  Building2,
  CalendarDays,
  CalendarCheck,
  ListOrdered,
  History,
  FileText,
  ShieldCheck,
  Activity,
  HeartPulse,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export const Sidebar = ({ isOpen, onClose }) => {
  const { role } = useAuth();

  const getNavItems = () => {
    switch (role) {
      case 'ADMIN':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Patients', path: '/patients', icon: Users },
          { name: 'Doctors', path: '/doctors', icon: UserCheck },
          { name: 'Departments', path: '/departments', icon: Building2 },
          { name: 'Availability', path: '/availability', icon: CalendarDays },
          { name: 'Appointments', path: '/appointments', icon: CalendarCheck },
          { name: 'Queue', path: '/queue', icon: ListOrdered },
          { name: 'Reports', path: '/reports', icon: FileText },
          { name: 'Audit Logs', path: '/audit-logs', icon: ShieldCheck },
        ];

      case 'RECEPTIONIST':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Patients', path: '/patients', icon: Users },
          { name: 'Appointments', path: '/appointments', icon: CalendarCheck },
          { name: 'Queue', path: '/queue', icon: ListOrdered },
        ];

      case 'DOCTOR':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'My Appointments', path: '/appointments', icon: CalendarCheck },
          { name: 'My Queue', path: '/queue', icon: ListOrdered },
          { name: 'Availability', path: '/availability', icon: CalendarDays },
          { name: 'Appointment History', path: '/appointment-history', icon: History },
        ];

      case 'MANAGER':
        return [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Appointments', path: '/appointments', icon: CalendarCheck },
          { name: 'Queue', path: '/queue', icon: ListOrdered },
          { name: 'Reports', path: '/reports', icon: FileText },
          { name: 'Audit Logs', path: '/audit-logs', icon: ShieldCheck },
        ];

      case 'PATIENT':
        return [
          { name: 'Patient Portal', path: '/dashboard', icon: LayoutDashboard },
          { name: 'Book Appointment', path: '/appointments', icon: CalendarCheck },
          { name: 'Doctors & Specialties', path: '/doctors', icon: UserCheck },
          { name: 'Departments', path: '/departments', icon: Building2 },
        ];

      default:
        return [
          { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
        ];
    }
  };

  const navItems = getNavItems();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 flex-col bg-slate-900 text-white transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center gap-3 border-b border-slate-800 px-6 bg-slate-950/40">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-teal-600 shadow-md shadow-teal-500/20">
            <HeartPulse className="h-6 w-6 text-white" />
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white flex items-center gap-1.5">
              MedQueue
              <span className="text-[10px] uppercase font-semibold tracking-wider px-1.5 py-0.5 rounded bg-teal-900/80 text-teal-300 border border-teal-700/50">
                PRO
              </span>
            </h1>
            <p className="text-xs text-slate-400">Healthcare Operations</p>
          </div>
        </div>

        <div className="mx-4 my-4 p-3 rounded-xl bg-slate-800/80 border border-slate-700/60 flex items-center justify-between">
          <div>
            <span className="text-[11px] font-medium uppercase text-slate-400">Authenticated Role</span>
            <p className="text-xs font-semibold text-teal-400 tracking-wide uppercase">{role || 'USER'}</p>
          </div>
          <div className="h-2 w-2 rounded-full bg-teal-500 animate-pulse"></div>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-2 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `group flex items-center gap-3 rounded-xl px-3.5 py-2.5 text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-600/25'
                      : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`h-4.5 w-4.5 transition-transform group-hover:scale-110 ${
                        isActive ? 'text-white' : 'text-slate-400 group-hover:text-teal-400'
                      }`}
                    />
                    <span>{item.name}</span>
                  </>
                )}
              </NavLink>
            );
          })}
        </nav>

        <div className="border-t border-slate-800/80 p-4 text-xs text-slate-400 bg-slate-950/30">
          <div className="flex items-center gap-2 text-[11px] text-slate-400 mb-1">
            <Activity className="h-3.5 w-3.5 text-teal-400" />
            <span>Capacity Engine: Active</span>
          </div>
          <p className="text-[10px] text-slate-500">Connected: Spring Boot &bull; MySQL</p>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
