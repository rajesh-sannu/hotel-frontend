// src/components/PrivateRoute.jsx
import { Navigate } from "react-router-dom";

export default function PrivateRoute({ children, role }) {
  const userRole = localStorage.getItem("role");
  if (userRole === role) return children;
  return <Navigate to="/" />;
}
