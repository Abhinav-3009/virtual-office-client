import React, { useState, useEffect } from 'react';
import { Stomp } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { useUser } from '../context/userContext';

const calculateDistance = (pos1, pos2) => {
  if (!pos1 || !pos2 || typeof pos1.x !== 'number' || typeof pos1.y !== 'number' 
      || typeof pos2.x !== 'number' || typeof pos2.y !== 'number') {
    return Infinity;
  }
  const dx = pos1.x - pos2.x;
  const dy = pos1.y - pos2.y;
  return Math.sqrt(dx * dx + dy * dy);
};

const EnhancedChat = ({ userPositions = {}, avatarPos }) => {
  const { user } = useUser();
  const [activeChannel, setActiveChannel] = useState('broadcast');
  const [messages, setMessages] = useState({
    broadcast: [],
    proximity: {}
  });
  const [message, setMessage] = useState('');
  const [client, setClient] = useState(null);
  const [nearbyUsers, setNearbyUsers] = useState([]);

  // WebSocket Connection
  useEffect(() => {
    const socket = new SockJS('http://localhost:8080/ws');
    const client = Stomp.over(socket);

    client.connect({}, () => {
      // Broadcast channel subscription
      client.subscribe('/topic/messages', (message) => {
        const receivedMessage = JSON.parse(message.body);
        setMessages(prev => ({
          ...prev,
          broadcast: [...prev.broadcast, receivedMessage]
        }));
        console.log("message received: ",messages);
      });

      // Private channel subscription
      client.subscribe(`/user/${user.username}/queue/messages`, (message) => {
        const receivedMessage = JSON.parse(message.body);
        console.log("received message :::::", receivedMessage);
        const senderId = receivedMessage.senderId;
        setMessages(prev => ({
          ...prev,
          proximity: {
            ...prev.proximity,
            [senderId]: [...(prev.proximity[senderId] || []), receivedMessage]
          }
        }));
        console.log("messages for user", messages);
      });
    });

    setClient(client);

    return () => {
      if (client && client.connected) {
        client.disconnect();
      }
    };
  }, [user.username]);

  // Update nearby users
  useEffect(() => {
    if (!avatarPos || typeof avatarPos.x !== 'number' || typeof avatarPos.y !== 'number') {
      return;
    }

    const nearby = Object.entries(userPositions)
      .filter(([username, pos]) => {
        if (username === user.username) return false;
        if (!pos || typeof pos.x !== 'number' || typeof pos.y !== 'number') return false;
        return calculateDistance(pos, avatarPos) <= 1;
      })
      .map(([username]) => username);

    setNearbyUsers(nearby);
  }, [userPositions, avatarPos, user.username]);

  const sendMessage = () => {
    if (!message.trim() || !client) return;

    if (activeChannel === 'broadcast') {
      const chatMessage = { 
        senderId: user.username, 
        content: message,
        timestamp: new Date().toISOString()
      };
      client.send("/app/chats", {}, JSON.stringify(chatMessage));
    } else {
      const privateMessage = {
        senderId: user.username,
        recipientId: activeChannel,
        content: message,
        timestamp: new Date().toISOString()
      };
      client.send("/app/chat", {}, JSON.stringify(privateMessage));
      
      // Add to local messages immediately
      setMessages(prev => ({
        ...prev,
        proximity: {
          ...prev.proximity,
          [activeChannel]: [
            ...(prev.proximity[activeChannel] || []),
            privateMessage
          ]
        }
      }));
    }
    setMessage('');
  };

  const getCurrentMessages = () => {
    if (activeChannel === 'broadcast') {
      return messages.broadcast;
    }
    return messages.proximity[activeChannel] || [];
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <div className="fixed right-0 top-0 h-screen w-80 bg-white shadow-lg flex flex-col">
      {/* Chat Header */}
      <div className="p-4 bg-gray-100 border-b">
        <h2 className="text-xl font-semibold">
          {activeChannel === 'broadcast' ? 'Broadcast Channel' : `Chat with ${activeChannel}`}
        </h2>
      </div>

      {/* Channel List */}
      <div className="p-2 border-b">
        <div 
          className={`p-2 cursor-pointer rounded flex items-center ${
            activeChannel === 'broadcast' ? 'bg-blue-100' : 'hover:bg-gray-100'
          }`}
          onClick={() => setActiveChannel('broadcast')}
        >
          <span className="text-lg mr-2">#</span>
          <span>Broadcast</span>
        </div>
        
        {nearbyUsers.length > 0 && (
          <div className="mt-2 mb-1 text-sm text-gray-500 px-2">Nearby Users</div>
        )}
        
        {nearbyUsers.map(username => (
          <div
            key={username}
            className={`p-2 cursor-pointer rounded flex items-center ${
              activeChannel === username ? 'bg-blue-100' : 'hover:bg-gray-100'
            }`}
            onClick={() => setActiveChannel(username)}
          >
            <span className="text-lg mr-2">@</span>
            <span>{username}</span>
          </div>
        ))}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4">
        {getCurrentMessages().map((msg, index) => (
          <div 
            key={index} 
            className={`mb-3 ${msg.sender === user.username || msg.username === user.username ? 'text-right' : ''}`}
          >
            <div className={`inline-block max-w-[80%] ${
              msg.sender === user.username || msg.username === user.username
                ? 'bg-blue-500 text-white'
                : 'bg-gray-200'
              } rounded-lg px-4 py-2`}
            >
              {msg.sender !== user.username && msg.username !== user.username && (
                <div className="text-sm font-semibold mb-1">
                  {msg.username || msg.sender}
                </div>
              )}
              <strong>{msg.senderId}:</strong> {msg.content}
              <div className="text-xs opacity-75 mt-1">
                {new Date(msg.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Message Input */}
      <div className="p-4 border-t">
        <textarea
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder={`Message ${activeChannel === 'broadcast' ? 'everyone' : activeChannel}...`}
          className="w-full p-2 border rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
          rows="3"
        />
        <button
          onClick={sendMessage}
          disabled={!message.trim()}
          className={`mt-2 px-4 py-2 rounded-lg w-full ${
            message.trim()
              ? 'bg-blue-500 hover:bg-blue-600 text-white'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
          }`}
        >
          Send
        </button>
      </div>
    </div>
  );
};

export default EnhancedChat;