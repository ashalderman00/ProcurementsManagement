export default function FAB({ children="+", onClick }) {
  return (
    <button onClick={onClick}
      className="fixed right-5 bottom-5 z-[9997] rounded-full bg-blue-600 text-white w-14 h-14 shadow-lg hover:bg-blue-700 active:scale-95 transition">
      {children}
    </button>
  );
}
