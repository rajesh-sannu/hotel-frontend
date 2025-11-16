import { useEffect, useState } from "react";
import axios from "../api/axios";
import { Line, Pie } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
} from "chart.js";
import { useNavigate } from "react-router-dom";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend
);

export default function AdminAnalytics() {
  const [summary, setSummary] = useState({ today: 0, week: 0, month: 0 });
  const [dailyData, setDailyData] = useState([]);
  const [bestSellers, setBestSellers] = useState([]);
  const [specificDate, setSpecificDate] = useState("");
  const [specificTotal, setSpecificTotal] = useState(null);
 const [highestSalesDay, setHighestSalesDay] = useState({ date: null, total: 0 });
  const navigate = useNavigate();

  useEffect(() => {
    fetchSummary();
    fetchDailyData();
    fetchBestSellers();
    fetchHighestSalesDay();
  }, []);

  const fetchSummary = async () => {
    try {
      const res = await axios.get("/analytics/summary");
      setSummary(res.data);
    } catch (err) {
      console.error("Error fetching summary:", err);
    }
  };

  const fetchDailyData = async () => {
    try {
      const res = await axios.get("/analytics/daily-totals?range=7");
      setDailyData(res.data);
    } catch (err) {
      console.error("Error fetching daily chart:", err);
    }
  };

  const fetchBestSellers = async () => {
    try {
      const res = await axios.get("/analytics/best-sellers?limit=5");
      setBestSellers(res.data);
    } catch (err) {
      console.error("Error fetching best sellers:", err);
    }
  };

  const fetchSpecificDate = async () => {
    if (!specificDate) return;
    try {
      const res = await axios.get(`/analytics/total-by-date?date=${specificDate}`);
      setSpecificTotal(res.data.total);
    } catch (err) {
      console.error("Error fetching specific date total:", err);
      setSpecificTotal(null);
    }
  };

  const fetchHighestSalesDay = async () => {
  try {
    const res = await axios.get("/analytics/highest-sales-day");
    setHighestSalesDay(res.data);
  } catch (err) {
    console.error("Error fetching highest sales day:", err);
  }
};

  const lineChart = {
    labels: dailyData.map((d) => d.date),
    datasets: [
      {
        label: "Daily Sales ₹",
        data: dailyData.map((d) => d.total),
        fill: false,
        borderColor: "#3b82f6",
        backgroundColor: "#3b82f6",
        tension: 0.3,
        pointRadius: 5,
        pointHoverRadius: 8,
      },
    ],
  };

  const pieChart = {
    labels: bestSellers.map((item) => item.name),
    datasets: [
      {
        label: "Items Sold",
        data: bestSellers.map((item) => item.count),
        backgroundColor: [
          "#4ade80",
          "#60a5fa",
          "#f472b6",
          "#facc15",
          "#f87171",
        ],
      },
    ],
  };

  return (
    <div className="p-4 md:p-8">
      {/* Header & Back Button */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">📊 Analytics Dashboard</h1>
        <button
          onClick={() => navigate("/admin")}
          className="bg-gray-800 text-white px-4 py-2 rounded-xl hover:bg-gray-700"
        >
          ⬅ Back to Admin Panel
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 mb-6">
        <div className="bg-green-100 p-4 rounded-2xl shadow text-center">
          <h2 className="text-sm font-medium text-gray-600">Today</h2>
          <p className="text-2xl font-semibold text-green-700">₹{summary.today}</p>
        </div>
        <div className="bg-blue-100 p-4 rounded-2xl shadow text-center">
          <h2 className="text-sm font-medium text-gray-600">This Week</h2>
          <p className="text-2xl font-semibold text-blue-700">₹{summary.week}</p>
        </div>
        <div className="bg-yellow-100 p-4 rounded-2xl shadow text-center">
          <h2 className="text-sm font-medium text-gray-600">This Month</h2>
          <p className="text-2xl font-semibold text-yellow-700">₹{summary.month}</p>
        </div>
        {/* Highest Sales Day Card */}
<div className="bg-purple-100 p-4 rounded-2xl shadow text-center mb-6">
  <h2 className="text-sm font-medium text-gray-600">
    Highest Sale Day (This Month)
  </h2>
  <p className="text-lg text-purple-700 font-semibold">
    {highestSalesDay.date || "-"}
  </p>
  <p className="text-2xl font-bold text-purple-800">
    ₹{highestSalesDay.total}
  </p>
</div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div className="bg-white p-4 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-2 text-center">📅 Last 7 Days</h2>
          <Line data={lineChart} />
        </div>
        <div className="bg-white p-4 rounded-2xl shadow">
          <h2 className="text-lg font-semibold mb-2 text-center">🍽️ Top 5 Selling Items</h2>
          <Pie data={pieChart} />
        </div>
      </div>

      {/* Specific Date Search */}
      <div className="bg-white p-4 rounded-2xl shadow text-center">
        <h2 className="text-lg font-semibold mb-2">🔍 Check Total by Date</h2>
        <div className="flex flex-col sm:flex-row justify-center items-center gap-4 mt-2">
          <input
            type="date"
            className="border px-3 py-2 rounded-xl"
            value={specificDate}
            onChange={(e) => setSpecificDate(e.target.value)}
          />
          <button
            onClick={fetchSpecificDate}
            className="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700"
          >
            Get Total
          </button>
        </div>
        {specificTotal !== null && (
          <p className="mt-3 text-lg font-semibold">
            Total for {specificDate}: ₹{specificTotal}
          </p>
        )}
      </div>
    </div>
  );
}
