import SockJS from 'sockjs-client';
import { Stomp } from '@stomp/stompjs';

class WebSocketService {
    constructor() {
      this.stompClient = null;
      this.connectionPromise = null;
      this.subscriptions = new Map();
    }
  
    connect() {
      if (this.connectionPromise) return this.connectionPromise;
  
      this.connectionPromise = new Promise((resolve, reject) => {
        const socket = new SockJS(`${process.env.REACT_APP_API_URL}/ws`);
        this.stompClient = Stomp.over(socket);
        
        // Properly disable debug logging
        this.stompClient.debug = () => {};
  
        this.stompClient.connect({}, () => {
          console.log('WebSocket Connected');
          resolve(this.stompClient);
        }, (error) => {
          console.error('WebSocket Connection Error:', error);
          this.connectionPromise = null;
          reject(error);
        });
      });
  
      return this.connectionPromise;
    }
  
    subscribe(topic, callback) {
      return this.connect().then((client) => {
        if (this.subscriptions.has(topic)) {
          this.subscriptions.get(topic).unsubscribe();
        }
        
        const subscription = client.subscribe(topic, (message) => {
          const data = JSON.parse(message.body);
          callback(data);
        });
        
        this.subscriptions.set(topic, subscription);
        return subscription;
      });
    }
  
    send(destination, data) {
      return this.connect().then((client) => {
        client.send(destination, {}, JSON.stringify(data));
      });
    }
  
    disconnect() {
      Array.from(this.subscriptions.values()).forEach(sub => sub.unsubscribe());
      this.subscriptions.clear();
      
      if (this.stompClient) {
        this.stompClient.disconnect();
        this.stompClient = null;
      }
      this.connectionPromise = null;
    }
  }
  
  export default new WebSocketService();