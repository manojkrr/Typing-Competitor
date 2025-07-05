"use client";

import { useEffect, useState, useCallback } from "react";
import { socketManager, type Socket } from "@/lib/socket";

interface UseSocketOptions {
  autoConnect?: boolean;
  userData?: {
    name: string;
    avatar?: string;
    userId?: string;
  };
}

export function useSocket(options: UseSocketOptions = {}) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  const connect = useCallback(
    (userData?: { name: string; avatar?: string; userId?: string }) => {
      try {
        const socketInstance = socketManager.connect(
          userData || options.userData || { name: `User${Date.now()}` },
        );
        setSocket(socketInstance);
        setConnectionError(null);
      } catch (error) {
        setConnectionError(
          error instanceof Error ? error.message : "Connection failed",
        );
      }
    },
    [options.userData],
  );

  const disconnect = useCallback(() => {
    socketManager.disconnect();
    setSocket(null);
    setIsConnected(false);
  }, []);

  useEffect(() => {
    if (options.autoConnect && options.userData) {
      connect(options.userData);
    }

    return () => {
      // Don't auto-disconnect on unmount to maintain connection across pages
    };
  }, [options.autoConnect, options.userData, connect]);

  useEffect(() => {
    const currentSocket = socketManager.getSocket();
    if (currentSocket) {
      setSocket(currentSocket);
      setIsConnected(currentSocket.connected);

      const handleConnect = () => setIsConnected(true);
      const handleDisconnect = () => setIsConnected(false);
      const handleError = (error: any) => {
        setConnectionError(error?.message || "Connection error");
      };

      currentSocket.on("connect", handleConnect);
      currentSocket.on("disconnect", handleDisconnect);
      currentSocket.on("connect_error", handleError);

      return () => {
        currentSocket.off("connect", handleConnect);
        currentSocket.off("disconnect", handleDisconnect);
        currentSocket.off("connect_error", handleError);
      };
    }
  }, [socket]);

  return {
    socket,
    isConnected,
    connectionError,
    connect,
    disconnect,
  };
}
