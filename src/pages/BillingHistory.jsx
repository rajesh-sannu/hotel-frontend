import { useEffect, useState } from "react";
import axios from "../api/axios";
import { useNavigate } from "react-router-dom";
import SendBillModal from "../components/SendBillModal";
import ResetConfirmModal from "../components/ResetConfirmModal";
import jsPDF from "jspdf";

export default function BillingHistory() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showSend, setShowSend] = useState(false);
  const [selectedBill, setSelectedBill] = useState(null);
  const [showResetModal, setShowResetModal] = useState(false);
  const [toast, setToast] = useState(null);
  const [filterText, setFilterText] = useState("");
  const [sortOrder, setSortOrder] = useState("newest");
  const [specificDate, setSpecificDate] = useState("");

  const navigate = useNavigate();

  const showToast = (msg, color = "bg-green-600") => {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  };

  const fetchAllOrders = async () => {
    try {
      const res = await axios.get("/orders");
      const filtered = res.data
        .filter(
          (order) => order.status === "finalized" || order.status === "deleted"
        )
        .filter((order) => {
          // 📅 Filter by specific date
          if (!specificDate) return true;
          const orderDate = new Date(order.createdAt)
            .toISOString()
            .slice(0, 10); // YYYY-MM-DD
          return orderDate === specificDate;
        })
        .filter((order) =>
          order.table.toString().includes(filterText.trim())
        )
        .sort((a, b) =>
          sortOrder === "newest"
            ? new Date(b.createdAt) - new Date(a.createdAt)
            : new Date(a.createdAt) - new Date(b.createdAt)
        );

      setOrders(filtered);
    } catch (err) {
      console.error("❌ Failed to fetch billing history:", err.message);
      showToast("Failed to load billing history", "bg-red-600");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllOrders();
  }, [filterText, sortOrder, specificDate]);

  const handleDeleteAllHistory = async () => {
    try {
      await axios.delete("/orders/history");
      fetchAllOrders();
      showToast("✅ Billing history deleted successfully");
    } catch (err) {
      console.error("❌ Failed to delete billing history:", err.message);
      showToast("Failed to delete history", "bg-red-600");
    }
  };

  const generateBillText = (order) => {
    let text = `🏪 * RS Daba Restaurant*\n🧾 *Bill Summary* – Table ${order.table}\n\n`;
    order.items.forEach((item) => {
      text += `🍽 ${item.name} × ${item.qty} = ₹${item.price * item.qty}\n`;
    });
    text += `\n💰 *Total:* ₹${order.total}`;
    if (order.discount > 0) text += `\n🎁 Discount: ${order.discount}%`;
    text += `\n🟩 *Net Total:* ₹${order.netTotal}`;
    text += `\n\n🕒 ${new Date(order.createdAt).toLocaleString()}`;
    text += `\n🙏 Laughter is brightest 😊where food is best😋!`;
    return text;
  };

  const handleSendWhatsApp = (order) => {
    setSelectedBill(generateBillText(order));
    setShowSend(true);
  };

  const handlePrintBill = (order) => {
    const doc = new jsPDF();
    doc.text(generateBillText(order), 10, 10);
    doc.save(`bill_table_${order.table}.pdf`);
  };

  const handleResetAll = () => {
    setShowResetModal(true);
  };

  const handleVerifyAndDelete = async (password) => {
    try {
      const res = await axios.post("/orders/verify-reset", { password });
      if (res.data.success) {
        await handleDeleteAllHistory();
      } else {
        showToast("❌ Incorrect password", "bg-red-600");
      }
    } catch (err) {
      console.error(err);
      showToast("Server error", "bg-red-600");
    } finally {
      setShowResetModal(false);
    }
  };

  if (loading) return <p className="p-6 text-center text-lg">⏳ Loading billing history...</p>;

  return (
    <div className="p-4 max-w-5xl mx-auto relative">
      {toast && (
        <div className={`fixed top-4 right-4 text-white px-4 py-2 rounded shadow-lg z-50 transition-all duration-300 ${toast.color}`}>
          {toast.msg}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
        <button
          onClick={handleResetAll}
          className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition"
        >
          🔄 Reset All
        </button>

        <h1 className="text-3xl font-extrabold text-center">📟 Billing History</h1>

        <div className="flex gap-2">
          <button
            onClick={() => navigate("/admin")}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
          >
            🔙 Admin Panel
          </button>
          <button
            onClick={handleDeleteAllHistory}
            className="bg-red-700 text-white px-4 py-2 rounded-lg hover:bg-red-800 transition"
          >
            🗑 Delete All
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <input
          type="text"
          placeholder="🔍 Search by Table Number"
          className="border border-gray-300 rounded-lg px-3 py-2 w-full md:w-1/3"
          value={filterText}
          onChange={(e) => setFilterText(e.target.value)}
        />
        <select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value)}
          className="border border-gray-300 rounded-lg px-3 py-2 w-full md:w-1/4"
        >
          <option value="newest">🆕 Newest First</option>
          <option value="oldest">📜 Oldest First</option>
        </select>
        <input
          type="date"
          className="border border-gray-300 rounded-lg px-3 py-2 w-full md:w-1/4"
          value={specificDate}
          onChange={(e) => setSpecificDate(e.target.value)}
        />
        {specificDate && (
          <button
            onClick={() => setSpecificDate("")}
            className="bg-gray-200 hover:bg-gray-300 px-3 py-2 rounded w-full md:w-auto"
          >
            ❌ Clear Date
          </button>
        )}
      </div>

      {/* Order List */}
      {orders.length === 0 ? (
        <p className="text-gray-500 text-center mt-10">📭 No billing history found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {orders.map((order) => (
            <div
              key={order._id}
     className="bg-pink-50 border border-pink-700 rounded-xl shadow-md p-5 space-y-3 transition-all hover:shadow-lg hover:bg-pink-100"


            >
              <h2 className="text-lg font-bold text-blue-700">🪑 Table {order.table}</h2>

              <ul className="text-sm space-y-1">
                {order.items.map((item, idx) => (
                  <li key={idx}>
                    {item.name} - ₹{item.price} × {item.qty} = ₹{item.price * item.qty}
                  </li>
                ))}
              </ul>

              <div className="text-sm">
                <p>💰 Total: ₹{order.total}</p>
                {order.discount > 0 && <p>🎁 Discount: {order.discount}%</p>}
                <p className="font-semibold text-green-700">🟩 Net Total: ₹{order.netTotal}</p>
              </div>

              <p className="text-xs text-gray-500">
                🕒 {new Date(order.createdAt).toLocaleString()}
              </p>

              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => handleSendWhatsApp(order)}
                  className="bg-green-600 text-white px-4 py-1.5 rounded hover:bg-green-700 transition"
                >
                  📤 Send WhatsApp
                </button>
                <button
                  onClick={() => handlePrintBill(order)}
                  className="bg-yellow-500 text-white px-4 py-1.5 rounded hover:bg-yellow-600 transition"
                >
                  📄 Print
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      {showSend && (
        <SendBillModal billText={selectedBill} onClose={() => setShowSend(false)} />
      )}
      {showResetModal && (
        <ResetConfirmModal
          onConfirm={handleVerifyAndDelete}
          onClose={() => setShowResetModal(false)}
        />
      )}
    </div>
  );
}
