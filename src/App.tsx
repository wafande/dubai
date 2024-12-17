import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import { YachtChartersPage } from './pages/YachtCharters';
import PrivateAviationPage from './pages/PrivateAviation';
import VehiclesPage from './pages/Vehicles';
import { ContactPage } from './pages/Contact';
import { BookingPage } from './pages/Booking';
import { BookingConfirmation } from './pages/BookingConfirmation';
import { AdminLayout } from './components/admin/AdminLayout';
import { AnalyticsDashboard } from './pages/admin/AnalyticsDashboard';
import { ServicesManagement } from './pages/admin/ServicesManagement';
import { TourManagement } from './pages/admin/TourManagementNew';
import { Settings } from './pages/admin/Settings';
import Login from './pages/auth/Login';
import { Signup } from './pages/auth/Signup';
import { ForgotPassword } from './pages/auth/ForgotPassword';
import { ResetPassword } from './pages/auth/ResetPassword';
import { FleetManagement } from './pages/admin/FleetManagement';
import { PaymentSettings } from './components/admin/PaymentSettings';
import { Reports } from './pages/admin/Reports';
import { UserManagement } from './pages/admin/UserManagement';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import { User } from './types';

function AuthProviderWithNavigation({ children }: { children: React.ReactNode }) {
  const navigate = useNavigate();

  const handleLoginSuccess = (user: User) => {
    if (user.role === 'admin') {
      navigate('/admin');
    } else {
      navigate('/');
    }
  };

  const handleLogoutSuccess = () => {
    navigate('/login');
  };

  return (
    <AuthProvider
      onLoginSuccess={handleLoginSuccess}
      onLogoutSuccess={handleLogoutSuccess}
    >
      {children}
    </AuthProvider>
  );
}

function App() {
  return (
    <Router>
      <AuthProviderWithNavigation>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/yacht-charters" element={<YachtChartersPage />} />
          <Route path="/private-aviation" element={<PrivateAviationPage />} />
          <Route path="/vehicles" element={<VehiclesPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/booking" element={<BookingPage />} />
          <Route path="/booking/confirmation" element={<BookingConfirmation />} />
          
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          
          {/* Admin Routes - Protected with admin role check */}
          <Route path="/admin" element={
            <ProtectedRoute requireAdmin={true}>
              <AdminLayout />
            </ProtectedRoute>
          }>
            <Route index element={<AnalyticsDashboard />} />
            <Route path="services" element={<ServicesManagement />} />
            <Route path="tours" element={<TourManagement />} />
            <Route path="fleet" element={<FleetManagement />} />
            <Route path="users" element={<UserManagement />} />
            <Route path="settings" element={<Settings />} />
            <Route path="payment-settings" element={<PaymentSettings />} />
            <Route path="reports" element={<Reports />} />
          </Route>

          <Route path="*" element={
            <div className="min-h-screen bg-black text-white flex items-center justify-center">
              <div className="text-center">
                <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
                <p className="text-gray-300 mb-8">The page you're looking for doesn't exist.</p>
                <a href="/" className="bg-white text-black px-6 py-2 rounded-lg hover:bg-opacity-90 transition-colors">
                  Return Home
                </a>
              </div>
            </div>
          } />
        </Routes>
      </AuthProviderWithNavigation>
    </Router>
  );
}

export default App;