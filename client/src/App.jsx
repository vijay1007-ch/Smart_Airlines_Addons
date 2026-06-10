import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import MockEmail from './pages/MockEmail';
import ResetPassword from './pages/ResetPassword';
import Catalogue from './pages/Catalogue';
import Bundles from './pages/Bundles';
import Cart from './pages/Cart';
import Payment from './pages/Payment';
import History from './pages/History';
import ApprovePayment from './pages/ApprovePayment';
import AdminDashboard from './pages/AdminDashboard';
import AdminCatalogue from './pages/AdminCatalogue';
import AdminBundles from './pages/AdminBundles';
import AdminUsers from './pages/AdminUsers';
import UserDashboard from './pages/UserDashboard';
import Travelled from './pages/Travelled';
import Profile from './pages/Profile';
import EditProfile from './pages/EditProfile';
import AdminReports from './pages/AdminReports';
import AdminSeatUpgrades from './pages/AdminSeatUpgrades';
import SeatUpgrade from './pages/SeatUpgrade';
import ShuuPass from './pages/ShuuPass';
import SkyPoints from './pages/SkyPoints';
import Support from './pages/Support';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/mock-email" element={<MockEmail />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/travelled" element={<Travelled />} />
        <Route path="/catalogue" element={<Catalogue />} />
        <Route path="/bundles" element={<Bundles />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/payment" element={<Payment />} />
        <Route path="/history" element={<History />} />
        <Route path="/seat-upgrade" element={<SeatUpgrade />} />
        <Route path="/shuu-pass" element={<ShuuPass />} />
        <Route path="/skypoints" element={<SkyPoints />} />
        <Route path="/support" element={<Support />} />
        <Route path="/approve/:orderId" element={<ApprovePayment />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/catalogue" element={<AdminCatalogue />} />
        <Route path="/admin/bundles" element={<AdminBundles />} />
        <Route path="/admin/users" element={<AdminUsers />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/edit-profile" element={<EditProfile />} />
        <Route path="/admin/reports" element={<AdminReports />} />
        <Route path="/admin/upgrades" element={<AdminSeatUpgrades />} />
      </Routes>
    </Router>
  );
}

export default App;
