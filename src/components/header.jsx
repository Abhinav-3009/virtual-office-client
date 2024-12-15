import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/userContext";
import { logout } from "../api/auth";

export default function Header() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      setUser(null);
      localStorage.removeItem("user");
      navigate("/signin");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <header className="flex justify-between items-center p-4 bg-gray-800 text-white">
      <h1 className="text-2xl font-bold">Metaverse</h1>
      <div className="flex items-center gap-4">
        {user && <span>Welcome, {user.username || "Guest"}</span>}
        {user && (
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 rounded-md hover:bg-red-500"
          >
            Logout
          </button>
        )}
      </div>
    </header>
  );
}
