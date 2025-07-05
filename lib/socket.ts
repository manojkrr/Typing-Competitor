"use client";

import { io, type Socket } from "socket.io-client";

class SocketManager {
  private socket: Socket | null = null;
  private static instance: SocketManager;

  static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  connect(userData: {
    name: string;
    avatar?: string;
    userId?: string;
  }): Socket {
    if (this.socket?.connected) {
      return this.socket;
    }

    const serverUrl =
      process.env.NODE_ENV === "production"
        ? "wss://your-server-domain.com"
        : "http://localhost:3001";

    this.socket = io(serverUrl, {
      transports: ["websocket", "polling"],
      timeout: 20000,
      forceNew: true,
    });

    this.socket.on("connect", () => {
      console.log("🔌 Connected to server:", this.socket?.id);
      this.socket?.emit("user:join", userData);
    });

    this.socket.on("disconnect", (reason) => {
      console.log("🔌 Disconnected from server:", reason);
    });

    this.socket.on("connect_error", (error) => {
      console.error("🔌 Connection error:", error);
    });

    return this.socket;
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }
}

export const socketManager = SocketManager.getInstance();
export type { Socket };
