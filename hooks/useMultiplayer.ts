"use client";

import { useState, useEffect, useCallback } from "react";
import { useSocket } from "./useSocket";

interface Room {
  id: string;
  name: string;
  players: number;
  maxPlayers: number;
  status: "waiting" | "countdown" | "racing" | "finished";
  host: string;
  difficulty: string;
  isPrivate: boolean;
}

interface Player {
  id: string;
  name: string;
  avatar?: string;
  progress: number;
  wpm: number;
  accuracy?: number;
  finished?: boolean;
  isYou?: boolean;
  isGuest?: boolean;
}

interface RoomData {
  id: string;
  name: string;
  host: string;
  maxPlayers: number;
  difficulty: string;
  status: string;
  text: string;
}

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}

export function useMultiplayer() {
  const { socket, isConnected } = useSocket();
  const [rooms, setRooms] = useState<Room[]>([]);
  const [currentRoom, setCurrentRoom] = useState<RoomData | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [raceStatus, setRaceStatus] = useState<{
    status: "waiting" | "countdown" | "racing" | "finished";
    countdown?: number;
    startTime?: number;
  }>({ status: "waiting" });
  const [error, setError] = useState<string | null>(null);

  // Room management
  const createRoom = useCallback(
    (roomData: {
      name: string;
      maxPlayers: number;
      difficulty: string;
      isPrivate: boolean;
      password?: string;
    }) => {
      if (!socket) return;
      socket.emit("room:create", roomData);
    },
    [socket],
  );

  const joinRoom = useCallback(
    (roomId: string, password?: string) => {
      if (!socket) return;
      socket.emit("room:join", { roomId, password });
    },
    [socket],
  );

  const leaveRoom = useCallback(() => {
    if (!socket) return;
    socket.emit("room:leave");
    setCurrentRoom(null);
    setPlayers([]);
    setChatMessages([]);
    setRaceStatus({ status: "waiting" });
  }, [socket]);

  const startRace = useCallback(() => {
    if (!socket) return;
    socket.emit("race:start");
  }, [socket]);

  // Typing updates
  const updateTyping = useCallback(
    (typedText: string) => {
      if (!socket) return;
      socket.emit("typing:update", { typedText });
    },
    [socket],
  );

  // Chat
  const sendMessage = useCallback(
    (message: string) => {
      if (!socket) return;
      socket.emit("chat:message", { message });
    },
    [socket],
  );

  // Socket event listeners
  useEffect(() => {
    if (!socket) return;

    // Room events
    socket.on("rooms:list", (roomsList: Room[]) => {
      setRooms(roomsList);
    });

    socket.on("rooms:updated", (roomsList: Room[]) => {
      setRooms(roomsList);
    });

    socket.on("room:joined", (data: { room: RoomData; players: Player[] }) => {
      setCurrentRoom(data.room);
      setPlayers(
        data.players.map((p) => ({ ...p, isYou: p.id === socket.id })),
      );
      setError(null);
    });

    socket.on("player:joined", (data: { player: Player }) => {
      setPlayers((prev) => [
        ...prev,
        { ...data.player, isYou: data.player.id === socket.id },
      ]);
    });

    socket.on("player:left", (data: { playerId: string }) => {
      setPlayers((prev) => prev.filter((p) => p.id !== data.playerId));
    });

    socket.on("room:host_changed", (data: { newHost: string }) => {
      setCurrentRoom((prev) => (prev ? { ...prev, host: data.newHost } : null));
    });

    // Race events
    socket.on("race:countdown", (data: { countdown: number }) => {
      setRaceStatus({ status: "countdown", countdown: data.countdown });
    });

    socket.on("race:started", (data: { startTime: number; text: string }) => {
      setRaceStatus({ status: "racing", startTime: data.startTime });
      setCurrentRoom((prev) =>
        prev ? { ...prev, text: data.text, status: "racing" } : null,
      );
    });

    socket.on(
      "race:finished",
      (data: {
        placement: number;
        wpm: number;
        accuracy: number;
        timeElapsed: number;
      }) => {
        setRaceStatus({ status: "finished" });
        // Handle individual finish
      },
    );

    socket.on("race:all_finished", (data: { results: any[] }) => {
      setRaceStatus({ status: "finished" });
      // Handle race completion
    });

    socket.on(
      "player:progress",
      (data: {
        playerId: string;
        progress: number;
        wpm: number;
        accuracy: number;
      }) => {
        setPlayers((prev) =>
          prev.map((p) =>
            p.id === data.playerId
              ? {
                  ...p,
                  progress: data.progress,
                  wpm: data.wpm,
                  accuracy: data.accuracy,
                }
              : p,
          ),
        );
      },
    );

    // Chat events
    socket.on("chat:message", (message: ChatMessage) => {
      setChatMessages((prev) => [...prev, message]);
    });

    // Error handling
    socket.on("error", (data: { message: string }) => {
      setError(data.message);
    });

    return () => {
      socket.off("rooms:list");
      socket.off("rooms:updated");
      socket.off("room:joined");
      socket.off("player:joined");
      socket.off("player:left");
      socket.off("room:host_changed");
      socket.off("race:countdown");
      socket.off("race:started");
      socket.off("race:finished");
      socket.off("race:all_finished");
      socket.off("player:progress");
      socket.off("chat:message");
      socket.off("error");
    };
  }, [socket]);

  return {
    // Connection
    isConnected,
    error,

    // Room management
    rooms,
    currentRoom,
    players,
    createRoom,
    joinRoom,
    leaveRoom,
    startRace,

    // Race
    raceStatus,
    updateTyping,

    // Chat
    chatMessages,
    sendMessage,

    // Utilities
    clearError: () => setError(null),
  };
}
