import { useState } from "react";
import { motion } from "framer-motion";
import axios from "../api/axios";

export default function OrderCard({ order, onDelete }) {
  const [items, setItems] = useState(order.items);
  const [discountPercent, setDiscountPercent] = useState(order.discount || 0);
  const [phone, setPhone] = useState(order.phone || ""); // ✅ add phone state
  const [editing, setEditing] = useState(false);

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] =
      field === "qty" || field === "price" ? parseInt(value) : value;
    setItems(newItems);
  };

  const handleSave = async () => {
    try {
      await axios.put(`/orders/${order._id}`, {
        items,
        discount: discountPercent,
        phone, // ✅ save phone number
      });
      setEditing(false);
    } catch (err) {
      console.error("❌ Error saving order:", err.message);
    }
  };

  const calculateTotal = () => {
    return items.reduce((sum, item) => sum + item.price * item.qty, 0);
  };

  const netTotal = () => {
    const total = calculateTotal();
    return Math.round(total - total * (discountPercent / 100));
  };

  const isFinalized = order.status === "finalized";
  const isDeleted = order.status === "deleted";

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="bg-pink-50 border border-pink-200 p-4 rounded-xl shadow-md space-y-2 relative transition-all duration-300 hover:shadow-lg hover:bg-pink-100"
    >
      {/* ===== Header Section ===== */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="font-bold text-xl text-pink-700">
            🪑 Table {order.table}
          </h3>

          {/* ✅ Show or Edit Phone Number */}
          {editing ? (
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Customer Phone"
              className="border rounded px-2 py-1 mt-1 text-sm"
            />
          ) : (
            order.phone && (
              <p
          className="text-sm text-gray-600 cursor-pointer select-text"
          onClick={() => {
          navigator.clipboard.writeText(order.phone);
         alert("📞 Phone number copied: " + order.phone);
          }}
         >
        📞 {order.phone}
         </p>

            )
          )}
        </div>

        <span
          className={`text-xs px-2 py-1 rounded-full font-semibold ${
            isFinalized
              ? "bg-green-100 text-green-700"
              : isDeleted
              ? "bg-red-100 text-red-700"
              : "bg-yellow-100 text-yellow-700"
          }`}
        >
          {order.status.toUpperCase()}
        </span>
      </div>

      {/* ===== Items List ===== */}
      <ul className="text-sm space-y-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center gap-4">
            <img
              src={item.image || "https://via.placeholder.com/56"}
              alt={item.name}
              className="w-14 h-14 object-cover rounded"
              onError={(e) => (e.target.src = "https://via.placeholder.com/56")}
            />

            {editing ? (
              <div className="flex flex-wrap gap-2 items-center">
                <input
                  value={item.name}
                  onChange={(e) =>
                    handleItemChange(index, "name", e.target.value)
                  }
                  className="border rounded px-2 py-1 w-32"
                />
                <input
                  type="number"
                  value={item.price}
                  onChange={(e) =>
                    handleItemChange(index, "price", e.target.value)
                  }
                  className="border rounded px-2 py-1 w-20"
                />
                <input
                  type="number"
                  value={item.qty}
                  onChange={(e) =>
                    handleItemChange(index, "qty", e.target.value)
                  }
                  className="border rounded px-2 py-1 w-16"
                />
              </div>
            ) : (
              <div>
                <span className="font-medium text-pink-800">{item.name}</span>
                <div className="text-gray-600">
                  ₹{item.price} × {item.qty} = ₹{item.price * item.qty}
                </div>
              </div>
            )}
          </li>
        ))}
      </ul>

      {/* ===== Totals ===== */}
      <div className="text-right font-semibold text-pink-700">
        Total: ₹{calculateTotal()}
      </div>

      {editing && (
        <div className="flex justify-between items-center pt-2">
          <div className="flex gap-2 items-center">
            <label className="font-semibold">Discount</label>
            <select
              value={discountPercent}
              onChange={(e) => setDiscountPercent(parseInt(e.target.value))}
              className="border rounded px-2 py-1"
            >
              <option value={0}>None</option>
              <option value={10}>10%</option>
              <option value={20}>20%</option>
              <option value={30}>30%</option>
              <option value={40}>40%</option>
              <option value={50}>50%</option>
            </select>
          </div>
          <div className="text-right font-bold text-green-700">
            Net Total: ₹{netTotal()}
          </div>
        </div>
      )}

      {/* ===== Action Buttons ===== */}
      <div className="flex justify-end gap-2 pt-2 flex-wrap">
        {editing ? (
          <>
            <button
              onClick={handleSave}
              className="bg-yellow-600 text-white px-3 py-1 rounded"
            >
              💾 Save
            </button>
            <button
              onClick={() => setEditing(false)}
              className="bg-gray-400 text-white px-3 py-1 rounded"
            >
              ✖️ Cancel
            </button>
          </>
        ) : (
          <>
            {!isFinalized && !isDeleted && (
              <>
                <button
                  onClick={() => setEditing(true)}
                  className="bg-blue-600 text-white px-3 py-1 rounded"
                >
                  ✏️ Edit
                </button>
                <button
                  onClick={() => onDelete(order._id)}
                  className="bg-red-600 text-white px-3 py-1 rounded"
                >
                  ❌ Delete
                </button>
                <button
                  onClick={async () => {
                    const discount = discountPercent;
                    const total = calculateTotal();
                    const net = netTotal();
                    try {
                      await axios.put(`/orders/${order._id}`, {
                        items,
                        discount,
                        total,
                        netTotal: net,
                        phone, // ✅ include phone when finalizing
                        status: "finalized",
                      });
                      alert("✅ Order finalized!");
                      window.location.reload();
                    } catch (err) {
                      console.error("❌ Finalize failed:", err.message);
                    }
                  }}
                  className="bg-green-600 text-white px-3 py-1 rounded"
                >
                  ✅ Finalize
                </button>
              </>
            )}
          </>
        )}
      </div>
    </motion.div>
  );
}
