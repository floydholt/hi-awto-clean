export default function Input({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={`border rounded px-3 py-2 w-full focus:outline-none focus:ring focus:ring-blue-300 ${className}`}
    />
  );
}
