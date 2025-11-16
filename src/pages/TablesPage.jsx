import { useEffect, useState } from "react";
import axios from "axios";
import TableCard from "../components/TableCard";
import { useNavigate } from "react-router-dom";

export default function TablesPage() {
  const [tableList, setTableList] = useState([]);
  const [newTable, setNewTable] = useState("");
  const [timers, setTimers] = useState({}); // { tableId: seconds }
  const navigate = useNavigate();

  const fetchTables = async () => {
    const res = await axios.get("http://localhost:5000/api/tables");
    setTableList(res.data);
  };

  useEffect(() => {
    fetchTables();
  }, []);

  // Timer logic using occupiedAt
  useEffect(() => {
    const interval = setInterval(() => {
      const now = Date.now();
      const updatedTimers = {};

      tableList.forEach((table) => {
        if (table.status === "occupied" && table.occupiedAt) {
          const start = new Date(table.occupiedAt).getTime();
          const secondsElapsed = Math.floor((now - start) / 1000);
          updatedTimers[table.id] = secondsElapsed;
        } else {
          updatedTimers[table.id] = 0;
        }
      });

      setTimers(updatedTimers);
    }, 1000);

    return () => clearInterval(interval);
  }, [tableList]);

  const formatTime = (seconds) => {
    const h = String(Math.floor(seconds / 3600)).padStart(2, "0");
    const m = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
    const s = String(seconds % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  };

  const handleAddTable = async () => {
    const tableNum = parseInt(newTable);
    if (!isNaN(tableNum) && !tableList.find((t) => t.id === tableNum)) {
      await axios.post("http://localhost:5000/api/tables", { id: tableNum });
      fetchTables(); // new table will show with timer = 0 until occupied
      setNewTable("");
    }
  };

  const handleRemoveTable = async (id) => {
    await axios.delete(`http://localhost:5000/api/tables/${id}`);
    fetchTables();
  };

  const toggleStatus = async (id) => {
    await axios.put(`http://localhost:5000/api/tables/${id}`);
    fetchTables();
  };

  const handleLogout = () => {
    localStorage.removeItem("waiterToken");
    navigate("/login");
  };

  return (
    <div className="p-4 relative min-h-screen bg-gray-500">
      {/* Logout Button */}
      <button
        onClick={handleLogout}
        className="absolute top-4 left-2 bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
      >
        🔒 Logout
      </button>

      <h1 className="text-2xl font-bold mb-4 text-center">Select a Table</h1>

      <div className="mb-4 flex gap-2">
        <input
          type="number"
          placeholder="Enter table number"
          value={newTable}
          onChange={(e) => setNewTable(e.target.value)}
          className="border px-4 py-2 rounded-md w-full"
        />
        <button
          onClick={handleAddTable}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
        >
          ➕ Add
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {tableList.map((table) => (
          <div
            key={table.id}
            className={`p-4 rounded-xl shadow-md border relative transition duration-300 ${
              table.status === "occupied" ? "bg-yellow-100" : "bg-green-100"
            }`}
          >
            <TableCard tableNumber={table.id} />

            {/* ⏱️ Timer */}
            {table.status === "occupied" && (
              <div className="text-sm font-mono text-gray-700 mt-1">
                ⏱️ {formatTime(timers[table.id] || 0)}
              </div>
            )}

            {/* 💡 Bulb Light Status */}
            <div className="flex items-center gap-2 mt-2">
              <span
                className={`text-2xl ${
                  table.status === "occupied"
                    ? "text-red-700 animate-pulse drop-shadow-[0_0_20px_rgba(255,0,0,1)]"
                    : "text-gray-300"
                }`}
              >
                💡
              </span>
              <span className="text-sm font-medium">
                {table.status === "occupied" ? "Light ON" : "Light OFF"}
              </span>
            </div>

            {/* Buttons */}
            <div className="mt-3 flex justify-between items-center">
              <button
                onClick={() => toggleStatus(table.id)}
                className={`text-sm px-3 py-1 rounded-md font-medium transition ${
                  table.status === "occupied"
                    ? "bg-yellow-500 text-white hover:bg-yellow-600"
                    : "bg-green-500 text-white hover:bg-green-600"
                }`}
              >
                {table.status === "occupied" ? "Occupied" : "Vacant"}
              </button>
              <button
                onClick={() => handleRemoveTable(table.id)}
                className="text-red-600 hover:text-red-800 text-sm"
              >
                ❌ Remove
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
