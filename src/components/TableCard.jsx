import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { CheckCircle, Clock, XCircle } from "lucide-react"; // Icons

export default function TableCard({ tableNumber }) {
  const [status, setStatus] = useState(""); // "", "none", "partial", "complete", "closed"

  // Load saved status on mount
  useEffect(() => {
    const saved = localStorage.getItem(`table-status-${tableNumber}`);
    if (saved) setStatus(saved);
  }, [tableNumber]);

  // Save status to localStorage whenever it changes
  const updateStatus = (newStatus) => {
    setStatus(newStatus);
    localStorage.setItem(`table-status-${tableNumber}`, newStatus);
  };

  const getColorClass = (circle) => {
    const base =
      "w-6 h-6 rounded-full cursor-pointer transition-all duration-200 border-2 border-gray-300";
    if (status === "closed") return `${base} bg-black`; // Closed = black again
    if (status === circle) {
      if (circle === "none") return `${base} bg-red-500 border-red-600 shadow-md`;
      if (circle === "partial") return `${base} bg-yellow-400 border-yellow-500 shadow-md`;
      if (circle === "complete") return `${base} bg-green-500 border-green-600 shadow-md`;
    }
    return `${base} bg-black`; // Default black
  };

  const handleCircleClick = (circle) => {
    if (status === "complete" && circle === "complete") {
      updateStatus("closed"); // double click → close
    } else {
      updateStatus(circle); // normal click
    }
  };

  return (
    <div className="w-full max-w-xs mx-auto bg-white rounded-2xl shadow-md p-4 mb-4">
      <Link
        to={`/menu/${tableNumber}`}
        className="block text-center bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 rounded-xl text-lg transition-all"
      >
        Table {tableNumber}
      </Link>

      <div className="flex justify-center gap-6 mt-4">
        {/* Not Delivered */}
        <div className="flex flex-col items-center">
          <div
            className={getColorClass("none")}
            title="Not Delivered"
            onClick={() => handleCircleClick("none")}
          ></div>
          <XCircle className="text-gray-500 mt-1 w-4 h-4" />
        </div>

        {/* Partially Delivered */}
        <div className="flex flex-col items-center">
          <div
            className={getColorClass("partial")}
            title="Partially Delivered"
            onClick={() => handleCircleClick("partial")}
          ></div>
          <Clock className="text-gray-500 mt-1 w-4 h-4" />
        </div>

        {/* Delivered */}
        <div className="flex flex-col items-center">
          <div
            className={getColorClass("complete")}
            title="Delivered"
            onClick={() => handleCircleClick("complete")}
          ></div>
          <CheckCircle className="text-gray-500 mt-1 w-4 h-4" />
        </div>
      </div>
    </div>
  );
}
