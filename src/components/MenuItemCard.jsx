export default function MenuItemCard({ item, onAdd }) {
  console.log("🧾 Menu item:", item); // 👈 Add this log

  return (
    <div className="flex justify-between items-center bg-gray-100 p-4 rounded-xl shadow-sm">
      <div className="flex items-center gap-4">
        <img
          src={item.image || "https://via.placeholder.com/56"}
          alt={item.name}
          className="w-14 h-14 object-cover rounded-md"
        />
        <div>
          <h3 className="font-semibold">{item.name}</h3>
          <p className="text-sm text-gray-600">₹{item.price}</p>
        </div>
      </div>
      <button
        onClick={() => {
          console.log("👆 Adding to order:", item); // 👈 Add this too
          onAdd(item);
        }}
        className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition"
      >
        Add
      </button>
    </div>
  );
}
