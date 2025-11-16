import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "../api/axios";
import MenuItemCard from "../components/MenuItemCard";
import { toast } from "react-toastify";
import { motion } from "framer-motion";

export default function OrderSummary() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState([]);
  const [status, setStatus] = useState("draft");
  const [loading, setLoading] = useState(true);
  const [menu, setMenu] = useState([]);
  const [showMenu, setShowMenu] = useState(false);
  const [phone, setPhone] = useState(""); // ✅ phone number

  // 🔹 Fetch order on load
  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const res = await axios.get("/orders");
        const active = res.data.find(
          (o) =>
            o.table === parseInt(id) &&
            ["submitted", "completed"].includes(o.status)
        );
        if (active) {
          alert(
            `🚫 Table ${id} already has an active order with status "${active.status}".`
          );
          navigate("/tables");
          return;
        }
        const draft = res.data.find(
          (o) => o.table === parseInt(id) && o.status === "draft"
        );
        if (draft) {
          setOrder(draft.items || []);
          setStatus(draft.status || "draft");
          setPhone(draft.phone || ""); // ✅ load phone if exists
        }
      } catch (err) {
        console.error("Error fetching order:", err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, navigate]);

  // 🔹 Fetch menu
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const res = await axios.get("/menu");
        setMenu(res.data);
      } catch (err) {
        console.error("Error loading menu:", err.message);
      }
    };
    fetchMenu();
  }, []);

  // 🔹 Save draft order (items + phone)
  const updateDraftOnServer = async (updatedOrder, phoneNumber = phone) => {
    try {
      await axios.post("/orders", {
        table: parseInt(id),
        items: updatedOrder,
        status: "draft",
        phone: phoneNumber,
      });
    } catch (err) {
      console.error("Failed to update draft:", err.message);
    }
  };

  // 🔹 Save phone instantly to draft
  const handlePhoneChange = (value) => {
    setPhone(value);
    updateDraftOnServer(order, value); // ✅ sync to backend
  };

  // 🔹 Item operations
  const handleAddItem = (item) => {
    const index = order.findIndex((i) => i._id === item._id);
    let updated;
    if (index > -1) {
      updated = [...order];
      updated[index].qty += 1;
    } else {
      updated = [
        ...order,
        {
          _id: item._id,
          name: item.name,
          price: item.price,
          image: item.image,
          qty: 1,
        },
      ];
    }
    setOrder(updated);
    updateDraftOnServer(updated);
  };

  const handleIncreaseQty = (index) => {
    const updated = [...order];
    updated[index].qty += 1;
    setOrder(updated);
    updateDraftOnServer(updated);
  };

  const handleDecreaseQty = (index) => {
    const updated = [...order];
    if (updated[index].qty > 1) {
      updated[index].qty -= 1;
    } else {
      updated.splice(index, 1);
    }
    setOrder(updated);
    updateDraftOnServer(updated);
  };

  const handleDeleteItem = (index) => {
    const updated = order.filter((_, i) => i !== index);
    setOrder(updated);
    updateDraftOnServer(updated);
  };

  // 🔹 Save final order
  const handleSaveOrder = async () => {
    if (!phone.trim()) {
      toast.error("📱 Please enter customer phone number before saving!");
      return;
    }

    // ✅ Validate Indian phone (10 digits, starts with 6-9)
    const phoneRegex = /^[6-9]\d{9}$/;
    if (!phoneRegex.test(phone)) {
      toast.error("⚠️ Enter a valid 10-digit Indian phone number");
      return;
    }

    try {
      const res = await axios.get("/orders");
      const activeOrder = res.data.find(
        (o) =>
          o.table === parseInt(id) &&
          ["submitted", "completed"].includes(o.status)
      );
      if (activeOrder) {
        alert(
          `🚫 Table ${id} already has an active order with status "${activeOrder.status}".`
        );
        return;
      }
      await axios.post("/orders", {
        table: parseInt(id),
        items: order,
        status: "saved",
        phone, // ✅ save phone in final order
      });
      toast.success(`✅ Order saved for Table ${id}`);
      setStatus("saved");
      setOrder([]);
      setShowMenu(false);
    } catch (err) {
      toast.error("❌ Failed to save order");
    }
  };

  const total = order.reduce((sum, item) => sum + item.price * item.qty, 0);

  if (loading) return <p className="p-4 text-center">Loading...</p>;

  return (
    <div className="p-4 max-w-3xl mx-auto bg-gradient-to-br from-blue-500 via-white to-pink-500 rounded-xl shadow-lg">
      <h2 className="text-4xl font-extrabold mb-6 text-center text-blue-800">
        🧾 Order Summary - Table {id}
      </h2>

      {status === "saved" ? (
        <div className="text-green-700 bg-green-100 p-3 rounded-xl text-center font-semibold shadow">
          ✅ Order Saved – Locked and Completed
        </div>
      ) : order.length === 0 ? (
        <p className="text-red-600 text-center text-lg font-semibold bg-red-50 py-3 rounded-xl">
          🚫 No items in order.
        </p>
      ) : (
        <>
          <ul className="space-y-4 mb-6">
            {order.map((item, index) => (
              <motion.li
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="flex justify-between items-center bg-green-50 p-4 rounded-xl shadow-md hover:shadow-xl transition duration-200"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-16 h-16 object-cover rounded-md border border-gray-300"
                    onError={(e) =>
                      (e.target.src = "https://via.placeholder.com/64")
                    }
                  />
                  <div>
                    <p className="font-semibold text-lg text-gray-800">
                      {item.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      ₹{item.price} × {item.qty} = ₹{item.price * item.qty}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => handleDecreaseQty(index)}
                    className="bg-yellow-100 hover:bg-yellow-200 px-3 py-1 rounded text-lg font-bold text-yellow-800"
                  >
                    -
                  </button>
                  <span className="font-medium text-md text-gray-700">
                    {item.qty}
                  </span>
                  <button
                    onClick={() => handleIncreaseQty(index)}
                    className="bg-green-100 hover:bg-green-200 px-3 py-1 rounded text-lg font-bold text-green-800"
                  >
                    +
                  </button>
                  <button
                    onClick={() => handleDeleteItem(index)}
                    className="text-red-600 hover:text-red-800 text-xl"
                  >
                    ❌
                  </button>
                </div>
              </motion.li>
            ))}
          </ul>

          <div className="text-right font-bold text-2xl mb-6 text-gray-700">
            🧮 Total: ₹{total}
          </div>

          {/* ✅ Phone input synced with backend */}
          {status === "draft" && (
            <div className="mb-6">
              <label className="block text-gray-800 font-semibold mb-2">
                📱 Customer Phone Number
              </label>
             <input
              type="tel"
              value={phone}
              onChange={(e) => {
           // allow only digits, max 10
          const val = e.target.value.replace(/\D/g, "").slice(0, 10);
           handlePhoneChange(val);
           }}
           placeholder="Enter Mobile number"
           maxLength={10} // prevents typing more
           className="w-full border-2 border-gray-300 rounded-xl px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-400 transition shadow-sm"
            />

              <p className="text-sm text-gray-500 mt-1">
                (Required – must be 10-digit Indian number)
              </p>
            </div>
          )}

          <button
            onClick={handleSaveOrder}
            className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-3 rounded-xl font-semibold shadow-md transition"
          >
            💾 Save Order
          </button>
        </>
      )}

      {status === "draft" && (
        <>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="my-6 w-full bg-blue-100 hover:bg-blue-200 text-blue-800 py-2 rounded-xl font-semibold shadow transition"
          >
            {showMenu ? "⬆ Hide Menu" : "➕ Add More Items"}
          </button>

          {showMenu && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {menu.map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <MenuItemCard item={item} onAdd={handleAddItem} />
                </motion.div>
              ))}
            </div>
          )}
        </>
      )}

      <button
        onClick={() => navigate(`/menu/${id}`)}
        className="mt-8 w-full text-blue-600 hover:bg-blue-100 border border-blue-600 py-2 rounded-xl font-semibold transition"
      >
        ⬅ Back to Menu
      </button>
    </div>
  );
}
