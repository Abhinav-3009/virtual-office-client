import React from "react";
import { useNavigate } from "react-router-dom";
import { useUser } from "../context/userContext";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { logout } from "../api/auth";

export default function Header() {
  const { user, setUser } = useUser();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Initialize WebSocket connection
  const socket = new SockJS(`${process.env.REACT_APP_API_URL}/ws`);
  const client = Stomp.over(socket);

  // Connect to WebSocket and send the disconnect message
  client.connect({}, () => {
    console.log('Connected to WebSocket for logout');

    // Notify the server that the user is disconnecting
    client.send(
      "/app/user.disconnectUser",
      {},
      JSON.stringify({
        username: user.username, // Replace with actual user data
        fullname: user.username,
        status: "OFFLINE",
      })
    );

    console.log(`User ${user.username} is now offline`);

    // Disconnect WebSocket after sending the message
    client.disconnect(() => {
      console.log('WebSocket disconnected');
    });
  }, (error) => {
    console.error('WebSocket connection error during logout:', error);
  });


      await logout();
      setUser(null);
      localStorage.removeItem("user");
      navigate("/signin");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <header className="fixed top-0 left-0 w-full flex justify-between items-center p-4 bg-gray-800 text-white z-50">
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
