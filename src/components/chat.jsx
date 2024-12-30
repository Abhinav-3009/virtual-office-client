// import React, { useState, useEffect } from "react";
// import { Stomp } from "@stomp/stompjs";
// import SockJS from "sockjs-client";
// import { useUser } from "../context/userContext";

// const Chat = () => {
//   const [messages, setMessages] = useState([]);
//   const [message, setMessage] = useState("");
//   const { user } = useUser();
//   const [client, setClient] = useState(null);


//   useEffect(() => {
//     const socket = new SockJS('http://localhost:8080/ws');
//     const client = Stomp.over(socket);

//     client.connect({}, () => {
//       client.subscribe('/topic/messages', (message) => {
//         const receivedMessage = JSON.parse(message.body);
//         console.log(receivedMessage);
//         setMessages((prevMessages) => [...prevMessages, receivedMessage]);
//       });
//     });

//     setClient(client);

//     return () => {
//       client.disconnect();
//     };
//   }, []);

//   const sendMessage = () => {
//     if (message) {
//       const chatMessage = { senderId: user?.username.charAt(0).toUpperCase() || "U", content: message };
//       client.send("/app/chats", {}, JSON.stringify(chatMessage));
//       setMessage("");
//     }
//   };

//   return (
//     <div>
//       <div>
//         <h2>Chat Messages</h2>
//         <div
//           style={{
//             border: "1px solid black",
//             height: "200px",
//             overflowY: "scroll",
//           }}
//         >
//           {messages.map((msg, index) => (
//             <div key={index} style={{ marginBottom: "10px" }}>
//               <strong>{msg.nickname}:</strong> {msg.content}
//             </div>
//           ))}
//         </div>
//       </div>
//       <input
//         type="text"
//         value={message}
//         onChange={(e) => setMessage(e.target.value)}
//         placeholder="Type your message"
//         style={{
//           padding: "8px",
//           marginRight: "10px",
//           border: "1px solid #ccc",
//           borderRadius: "4px",
//         }}
//       />
//       <button
//         onClick={sendMessage}
//         disabled={!message.trim()}
//         style={{
//           padding: "8px 12px",
//           backgroundColor: message.trim() ? "#007BFF" : "#ccc",
//           color: "white",
//           border: "none",
//           borderRadius: "4px",
//           cursor: message.trim() ? "pointer" : "not-allowed",
//         }}
//       >
//         Send
//       </button>
//     </div>
//   );
// };

// export default Chat;


import React, { useState, useEffect } from "react";
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import { useUser } from "../context/userContext";

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [connected, setConnected] = useState(false);
  const { user } = useUser();
  const [client, setClient] = useState(null);

  useEffect(() => {
    const socket = new SockJS(`${process.env.REACT_APP_API_URL}/ws`);
    const stompClient = Stomp.over(socket);

    // Optional: Enable debug logging
    // stompClient.debug = (str) => console.log(str);

    stompClient.connect({}, 
      // Success callback
      () => {
        console.log('Connected to WebSocket');
        setConnected(true);
        
        stompClient.subscribe('/topic/messages', (message) => {
          try {
            const receivedMessage = JSON.parse(message.body);
            console.log('Received message:', receivedMessage);
            setMessages((prevMessages) => [...prevMessages, receivedMessage]);
          } catch (error) {
            console.error('Error parsing message:', error);
          }
        });
      },
      // Error callback
      (error) => {
        console.error('WebSocket connection error:', error);
        setConnected(false);
      }
    );

    setClient(stompClient);

    return () => {
      if (stompClient.connected) {
        console.log("disconnected WS");
        stompClient.disconnect();
      }
    };
  }, []);

  const sendMessage = () => {
    if (message && client?.connected) {
      const chatMessage = {
        senderId: user?.username || "Anonymous",
        content: message,
        timestamp: new Date().toISOString()
      };

      try {
        client.send("/app/chats", {}, JSON.stringify(chatMessage));
        setMessage("");
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      sendMessage();
    }
  };

  return (
    <div className="p-4">
      <div>
        <h2 className="mb-4">Chat Messages</h2>
        <div
          style={{
            border: "1px solid #ddd",
            height: "400px",
            overflowY: "scroll",
            padding: "16px",
            borderRadius: "8px",
            marginBottom: "16px"
          }}
        >
          {messages.map((msg, index) => (
            <div 
              key={index} 
              style={{ 
                marginBottom: "10px",
                padding: "8px",
                backgroundColor: msg.senderId === user?.username ? "#e3f2fd" : "#f5f5f5",
                borderRadius: "8px"
              }}
            >
              <strong>{msg.senderId}:</strong> {msg.content}
              <div style={{ fontSize: '0.8em', color: '#666' }}>
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message"
          style={{
            padding: "8px",
            border: "1px solid #ccc",
            borderRadius: "4px",
            flex: 1
          }}
          disabled={!connected}
        />
        <button
          onClick={sendMessage}
          disabled={!message.trim() || !connected}
          style={{
            padding: "8px 16px",
            backgroundColor: message.trim() && connected ? "#007BFF" : "#ccc",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: message.trim() && connected ? "pointer" : "not-allowed",
          }}
        >
          Send
        </button>
      </div>
      {!connected && (
        <div style={{ color: 'red', marginTop: '8px' }}>
          Disconnected from chat server. Please refresh the page.
        </div>
      )}
    </div>
  );
};

export default Chat;