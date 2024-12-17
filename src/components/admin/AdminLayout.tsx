import { useState } from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BarChart2,
  Users,
  Map,
  FileText,
  Settings,
  Menu,
  X,
  Package,
  Plane,
  DollarSign,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export function AdminLayout() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user } = useAuth();
  const location = useLocation();

  if (!user || user.role !== 'admin') {
    return <Navigate to="/login" replace />;
  }

  const navigation = [
    { name: 'Analytics', href: '/admin', icon: BarChart2 },
    { name: 'Services', href: '/admin/services', icon: Package },
    { name: 'Tour Management', href: '/admin/tours', icon: Map },
    { name: 'Fleet Management', href: '/admin/fleet', icon: Plane },
    { name: 'User Management', href: '/admin/users', icon: Users },
    { name: 'Reports', href: '/admin/reports', icon: FileText },
    { name: 'Settings', href: '/admin/settings', icon: Settings },
    { name: 'Payment Settings', icon: DollarSign, href: '/admin/payment-settings' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Sidebar */}
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-200 ease-in-out ${
          isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
        <div className="flex items-center justify-between h-16 px-4 border-b">
          <Link to="/admin" className="text-xl font-bold text-gray-900">
            Admin Panel
          </Link>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <X className="h-6 w-6" />
          </button>
        </div>
        <nav className="mt-5 px-2 space-y-1">
          {navigation.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.href;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={`group flex items-center px-2 py-2 text-base font-medium rounded-md ${
                  isActive
                    ? 'bg-amber-50 text-amber-600'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon
                  className={`mr-4 h-6 w-6 ${
                    isActive ? 'text-amber-600' : 'text-gray-400 group-hover:text-gray-500'
                  }`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Mobile sidebar toggle */}
      <div className="lg:hidden fixed top-0 left-0 z-50 p-4">
        <button
          onClick={() => setIsSidebarOpen(true)}
          className={`p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 ${
            isSidebarOpen ? 'hidden' : 'block'
          }`}
        >
          <Menu className="h-6 w-6" />
        </button>
      </div>

      {/* Main content */}
      <div
        className={`lg:pl-64 flex flex-col min-h-screen ${
          isSidebarOpen ? 'lg:pl-64' : 'lg:pl-0'
        }`}
      >
        <main className="flex-1 py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <Outlet />
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}