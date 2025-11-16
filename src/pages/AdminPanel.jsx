// src/pages/AdminPanel.jsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";
import OrderCard from "../components/OrderCard";


export default function AdminPanel() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchOrders = async () => {
    try {
      const res = await axios.get("/orders");
      const filtered = res.data.filter(
        (order) => order.status !== "finalized" && order.status !== "deleted"
      );
      setOrders(filtered);
    } catch (err) {
      console.error("Error fetching orders:", err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleFinalize = async (id) => {
    try {
      await axios.put(`/orders/${id}`, { status: "finalized" });
      fetchOrders();
    } catch (err) {
      console.error("Error finalizing:", err.message);
    }
  };

  const handleDelete = async (id) => {
    try {
      await axios.put(`/orders/${id}`, { status: "deleted" });
      fetchOrders();
    } catch (err) {
      console.error("Error deleting:", err.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("adminToken");
    navigate("/admin/login");
  };

  useEffect(() => {   useEffect 
    fetchOrders();
  }, []);

  if (loading) return <p className="p-4 text-lg font-medium">Loading orders...</p>;

  return (
    <div className="min-h-screen bg-gray-100 p-4">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-2 md:gap-4 mb-6">
        <h1 className="text-2xl font-bold text-gray-800">📋 Admin Panel - All Orders</h1>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => navigate("/admin/menu")}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
          >
            🍽 Manage Menu
          </button>

          <button
            onClick={() => navigate("/admin/billing-history")}
            className="bg-gray-700 text-white px-4 py-2 rounded-md hover:bg-gray-800 transition"
          >
            🧾 View Order History
          </button>
           {/* ✅ New button for all login activities */}
  <button
    onClick={() => navigate("/admin/logins")}
    className="bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700 transition"
  >
    📑 All Logins
  </button>

          <button
            onClick={() => navigate("/admin/analytics")}
            className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
          >
            📊 Show Analytics
          </button>
           
          <button
            onClick={handleLogout}
            className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition"
          >
            🔒 Logout
          </button>
        </div>
      </div>

      {/* Orders Section */}
      {orders.length === 0 ? (
        <p className="text-red-600 font-medium text-center">No active orders found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {orders.map((order) => (
            <OrderCard
              key={order._id}
              order={order}
              onFinalize={handleFinalize}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
