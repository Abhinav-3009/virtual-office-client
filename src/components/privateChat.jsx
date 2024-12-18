import React, { useEffect, useState } from 'react';
import SockJS from 'sockjs-client';
import Stomp from 'stompjs';
import './App.css';
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
    const socket = new SockJS('http://localhost:8080/ws');
    const client = Stomp.over(socket);

    client.connect({}, () => {
      console.log('Connected to WebSocket');
      setStompClient(client);

      // Subscribe to private messages
      client.subscribe(`/user/${user.username}/queue/messages`, onMessageReceived);
      stompClient.subscribe(`/user/public`, onMessageReceived); //added by gourav

      //GOURAV _ need to check connect USER : call in login page

      // Fetch connected users on initial connection
      fetchConnectedUsers();
    });

    return () => {
      if (client) client.disconnect();
      console.log('Disconnected from WebSocket');
    };
  }, [user]);

  const fetchConnectedUsers = async () => {
    const response = await fetch('http://localhost:8080/connectedUsers');
    const users = await response.json();
    const filteredUsers = users.filter((u) => u.username !== user.username);
    setConnectedUsers(filteredUsers);  //store the connected users in variable created above
  };

  const fetchMessages = async (recipientId) => {
    const response = await fetch(`http://localhost:8080/messages/${user.username}/${recipientId}`);
    const chatMessages = await response.json();
    setMessages(chatMessages);
  };

  const onMessageReceived = (messagePayload) => {
    //Gourav - check udpated conn discoonn users
    const message = JSON.parse(messagePayload.body);
    console.log('Message received:', message);

    // Update messages if it's from the selected user
    if (selectedUser === message.senderId) {
      setMessages((prevMessages) => [...prevMessages, message]);  //Gourav check prevMessages
    } else {
      // Mark the sender in the user list
      setConnectedUsers((prevUsers) =>
        prevUsers.map((u) =>
          u.username === message.senderId ? { ...u, hasNewMessage: true } : u
        )
      );
    }
  };

  const handleUserSelect = (username) => {
    setSelectedUser(username);
    fetchMessages(username);
    setConnectedUsers((prevUsers) =>
      prevUsers.map((u) => (u.username === username ? { ...u, hasNewMessage: false } : u))
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
              <img src="/img/user_icon.png" alt={u.fullname} />
              <span>{u.fullname}</span>
              {u.hasNewMessage && <span className="new-message-indicator">•</span>}
            </li>
          ))}
        </ul>
        <div className="current-user">
          <p>Logged in as: {user.fullname}</p>
        </div>
      </div>

      {/* Chat Area */}
      <div className="chat-area">
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message ${
                msg.senderId === user.username ? 'sender' : 'receiver'
              }`}
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
