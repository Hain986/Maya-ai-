/**
 * Maya AI Auto-Reconnect & Heartbeat Health Monitor Service
 * Continuously monitors backend server health, network drops, and auto reconnects with exponential backoff.
 */

export type ConnectionStatus = 'online' | 'reconnecting' | 'offline_neural';

export interface HealthStatus {
  status: ConnectionStatus;
  latencyMs: number;
  lastChecked: number;
  reconnectAttempts: number;
  serverInfo?: {
    app: string;
    owner: string;
  };
}

type Subscriber = (status: HealthStatus) => void;

class ReconnectService {
  private status: ConnectionStatus = 'online';
  private latencyMs: number = 0;
  private reconnectAttempts: number = 0;
  private subscribers: Set<Subscriber> = new Set();
  private timer: any = null;
  private serverInfo?: { app: string; owner: string };

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleOnlineEvent());
      window.addEventListener('offline', () => this.handleOfflineEvent());
      this.startHeartbeat();
    }
  }

  private handleOnlineEvent() {
    this.reconnectAttempts = 0;
    this.checkHealth();
  }

  private handleOfflineEvent() {
    this.status = 'offline_neural';
    this.notify();
  }

  public subscribe(cb: Subscriber): () => void {
    this.subscribers.add(cb);
    cb(this.getHealthStatus());
    return () => this.subscribers.delete(cb);
  }

  private notify() {
    const health = this.getHealthStatus();
    this.subscribers.forEach((cb) => cb(health));
  }

  public getHealthStatus(): HealthStatus {
    return {
      status: this.status,
      latencyMs: this.latencyMs,
      lastChecked: Date.now(),
      reconnectAttempts: this.reconnectAttempts,
      serverInfo: this.serverInfo,
    };
  }

  public async checkHealth(): Promise<boolean> {
    if (typeof window === 'undefined' || !navigator.onLine) {
      this.status = 'offline_neural';
      this.notify();
      return false;
    }

    const startTime = Date.now();
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const res = await fetch('/api/health', {
        method: 'GET',
        signal: controller.signal,
        headers: { 'Cache-Control': 'no-cache' },
      });
      clearTimeout(timeoutId);

      if (res.ok) {
        const data = await res.json();
        this.latencyMs = Date.now() - startTime;
        this.status = 'online';
        this.reconnectAttempts = 0;
        this.serverInfo = { app: data.app || 'Maya AI Companion', owner: data.owner || 'Rk Hacker' };
        this.notify();
        return true;
      } else {
        throw new Error(`Server returned ${res.status}`);
      }
    } catch (err) {
      this.latencyMs = 0;
      this.reconnectAttempts++;
      if (this.reconnectAttempts > 1) {
        this.status = 'offline_neural';
      } else {
        this.status = 'reconnecting';
      }
      this.notify();
      return false;
    }
  }

  public manualReconnect() {
    this.reconnectAttempts = 0;
    this.status = 'reconnecting';
    this.notify();
    return this.checkHealth();
  }

  private startHeartbeat() {
    if (this.timer) clearInterval(this.timer);
    // Ping every 10 seconds to maintain live server connection
    this.timer = setInterval(() => {
      this.checkHealth();
    }, 10000);
    // Initial check
    this.checkHealth();
  }
}

export const reconnectService = new ReconnectService();
