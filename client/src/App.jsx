import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import Navbar from './components/Navbar';
import ProtectedRoute from './components/ProtectedRoute';

// Pages still using legacy layout
import AdminDashboard from './pages/AdminDashboard';
import SellerProfile from './pages/SellerProfile';

// Stitch UI Pages (standalone, own navbar/footer)
import Register from './pages/Register';
import Login from './pages/Login';
import VerifyEmail from './pages/VerifyEmail';
import ItemListing from './pages/ItemListing';

// New Stitch UI Pages (own navbar/footer built-in)
import MarketplaceGrid from './pages/MarketplaceGrid';
import LandingPage from './pages/LandingPage';
import ProductDetailPage from './pages/ProductDetailPage';
import BuyPage from './pages/BuyPage';
import OrderSuccessPage from './pages/OrderSuccessPage';
import CartPage from './pages/CartPage';
import CashfreeCheckout from './pages/CashfreeCheckout';
import OfflinePaymentPage from './pages/OfflinePaymentPage';
import TermsConditions from './pages/policies/TermsConditions';
import PrivacyPolicy from './pages/policies/PrivacyPolicy';
import RefundCancellation from './pages/policies/RefundCancellation';
import ShippingDelivery from './pages/policies/ShippingDelivery';
import ContactUs from './pages/policies/ContactUs';


// Layout wrapper for the legacy UI (old Navbar + footer)
const LegacyLayout = () => (
  <div className="min-h-screen flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-900 text-gray-900">
    <Navbar />
    <Outlet />
    <footer className="w-full text-center py-8 text-sm font-medium text-gray-400">
      &copy; {new Date().getFullYear()} STUDTRADE. Verified student marketplace.
    </footer>
    <Toaster position="bottom-right" />
  </div>
);

function App() {
  return (
    <Routes>
      {/* ── New Stitch UI (standalone, no legacy wrapper) ── */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/marketplace" element={<MarketplaceGrid />} />
      <Route path="/item/:id" element={<ProductDetailPage />} />
      <Route path="/buy" element={<BuyPage />} />
      <Route path="/success" element={<OrderSuccessPage />} />
      <Route path="/terms-conditions" element={<TermsConditions />} />
      <Route path="/privacy-policy" element={<PrivacyPolicy />} />
      <Route path="/refund-cancellation" element={<RefundCancellation />} />
      <Route path="/shipping-delivery" element={<ShippingDelivery />} />
      <Route path="/contact-us" element={<ContactUs />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/verify-email" element={<VerifyEmail />} />
      <Route path="/checkout/:productId" element={<ProtectedRoute><CashfreeCheckout /></ProtectedRoute>} />
      <Route path="/offline-pay/:productId" element={<ProtectedRoute><OfflinePaymentPage /></ProtectedRoute>} />
      <Route path="/cart" element={<ProtectedRoute><CartPage /></ProtectedRoute>} />
      <Route path="/sell" element={<ProtectedRoute><ItemListing /></ProtectedRoute>} />
      <Route path="/admin" element={<ProtectedRoute requiredRole={['admin', 'manager']}><AdminDashboard /></ProtectedRoute>} />

      {/* ── Legacy UI (wrapped with old Navbar) ── */}
      <Route element={<LegacyLayout />}>
        <Route path="/seller/:id" element={<SellerProfile />} />
      </Route>
    </Routes>
  );
}

export default App;

