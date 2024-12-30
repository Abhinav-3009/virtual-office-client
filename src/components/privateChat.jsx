import React, { useEffect, useState } from 'react';
import { Stomp } from "@stomp/stompjs";
import SockJS from "sockjs-client";
import '../CSS/privateChat.css';
import { useUser } from '../context/userContext';

const PrivateChat = () => {
  // const [user] = useState({
  //   username: 'JohnDoe', // Replace with user context if needed
  //   fullname: 'John Doe',
  // });
  const { user } = useUser();

  const [stompClient, setStompClient] = useState(null);
  const [connectedUsers, setConnectedUsers] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  


  useEffect(() => {
    // Initialize WebSocket connection
    const socket = new SockJS(`${process.env.REACT_APP_API_URL}/ws`);
    const client = Stomp.over(socket);
    client.connect({}, () => {
      console.log('Connected to WebSocket');
      setStompClient(client);

      // Subscribe to private messages
      client.subscribe(`/user/${user.username}/queue/messages`, onMessageReceived);
      client.subscribe(`/user/public`, onMessageReceived); //added by gourav

      //GOURAV _ need to check connect USER : call in login page
      // register the connected user
      client.send("/app/user.connectUser",
        {},
        JSON.stringify({username: user.username, fullname: user.username, status: 'ONLINE'})
      );


      // Fetch connected users on initial connection
      fetchConnectedUsers();
    });

    return () => {
      if (client) client.disconnect();
      console.log('Disconnected from WebSocket');
    };
  //}, [user]);
}, []);

  const fetchConnectedUsers = async () => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/connectedUsers`);
    const users = await response.json();
    //console.log(users);
    const filteredUsers = users.filter((u) => u.username !== user.username);
    setConnectedUsers(filteredUsers);  //store the connected users in variable created above
  };

  const fetchMessages = async (recipientId) => {
    const response = await fetch(`${process.env.REACT_APP_API_URL}/messages/${user.username}/${recipientId}`);
    const chatMessages = await response.json();
    setMessages(chatMessages);
  };
  
  const onMessageReceived = (messagePayload) => {
    const message = JSON.parse(messagePayload.body);
    console.log('Message received:', message);
  
    if (message.status === 'OFFLINE' && message.username) {
      // Remove the user from the connected users list
      setConnectedUsers((prevUsers) =>
        prevUsers.filter((u) => u.username !== message.username)
      );
      console.log(`User ${message.username} has been disconnected.`);
    } else if (message.status === 'ONLINE' && message.username && message.username!==user.username) {
      // Add the user to the connected users list if not already present
      setConnectedUsers((prevUsers) => {
        const userExists = prevUsers.some((u) => u.username === message.username);
        if (!userExists) {
          return [...prevUsers, { username: message.username, hasNewMessage: false }];
        }
        return prevUsers; // User already exists, no need to add
      });
      console.log(`User ${message.username} has been connected.`);
    } else if (selectedUser === message.senderId) {
      // Add the message to the selected user's chat
      setMessages((prevMessages) => [...prevMessages, message]);
    } else {
      // Mark the user as having a new message
      setConnectedUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.username === message.senderId ? { ...u, hasNewMessage: true } : u
        )
      );
      console.log("conn/disconn users should be updated");
    }
  };

  const handleUserSelect = (username) => {
    setSelectedUser(username);  //problem
    fetchMessages(username);
    setConnectedUsers((prevUsers) =>
      prevUsers.map((u) => (u.username === username ? { ...u, hasNewMessage: false } : u))  //to remove notification
    );
  };

  const sendMessage = (e) => {
    e.preventDefault();
    if (stompClient && selectedUser && messageInput.trim()) {
      const chatMessage = {
        senderId: user.username,
        recipientId: selectedUser,
        content: messageInput.trim(),
        timestamp: new Date(),
      };

      stompClient.send('/app/chat', {}, JSON.stringify(chatMessage));
      setMessages((prevMessages) => [...prevMessages, chatMessage]);
      setMessageInput('');
    }
  };

  return (
    <div className="chat-container">
      {/* Online Users List */}
      <div className="users-list">
        <h2>Online Users</h2>
        <ul>
          {connectedUsers.map((u) => (
            <li
              key={u.username}
              className={`user-item ${selectedUser === u.username ? 'active' : ''}`}
              onClick={() => handleUserSelect(u.username)}
            >
              {/* <img src="/img/user_icon.png" alt={u.fullname} /> */}
              {/*<img src="/img/user_icon.png" alt={u.username} />*/}
              {/* <span>{u.fullname}</span> */}
              <span>{u.username}</span>
              {u.hasNewMessage && <span className="new-message-indicator">•</span>}
            </li>
          ))}
        </ul>
        <div className="current-user">
          {/* <p>Logged in as: {user.fullname}</p> */}
          <p>Logged in as: {user.username}</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${msg.senderId === user.username ? 'sender' : 'receiver'}`}
            >
              <p>{msg.content}</p>
            </div>
          ))}
        </div>

        {selectedUser && (
          <form onSubmit={sendMessage} className="message-input">
            <input
              type="text"
              value={messageInput}
              onChange={(e) => setMessageInput(e.target.value)}
              placeholder="Type your message..."
            />
            <button type="submit">Send</button>
          </form>
        )}
      </div>
    </div>
  );
};

export default PrivateChat;
