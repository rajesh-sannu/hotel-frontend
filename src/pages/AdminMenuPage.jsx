import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axios";

export default function AdminMenuPage() {
  const [menu, setMenu] = useState([]);
  const [filteredMenu, setFilteredMenu] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [stock, setStock] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [editingStocks, setEditingStocks] = useState({});

  const navigate = useNavigate();

  const fetchMenu = async () => {
    try {
      const res = await axios.get("/menu");
      setMenu(res.data);
      setFilteredMenu(res.data);
    } catch (err) {
      console.error("❌ Fetch failed:", err.message);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  useEffect(() => {
    const filtered = menu.filter((item) =>
      item.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredMenu(filtered);
  }, [searchQuery, menu]);

  const handleAdd = async () => {
    if (!name || !price || !image || stock === "") {
      return alert("All fields required!");
    }

    const formData = new FormData();
    formData.append("name", name);
    formData.append("price", price);
    formData.append("stock", stock);
    formData.append("image", image);

    try {
      const response = await axios.post("/menu", formData);
      console.log("✅ Upload Response:", response.data);
      setName("");
      setPrice("");
      setStock("");
      setImage(null);
      setPreview(null);
      fetchMenu();
    } catch (err) {
      console.error("❌ Add failed:", err.response?.data || err.message);
      alert("Upload failed: " + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await axios.delete(`/menu/${id}`);
      fetchMenu();
    } catch (err) {
      console.error("❌ Delete failed:", err.message);
    }
  };

  const handleStockChange = (id, value) => {
    setEditingStocks((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleUpdateStock = async (id) => {
    const updatedStock = editingStocks[id];
    try {
      await axios.put(`/menu/${id}`, { stock: updatedStock });
      fetchMenu();
      setEditingStocks((prev) => {
        const updated = { ...prev };
        delete updated[id];
        return updated;
      });
    } catch (err) {
      console.error("❌ Update stock failed:", err.message);
      alert("Failed to update stock.");
    }
  };

  useEffect(() => {
    return () => {
      if (preview) URL.revokeObjectURL(preview);
    };
  }, [preview]);

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">🛠 Menu Management</h2>
        <button
          onClick={() => navigate("/admin")}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600"
        >
          ⬅️ Back to Dashboard
        </button>
      </div>

      {/* ➕ Add Item Form */}
      <div className="mb-6 flex flex-col gap-3 bg-white p-4 rounded-lg shadow">
        <input
          type="text"
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="number"
          placeholder="Price"
          value={price}
          onChange={(e) => setPrice(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="number"
          placeholder="Stock"
          value={stock}
          onChange={(e) => setStock(e.target.value)}
          className="border px-3 py-2 rounded"
        />
        <input
          type="file"
          accept="image/*"
          onChange={(e) => {
            const file = e.target.files[0];
            if (file) {
              setImage(file);
              setPreview(URL.createObjectURL(file));
            }
          }}
          className="border px-3 py-2 rounded"
        />
        {preview && (
          <img
            src={preview}
            alt="Preview"
            className="w-28 h-28 object-cover rounded-full shadow"
          />
        )}
        <button
          onClick={handleAdd}
          className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
        >
          ➕ Add Item
        </button>
      </div>

      {/* 🔍 Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search by name..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="border px-3 py-2 rounded w-full md:w-1/2"
        />
      </div>

      {/* 📋 Menu List */}
      <ul className="space-y-3">
        {filteredMenu.map((item) => (
          <li
            key={item._id}
            className="flex justify-between items-center bg-gray-100 p-3 rounded-md shadow-sm"
          >
            <div className="flex items-center gap-4">
              <img
                src={item.image}
                alt={item.name}
                className="w-20 h-20 object-cover rounded-full shadow"
              />
              <div>
                <p className="font-medium">
                  {item.name} - ₹{item.price}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`h-3 w-3 rounded-full ${
                      item.stock > 0 ? "bg-green-500" : "bg-red-500"
                    }`}
                  ></span>
                  <span
                    className={`text-xs font-semibold ${
                      item.stock > 0 ? "text-green-700" : "text-red-600"
                    }`}
                  >
                    {item.stock > 0
                      ? `In Stock (${item.stock})`
                      : "Out of Stock"}
                  </span>
                </div>
                <div className="mt-2 flex gap-2 items-center">
                  <input
                    type="number"
                    placeholder="Update Stock"
                    value={editingStocks[item._id] ?? item.stock}
                    onChange={(e) =>
                      handleStockChange(item._id, e.target.value)
                    }
                    className="border px-2 py-1 rounded w-24"
                  />
                  <button
                    onClick={() => handleUpdateStock(item._id)}
                    className="text-sm bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700"
                  >
                    💾 Update
                  </button>
                </div>
              </div>
            </div>
            <button
              onClick={() => handleDelete(item._id)}
              className="text-red-600 hover:text-red-800"
            >
              ❌
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
