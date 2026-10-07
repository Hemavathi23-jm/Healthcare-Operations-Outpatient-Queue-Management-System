import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

class WebSocketService {
  constructor() {
    this.client = null;
    this.connected = false;
    this.listeners = new Map();
  }

  connect() {
    if (this.client && this.client.active) {
      return;
    }

    const wsUrl = (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8081/api/v1')
      .replace('/api/v1', '/ws');

    this.client = new Client({
      webSocketFactory: () => new SockJS(wsUrl),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      debug: (msg) => {
        // console.debug('[STOMP]', msg);
      },
      onConnect: () => {
        this.connected = true;
        // console.log('[STOMP] Connected to WebSocket broker at', wsUrl);

        // Re-subscribe any pending listeners
        this.listeners.forEach((callbacks, topic) => {
          this.subscribeToTopic(topic);
        });
      },
      onDisconnect: () => {
        this.connected = false;
        // console.log('[STOMP] Disconnected');
      },
      onStompError: (frame) => {
        console.warn('[STOMP] Broker error:', frame.headers['message']);
      },
    });

    this.client.activate();
  }

  subscribe(topic, callback) {
    if (!this.listeners.has(topic)) {
      this.listeners.set(topic, new Set());
    }
    this.listeners.get(topic).add(callback);

    if (this.connected) {
      this.subscribeToTopic(topic);
    } else {
      this.connect();
    }

    // Return unsubscribe function
    return () => {
      const callbacks = this.listeners.get(topic);
      if (callbacks) {
        callbacks.delete(callback);
        if (callbacks.size === 0) {
          this.listeners.delete(topic);
        }
      }
    };
  }

  subscribeToTopic(topic) {
    if (!this.client || !this.client.connected) return;

    this.client.subscribe(topic, (message) => {
      try {
        const payload = JSON.parse(message.body);
        const callbacks = this.listeners.get(topic);
        if (callbacks) {
          callbacks.forEach((cb) => cb(payload));
        }
      } catch (err) {
        console.error('[STOMP] Error parsing message payload:', err);
      }
    });
  }

  disconnect() {
    if (this.client) {
      this.client.deactivate();
      this.connected = false;
      this.client = null;
    }
  }
}

const wsService = new WebSocketService();
export default wsService;
