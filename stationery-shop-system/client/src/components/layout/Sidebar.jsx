import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Boxes,
  Users,
  History,
  BarChart3,
  UserCog,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import Logo from '../common/Logo';

const navItems = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard, roles: ['owner', 'staff'] },
  { to: '/products', label: 'Products', icon: Package, roles: ['owner', 'staff'] },
  { to: '/billing', label: 'Billing / POS', icon: ShoppingCart, roles: ['owner', 'staff'] },
  { to: '/stock', label: 'Stock Management', icon: Boxes, roles: ['owner'] },
  { to: '/customers', label: 'Customers', icon: Users, roles: ['owner', 'staff'] },
  { to: '/sales-history', label: 'Sales History', icon: History, roles: ['owner', 'staff'] },
  { to: '/reports', label: 'Reports', icon: BarChart3, roles: ['owner'] },
  { to: '/staff', label: 'Staff Management', icon: UserCog, roles: ['owner'] },
  { to: '/settings', label: 'Settings', icon: Settings, roles: ['owner'] },
];

export default function Sidebar({ isOpen }) {
  const { user } = useAuth();

  return (
    <aside
      className={`fixed lg:static z-40 top-0 left-0 h-full bg-white border-r border-slate-200 w-64 transform transition-transform duration-200 ${
        isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
      }`}
    >
      <div className="h-16 flex items-center gap-2.5 px-6 border-b border-slate-200">
        <Logo size={30} />
        <span className="font-extrabold text-lg text-slate-800">Billu</span>
      </div>
      <nav className="p-3 flex flex-col gap-1">
        {navItems
          .filter((item) => item.roles.includes(user?.role))
          .map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive ? 'bg-indigo-50 text-indigo-600' : 'text-slate-600 hover:bg-slate-50'
                }`
              }
            >
              <item.icon size={18} />
              {item.label}
            </NavLink>
          ))}
      </nav>
    </aside>
  );
}
