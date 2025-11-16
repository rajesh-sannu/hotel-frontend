import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import AdminPanel from "./pages/AdminPanel";
import TablesPage from "./pages/TablesPage";
import OrderSummary from "./pages/OrderSummary";
import MenuPage from "./pages/MenuPage"; // ✅ With table id
import PrivateRoute from "./components/PrivateRoute";
import AdminMenuPage from "./pages/AdminMenuPage";
import BillingHistory from "./pages/BillingHistory";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import AdminAnalytics from "./pages/AdminAnalytics";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import AdminLogins from "./pages/AdminLogins";

function App() {
  return (
    <>
      <Routes>
        {/* ✅ Login + Auth */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password" element={<ResetPasswordPage />} />

        {/* ✅ Redirect old `/admin/login` to `/login` */}
        <Route path="/admin/login" element={<Navigate to="/login" />} />

        {/* ✅ Optional: redirect root to /login */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* ✅ Admin Routes */}
        <Route
          path="/admin"
          element={
            <PrivateRoute role="admin">
              <AdminPanel />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/menu"
          element={
            <PrivateRoute role="admin">
              <AdminMenuPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/billing-history"
          element={
            <PrivateRoute role="admin">
              <BillingHistory />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/analytics"
          element={
            <PrivateRoute role="admin">
              <AdminAnalytics />
            </PrivateRoute>
          }
        />

        {/* ✅ NEW: Logins Page */}
        <Route
          path="/admin/logins"
          element={
            <PrivateRoute role="admin">
              <AdminLogins />
            </PrivateRoute>
          }
        />

        {/* ✅ Waiter Routes */}
        <Route
          path="/tables"
          element={
            <PrivateRoute role="waiter">
              <TablesPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/menu/:id"
          element={
            <PrivateRoute role="waiter">
              <MenuPage />
            </PrivateRoute>
          }
        />
        <Route
          path="/table/:id"
          element={
            <PrivateRoute role="waiter">
              <OrderSummary />
            </PrivateRoute>
          }
        />

        {/* ✅ Optional: catch-all route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>

      <ToastContainer position="top-right" autoClose={3000} />
    </>
  );
}

export default App;
