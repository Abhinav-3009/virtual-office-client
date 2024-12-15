import React, { useState, useEffect } from "react";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [client, setClient] = useState(null);

  const connect = () => {
    const socket = new SockJS("http://localhost:8080/ws");
    const stompClient = Stomp.over(socket);
    stompClient.connect(
      {},
      () => {
        setClient(stompClient);
        stompClient.subscribe("/topic/messages", (message) => {
          const msg = JSON.parse(message.body);
          console.log("Received message:", msg);
          setMessages((prevMessages) => [...prevMessages, msg]);
        });
      },
      (error) => {
        console.error("Error connecting to WebSocket:", error);
      }
    );
  };

  const sendMessage = () => {
    if (message) {
      const chatMessage = { nickname: "user", content: message };
      client.send("/app/chat", {}, JSON.stringify(chatMessage));
      setMessage("");
    }
  };
  useEffect(() => {
    connect();
    return () => {
      if (client) {
        client.disconnect();
      }
    };
  }, []);

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
            <p key={index}>{msg.content}</p>
          ))}
        </div>
      </div>
      <input
        type="text"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        placeholder="Type your message"
      />
      <button onClick={sendMessage}>Send</button>
    </div>
  );
};

export default Chat;
