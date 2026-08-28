import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  TrendingUp,
  PlusCircle,
  ShieldCheck,
  LogOut,
  LayoutGrid,
  Home,
  X,
} from 'lucide-react';

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout, isAdmin, isSales } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  if (!user || (!isAdmin && !isSales)) {
    return null;
  }

  const handleLogout = async () => {
    await logout();
    if (onClose) onClose();
    navigate('/login');
  };

  const isActive = (path) => location.pathname === path;

  const adminLinks = [
    { label: 'Admin Dashboard', path: '/admin/dashboard', icon: Shield, badge: 'Superuser' },
    { label: 'Store Catalog', path: '/products', icon: LayoutGrid },
    { label: 'Add New Product', path: '/products/new', icon: PlusCircle, highlight: true },
    { label: 'RBAC Live Matrix', path: '/test-access', icon: ShieldCheck },
  ];

  const salesLinks = [
    { label: 'Sales Dashboard', path: '/sales/dashboard', icon: TrendingUp, badge: 'Merchant' },
    { label: 'Store Catalog', path: '/products', icon: LayoutGrid },
    { label: 'Add New Product', path: '/products/new', icon: PlusCircle, highlight: true },
    { label: 'RBAC Live Matrix', path: '/test-access', icon: ShieldCheck },
  ];

  const links = isAdmin ? adminLinks : salesLinks;

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 lg:hidden animate-in fade-in duration-200"
        />
      )}

      {/* Sidebar (Fixed on Desktop w-64, Slide-over Drawer on Mobile) */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 w-64 bg-white border-r border-slate-200/90 shadow-xl lg:shadow-none flex flex-col justify-between transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Brand Header */}
        <div>
          <div className="h-16 px-5 border-b border-slate-100 flex items-center justify-between">
            <Link
              to="/"
              onClick={() => onClose && onClose()}
              className="flex items-center space-x-3 group"
            >
              <div className="w-9 h-9 rounded-2xl bg-brand-gradient text-white font-black text-base shadow-brand-glow flex items-center justify-center font-display group-hover:scale-105 transition-transform">
                CH
              </div>
              <div>
                <span className="font-display font-bold text-base text-slate-900 tracking-tight block">
                  CommerceHub
                </span>
                <span className="text-[10px] font-extrabold text-indigo-600 uppercase tracking-widest block -mt-0.5">
                  {isAdmin ? 'Admin Console' : 'Merchant Portal'}
                </span>
              </div>
            </Link>

            {/* Close Button on Mobile */}
            <button
              onClick={onClose}
              className="lg:hidden p-1.5 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
              title="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* User Role Card */}
          <div className="p-3.5 mx-3.5 my-4 bg-slate-50 border border-slate-200/80 rounded-2xl">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-2xl bg-brand-gradient text-white font-black text-xs flex items-center justify-center shadow-xs uppercase">
                {user.name ? user.name.slice(0, 2) : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-900 truncate">{user.name}</p>
                <div className="flex items-center space-x-1.5 mt-0.5">
                  <span
                    className={`px-2 py-0.5 text-[9px] font-black uppercase tracking-wider rounded-full ${
                      isAdmin
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {user.role}
                  </span>
                  <span className="text-[10px] text-slate-400 truncate">{user.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="px-3 space-y-1">
            <span className="px-3 text-[10px] uppercase font-bold text-slate-400 tracking-wider block mb-2">
              Management Menu
            </span>

            {links.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.path);

              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => onClose && onClose()}
                  className={`flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                    active
                      ? isAdmin
                        ? 'bg-rose-50 text-rose-700 border border-rose-200/80 shadow-2xs'
                        : 'bg-amber-50 text-amber-800 border border-amber-200/80 shadow-2xs'
                      : item.highlight
                      ? 'text-indigo-600 hover:bg-indigo-50/80'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon
                      className={`w-4 h-4 ${
                        active
                          ? isAdmin
                            ? 'text-rose-600'
                            : 'text-amber-600'
                          : item.highlight
                          ? 'text-indigo-600'
                          : 'text-slate-400'
                      }`}
                    />
                    <span>{item.label}</span>
                  </div>

                  {item.badge && (
                    <span className="px-2 py-0.5 bg-white text-[9px] font-black uppercase text-slate-500 rounded-md border border-slate-200 shadow-2xs">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Bottom Footer & Logout */}
        <div className="p-4 border-t border-slate-100 space-y-2">
          <Link
            to="/"
            onClick={() => onClose && onClose()}
            className="flex items-center space-x-2 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <Home className="w-4 h-4 text-slate-400" />
            <span>Storefront Home</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200/80 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out ({user.role})</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
