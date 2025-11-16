import React, { useEffect, useState } from "react";

export default function AdminLogins() {
  const [logins, setLogins] = useState({ admins: [], waiters: [] });
  const [activeTab, setActiveTab] = useState("admin");
  const token = localStorage.getItem("token");

  useEffect(() => {
    fetch("http://localhost:5000/api/admin/logins", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (!Array.isArray(data)) return;

        const unique = {};
        data.forEach((log) => {
          const key = `${log.email}-${log.type}-${log.os}-${log.browser}-${log.ip}`;
          if (!unique[key] || new Date(log.createdAt) > new Date(unique[key].createdAt)) {
            unique[key] = log;
          }
        });

        const filtered = Object.values(unique);

        setLogins({
          admins: filtered.filter((log) => log.role === "admin"),
          waiters: filtered.filter((log) => log.role === "waiter"),
        });
      })
      .catch((err) => console.error("Error fetching logs:", err));
  }, [token]);

  const activeLogs = activeTab === "admin" ? logins.admins : logins.waiters;

  const handleLogout = async (id) => {
    try {
      const res = await fetch(`http://localhost:5000/api/admin/logout/${id}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (res.ok) {
        setLogins((prev) => ({
          admins: prev.admins.filter((log) => log._id !== id),
          waiters: prev.waiters.filter((log) => log._id !== id),
        }));
      } else {
        alert(data.message || "Error logging out session");
      }
    } catch (err) {
      console.error(err);
      alert("Error logging out session");
    }
  };

  return (
    <div className="p-4 md:p-8 bg-gradient-to-b from-gray-50 to-gray-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 text-center md:text-left">
          Login Devices
        </h2>
        <button
          onClick={() => (window.location.href = "/admin")}
          className="px-5 py-2 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all"
        >
          Back to Admin Panel
        </button>
      </div>

      {/* Tabs */}
      <div className="flex flex-col sm:flex-row gap-4 mb-6 justify-center sm:justify-start">
        <button
          onClick={() => setActiveTab("admin")}
          className={`px-5 py-2 rounded-lg font-semibold shadow-md transition-colors duration-200 ${
            activeTab === "admin"
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          🛡 Admin Logins ({logins.admins.length})
        </button>
        <button
          onClick={() => setActiveTab("waiter")}
          className={`px-5 py-2 rounded-lg font-semibold shadow-md transition-colors duration-200 ${
            activeTab === "waiter"
              ? "bg-green-600 text-white hover:bg-green-700"
              : "bg-gray-200 text-gray-700 hover:bg-gray-300"
          }`}
        >
          👨‍🍳 Waiter Logins ({logins.waiters.length})
        </button>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-2xl shadow-xl border border-gray-200">
        <table className="w-full min-w-[600px] md:min-w-full border-collapse">
          <thead className="bg-gray-100">
            <tr>
              {["Email", "Role", "Device", "OS", "Browser", "IP", "Last Login", "Actions"].map(
                (title) => (
                  <th
                    key={title}
                    className="p-3 text-left font-medium text-gray-700 border-b border-gray-200"
                  >
                    {title}
                  </th>
                )
              )}
            </tr>
          </thead>
          <tbody>
            {activeLogs.length > 0 ? (
              activeLogs.map((log) => (
                <tr
                  key={log._id}
                  className="hover:bg-gray-50 transition-colors duration-150 odd:bg-gray-50 even:bg-gray-100"
                >
                  <td className="p-3 border-b border-gray-200 break-all">{log.email}</td>
                  <td className="p-3 border-b border-gray-200 capitalize">{log.role}</td>
                  <td className="p-3 border-b border-gray-200">{log.type || "-"}</td>
                  <td className="p-3 border-b border-gray-200">{log.os || "-"}</td>
                  <td className="p-3 border-b border-gray-200">{log.browser || "-"}</td>
                  <td className="p-3 border-b border-gray-200">{log.ip || "-"}</td>
                  <td className="p-3 border-b border-gray-200">
                    {new Date(log.createdAt).toLocaleString()}
                  </td>
                  <td className="p-3 border-b border-gray-200">
                    <button
                      onClick={() => handleLogout(log._id)}
                      className="px-3 py-1 bg-red-500 text-white rounded-md shadow-sm hover:bg-red-600 transition-colors w-full sm:w-auto"
                    >
                      Logout
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="8" className="p-4 text-center text-gray-500 border-b border-gray-200">
                  No login records found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
