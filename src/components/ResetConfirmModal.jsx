// src/components/ResetConfirmModal.jsx
import { useState } from "react";

export default function ResetConfirmModal({ onConfirm, onClose }) {
  const [password, setPassword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    onConfirm(password);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-6 rounded-xl shadow-md space-y-4 w-full max-w-sm"
      >
        <h2 className="text-xl font-bold text-center">🔐 Admin Password</h2>
        <input
          type="password"
          placeholder="Enter admin password"
          className="w-full border rounded p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <div className="flex justify-between">
          <button
            type="submit"
            className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
          >
            ✅ Confirm Reset
          </button>
          <button
            type="button"
            onClick={onClose}
            className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
          >
            ❌ Cancel
          </button>
        </div>
      </form>
    </div>
  );
}
