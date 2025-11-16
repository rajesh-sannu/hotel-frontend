// components/SendBillModal.jsx
import { useState } from "react";
import { toast } from "react-toastify";

export default function SendBillModal({ billText, onClose }) {
  const [phone, setPhone] = useState("");

  const handleSend = () => {
    if (!phone || phone.length !== 10) {
      toast.error("❌ Enter a valid 10-digit number");
      return;
    }

    // 🧾 Format bill with emojis & bold text
    const formattedBill =
      `🧾 *Your Bill*\n\n` +   // Bold title with emoji
      `${billText}\n\n` +
      `✅ *Thank you for your visit! 🙏 visit again!😊*`;

    // ✅ Encode full message so emojis and bold text work
    const message = encodeURIComponent(formattedBill);

    // ✅ Use WhatsApp API URL (better for emojis)
    const url = `https://api.whatsapp.com/send?phone=91${phone}&text=${message}`;
    window.open(url, "_blank");

    toast.success("✅ Opening WhatsApp...");
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded-xl shadow-lg w-80">
        <h2 className="text-xl font-bold mb-4">Send Bill via WhatsApp</h2>
        <input
          type="tel"
          placeholder="Customer Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="w-full p-2 border rounded mb-4"
        />
        <div className="flex justify-end gap-2">
          <button onClick={onClose} className="px-4 py-2 bg-gray-300 rounded">
            Cancel
          </button>
          <button
            onClick={handleSend}
            className="px-4 py-2 bg-green-600 text-white rounded"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
