import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext.jsx";
import Layout from "./components/Layout.jsx";
import Login from "./pages/Login.jsx"; import Signup from "./pages/Signup.jsx"; import ForgotPassword from "./pages/ForgotPassword.jsx";
import AnalystOverview from "./pages/AnalystOverview.jsx"; import DataValidation from "./pages/DataValidation.jsx";
import ValidationHistory from "./pages/ValidationHistory.jsx"; import Reports from "./pages/Reports.jsx";
import Settings from "./pages/Settings.jsx"; import Help from "./pages/Help.jsx";
import AdminOverview from "./pages/AdminOverview.jsx"; import RuleLibrary from "./pages/RuleLibrary.jsx"; import UserManagement from "./pages/UserManagement.jsx";
function Guard({ role, children }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" />;
  if (user.role !== role) return <Navigate to={user.role === "admin" ? "/admin" : "/analyst"} />;
  return <Layout>{children}</Layout>;
}
export default function App() {
  const { user } = useAuth();
  const home = user ? (user.role === "admin" ? "/admin" : "/analyst") : "/login";
  const A = (el) => <Guard role="analyst">{el}</Guard>, D = (el) => <Guard role="admin">{el}</Guard>;
  return (
    <Routes>
      <Route path="/login" element={<Login />} /><Route path="/signup" element={<Signup />} /><Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/analyst" element={A(<AnalystOverview />)} /><Route path="/analyst/validation" element={A(<DataValidation />)} />
      <Route path="/analyst/history" element={A(<ValidationHistory />)} /><Route path="/analyst/reports" element={A(<Reports />)} />
      <Route path="/analyst/settings" element={A(<Settings />)} /><Route path="/analyst/help" element={A(<Help />)} />
      <Route path="/admin" element={D(<AdminOverview />)} /><Route path="/admin/rules" element={D(<RuleLibrary />)} />
      <Route path="/admin/users" element={D(<UserManagement />)} /><Route path="/admin/settings" element={D(<Settings />)} />
      <Route path="*" element={<Navigate to={home} />} />
    </Routes>
  );
}
