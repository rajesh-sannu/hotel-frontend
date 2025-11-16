import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import axios from "../api/axios";

export default function MenuPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState([]);
  const [menuItems, setMenuItems] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMenuAndOrder = async () => {
      try {
        const [menuRes, ordersRes] = await Promise.all([
          axios.get("/menu"),
          axios.get("/orders"),
        ]);

        setMenuItems(menuRes.data);

        const existingOrder = ordersRes.data.find(
          (o) => o.table === parseInt(id) && o.status === "draft"
        );

        if (existingOrder) {
          setOrder(existingOrder.items);
        }
      } catch (err) {
        console.error("❌ Failed to fetch menu or draft order:", err.message);
      }
    };

    fetchMenuAndOrder();
  }, [id]);

  const handleAdd = (item) => {
    const index = order.findIndex((i) => i._id === item._id);
    if (index > -1) {
      const updated = [...order];
      updated[index].qty += 1;
      setOrder(updated);
    } else {
      setOrder([...order, { ...item, qty: 1 }]);
    }
  };

  const goToSummary = async () => {
    if (order.length === 0) return;
    setLoading(true);

    try {
      const res = await axios.get("/orders");
      const existingOrder = res.data.find(
        (o) => o.table === parseInt(id) && o.status === "draft"
      );

      if (existingOrder) {
        await axios.put(`/orders/${existingOrder._id}`, {
          table: parseInt(id),
          items: order,
          status: "draft",
        });
      } else {
        await axios.post("/orders", {
          table: parseInt(id),
          items: order,
          status: "draft",
        });
      }

      navigate(`/table/${id}`);
    } catch (err) {
      console.error("❌ Error saving order:", err.message);
      if (err.response && err.response.status === 400) {
        alert(err.response.data.message);
      } else {
        alert("Something went wrong while saving the order.");
      }
    } finally {
      setLoading(false);
    }
  };

  const goToTables = () => {
    navigate("/tables");
  };

  return (
    <div className="p-4 md:p-8 bg-blue-500 min-h-screen">
      <h2 className="text-2xl font-bold text-blue-700 mb-6 text-center">
        🍽️ Menu - Table {id}
      </h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-10">
        {menuItems.map((item) => {
          const inOrder = order.find((o) => o._id === item._id);
          const isOutOfStock = item.stock === 0;

          return (
            <div
              key={item._id}
             className="bg-yellow-200 rounded-2xl p-5 shadow-md hover:shadow-xl transition-shadow duration-300 flex gap-4 items-center"

            >
              <img
                src={item.image}
                alt={item.name}
                className="w-24 h-24 object-cover rounded-xl border border-gray-200"
              />
              <div className="flex-1">
                <h3
                  className={`text-lg font-semibold mb-1 ${
                    isOutOfStock ? "text-red-600" : "text-green-700"
                  }`}
                >
                  {item.name}
                </h3>
                <p className="text-gray-600 mb-1">₹{item.price}</p>
                <p className="text-sm mb-3">
                  {isOutOfStock ? (
                    <span className="text-red-500 font-medium">
                      Out of Stock
                    </span>
                  ) : (
                    <span className="text-green-600">In Stock</span>
                  )}
                </p>

                <button
                  onClick={() => handleAdd(item)}
                  disabled={isOutOfStock}
                  className={`px-4 py-1.5 text-sm rounded-full font-medium shadow-sm transition-all duration-200 ${
                    isOutOfStock
                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  ➕ Add
                </button>

                {inOrder && (
                  <span className="ml-4 text-sm text-blue-700 font-semibold">
                    Qty: {inOrder.qty}
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Buttons */}
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          onClick={goToTables}
          className="flex-1 bg-white border border-gray-300 hover:bg-gray-100 text-gray-800 py-2 text-sm rounded-xl font-semibold transition duration-200"
        >
          ⬅ Back to Tables
        </button>

        <button
          onClick={goToSummary}
          disabled={loading}
          className={`flex-1 py-2 text-sm rounded-xl font-semibold transition duration-200 ${
            loading
              ? "bg-gray-400 text-white cursor-not-allowed"
              : "bg-green-600 text-white hover:bg-green-700"
          }`}
        >
          {loading ? "Saving..." : "➡️ Next"}
        </button>
      </div>
    </div>
  );
}
