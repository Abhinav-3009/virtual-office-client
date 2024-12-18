import React, { useState, useEffect } from "react";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useUser } from "../context/userContext";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const { user } = useUser();
  const [client, setClient] = useState(null);


  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    const client = Stomp.over(socket);

    client.connect({}, () => {
      client.subscribe('/topic/messages', (message) => {
        const receivedMessage = JSON.parse(message.body);
        setMessages((prevMessages) => [...prevMessages, receivedMessage]);
      });
    });

    setClient(client);

    return () => {
      client.disconnect();
    };
  }, []);

  const sendMessage = () => {
    if (message) {
      const chatMessage = { nickname: user?.username.charAt(0).toUpperCase() || "U", content: message };
      client.send("/app/broadcast", {}, JSON.stringify(chatMessage));
      setMessage("");
    }
  };

  return (
    <div>
      <div>
        <h2>Chat Messages</h2>
        <div
          style={{
            border: "1px solid black",
            height: "200px",
            overflowY: "scroll",
          }}
        >
          {messages.map((msg, index) => (
            <div key={index} style={{ marginBottom: "10px" }}>
              <strong>{msg.nickname}:</strong> {msg.content}
            </div>
          ))}
        </div>
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message"
        style={{
          padding: "8px",
          marginRight: "10px",
          border: "1px solid #ccc",
          borderRadius: "4px",
        }}
      />
      <button
        onClick={sendMessage}
        disabled={!message.trim()}
        style={{
          padding: "8px 12px",
          backgroundColor: message.trim() ? "#007BFF" : "#ccc",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: message.trim() ? "pointer" : "not-allowed",
        }}
      >
        Send
      </button>
    </div>
  );
};

export default Chat;
