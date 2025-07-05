import express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import cors from "cors";

import type {
  ClientToServerEvents,
  InterServerEvents,
  RoomInfo,
  ServerToClientEvents,
  SocketData,
  TypedSocket,
} from "./types";
import type {
  ChatMessage,
  Player,
  RaceResult,
  Room,
  RoomListItem,
  User,
} from "@/types";
import {
  chatMessageSchema,
  roomCreateSchema,
  roomJoinSchema,
  socketUserDataSchema,
  typingUpdateSchema,
} from "@/lib/validation/schemas";
import {
  validateSocketData,
  ValidationError,
} from "@/lib/validation/middleware";
import process from "node:process";

const app = express();
const httpServer = createServer(app);

const PORT = process.env.PORT || 3001;

// Configure CORS for Socket.IO
const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>(httpServer, {
  cors: {
    origin:
      process.env.NODE_ENV === "development"
        ? `${process.env.CORS_ORIGIN}${PORT}`
        : process.env.CORS_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

app.use(cors());
app.use(express.json());

// In-memory storage (replace with database in production)
const rooms = new Map<string, Room>();
const users = new Map<string, User>();

// Sample texts for races
const raceTexts: string[] = [
  "The art of programming is the art of organizing complexity, of mastering multitude and avoiding its bastard chaos as effectively as possible. Programming is one of the most difficult branches of applied mathematics; the poorer mathematicians had better remain pure mathematicians.",
  "In the world of technology, innovation is the key to success. Companies that embrace change and adapt to new trends are the ones that thrive in the competitive market. The ability to think outside the box and create solutions that meet the evolving needs of consumers is what sets great organizations apart.",
  "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet and is commonly used for typing practice. It demonstrates the importance of accuracy and speed in typing, which are essential skills in today's digital world.",
  "Artificial intelligence and machine learning are transforming the way we work and live. From autonomous vehicles to smart home devices, these technologies are becoming increasingly integrated into our daily lives, promising a future of unprecedented convenience and efficiency.",
];

// Utility functions
function generateRoomId(): string {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
}

function getRoomText(): string {
  return raceTexts[Math.floor(Math.random() * raceTexts.length)] ?? "";
}

function calculateWPM(text: string, timeElapsed: number): number {
  const words = text.trim().split(" ").length;
  const minutes = timeElapsed / 60000; // Convert to minutes
  return Math.round(words / minutes) || 0;
}

function calculateAccuracy(originalText: string, typedText: string): number {
  let correct = 0;
  const minLength = Math.min(originalText.length, typedText.length);

  for (let i = 0; i < minLength; i++) {
    if (originalText[i] === typedText[i]) {
      correct++;
    }
  }

  return typedText.length > 0
    ? Math.round((correct / typedText.length) * 100)
    : 100;
}

function mapRoomToListItem(room: Room): RoomListItem {
  return {
    id: room.id,
    name: room.name,
    players: room.players.size,
    maxPlayers: room.maxPlayers,
    status: room.status,
    host: room.host,
    hostIsGuest: room.hostIsGuest,
    difficulty: room.difficulty,
    isPrivate: room.isPrivate,
    guestCount: room.guestCount,
    userCount: room.userCount,
  };
}

function mapRoomToInfo(room: Room): RoomInfo {
  return {
    id: room.id,
    name: room.name,
    host: room.host,
    hostIsGuest: room.hostIsGuest,
    maxPlayers: room.maxPlayers,
    difficulty: room.difficulty,
    status: room.status,
    text: room.text,
    guestCount: room.guestCount,
    userCount: room.userCount,
  };
}

function handleSocketError(
  socket: TypedSocket,
  error: unknown,
  context: string,
): void {
  console.error(`Socket error in ${context}:`, error);

  if (error instanceof ValidationError) {
    socket.emit("error", { message: `Validation error: ${error.message}` });
  } else {
    socket.emit("error", { message: "An unexpected error occurred" });
  }
}

// Socket.IO connection handling
io.on("connection", (socket: TypedSocket) => {
  console.log(`User connected: ${socket.id}`);

  // User joins with profile info
  socket.on("user:join", (userData) => {
    try {
      const validatedData = validateSocketData(socketUserDataSchema, userData);
      const isGuest = !validatedData.userId; // No userId means guest
      const guestId = isGuest ? `guest_${socket.id}` : validatedData.userId!;

      const user: User = {
        id: socket.id,
        userId: guestId,
        name: validatedData.name || `User${socket.id.substring(0, 4)}`,
        avatar: validatedData.avatar,
        isGuest: isGuest,
        joinedAt: new Date(),
      } as User;

      users.set(socket.id, user);

      console.log(`${isGuest ? "Guest" : "User"} ${validatedData.name} joined`);

      // Send current rooms list
      const roomsList: RoomListItem[] = Array.from(rooms.values()).map(
        mapRoomToListItem,
      );
      socket.emit("rooms:list", roomsList);
    } catch (error) {
      handleSocketError(socket, error, "user:join");
    }
  });

  // Create a new room
  socket.on("room:create", (roomData) => {
    try {
      const validatedData = validateSocketData(roomCreateSchema, roomData);
      const user = users.get(socket.id);
      if (!user) return;

      const roomId = generateRoomId();
      const room: Room = {
        id: roomId,
        name: validatedData.name,
        host: user.name,
        hostId: socket.id,
        hostIsGuest: user.isGuest,
        maxPlayers: validatedData.maxPlayers,
        difficulty: validatedData.difficulty,
        isPrivate: validatedData.isPrivate,
        password: validatedData.password,
        status: "waiting",
        players: new Map<string, Player>(),
        text: getRoomText(),
        raceResults: [],
        guestCount: 0,
        userCount: 0,
        createdAt: new Date(),
      } as Room;

      rooms.set(roomId, room);

      // Join the room
      socket.join(roomId);
      const player: Player = {
        ...user,
        progress: 0,
        wpm: 0,
        accuracy: 100,
        finished: false,
        typedText: "",
      };
      room.players.set(socket.id, player);

      // Update guest/user counts
      if (user.isGuest) {
        room.guestCount++;
      } else {
        room.userCount++;
      }

      user.currentRoom = roomId;

      socket.emit("room:joined", {
        room: mapRoomToInfo(room),
        players: Array.from(room.players.values()),
      });

      // Broadcast room creation to all users
      const roomsList: RoomListItem[] = Array.from(rooms.values()).map(
        mapRoomToListItem,
      );
      socket.broadcast.emit("rooms:updated", roomsList);

      console.log(
        `Room ${roomId} created by ${user.isGuest ? "guest" : "user"} ${user.name}`,
      );
    } catch (error) {
      handleSocketError(socket, error, "room:create");
    }
  });

  // Join an existing room
  socket.on("room:join", (data) => {
    try {
      const validatedData = validateSocketData(roomJoinSchema, data);
      const user = users.get(socket.id);
      const room = rooms.get(validatedData.roomId);

      if (!user || !room) {
        socket.emit("error", { message: "Room not found" });
        return;
      }

      if (room.players.size >= room.maxPlayers) {
        socket.emit("error", { message: "Room is full" });
        return;
      }

      if (room.isPrivate && validatedData.password !== room.password) {
        socket.emit("error", { message: "Invalid password" });
        return;
      }

      if (room.status === "racing") {
        socket.emit("error", { message: "Race already in progress" });
        return;
      }

      // Leave current room if in one
      if (user.currentRoom) {
        socket.leave(user.currentRoom);
        const currentRoom = rooms.get(user.currentRoom);
        if (currentRoom) {
          currentRoom.players.delete(socket.id);
          // Update counts
          if (user.isGuest) {
            currentRoom.guestCount = Math.max(0, currentRoom.guestCount - 1);
          } else {
            currentRoom.userCount = Math.max(0, currentRoom.userCount - 1);
          }
          socket
            .to(user.currentRoom)
            .emit("player:left", { playerId: socket.id });
        }
      }

      // Join new room
      socket.join(validatedData.roomId);
      const player: Player = {
        ...user,
        progress: 0,
        wpm: 0,
        accuracy: 100,
        finished: false,
        typedText: "",
      };
      room.players.set(socket.id, player);

      // Update counts
      if (user.isGuest) {
        room.guestCount++;
      } else {
        room.userCount++;
      }

      user.currentRoom = validatedData.roomId;

      // Send room data to joining player
      socket.emit("room:joined", {
        room: mapRoomToInfo(room),
        players: Array.from(room.players.values()),
      });

      // Notify other players
      socket.to(validatedData.roomId).emit("player:joined", {
        player: room.players.get(socket.id)!,
      });

      // Update rooms list for all users
      const roomsList: RoomListItem[] = Array.from(rooms.values()).map(
        mapRoomToListItem,
      );
      io.emit("rooms:updated", roomsList);

      console.log(
        `${user.isGuest ? "Guest" : "User"} ${user.name} joined room ${validatedData.roomId}`,
      );
    } catch (error) {
      handleSocketError(socket, error, "room:join");
    }
  });

  // Leave room
  socket.on("room:leave", () => {
    try {
      const user = users.get(socket.id);
      if (!user || !user.currentRoom) return;

      const room = rooms.get(user.currentRoom);
      if (room) {
        room.players.delete(socket.id);
        socket.leave(user.currentRoom);
        socket
          .to(user.currentRoom)
          .emit("player:left", { playerId: socket.id });

        // Update counts
        if (user.isGuest) {
          room.guestCount = Math.max(0, room.guestCount - 1);
        } else {
          room.userCount = Math.max(0, room.userCount - 1);
        }

        // If host left, assign new host or delete room
        if (room.hostId === socket.id) {
          if (room.players.size > 0) {
            const newHost = Array.from(room.players.values())[0] as Player;
            room.host = newHost.name;
            room.hostId = newHost.id;
            io.to(user.currentRoom).emit("room:host_changed", {
              newHost: newHost.name,
            });
          } else {
            if (room.countdownTimer) {
              clearInterval(room.countdownTimer);
            }
            rooms.delete(user.currentRoom);
          }
        }

        // Update rooms list
        const roomsList: RoomListItem[] = Array.from(rooms.values()).map(
          mapRoomToListItem,
        );
        io.emit("rooms:updated", roomsList);
      }

      user.currentRoom = undefined;
    } catch (error) {
      handleSocketError(socket, error, "room:leave");
    }
  });

  // Start race countdown
  socket.on("race:start", () => {
    try {
      const user = users.get(socket.id);
      if (!user || !user.currentRoom) return;

      const room = rooms.get(user.currentRoom);
      if (!room || room.hostId !== socket.id || room.status !== "waiting")
        return;

      room.status = "countdown";
      let countdown = 5;

      io.to(user.currentRoom).emit("race:countdown", { countdown });

      const countdownInterval = setInterval(() => {
        countdown--;
        if (countdown > 0) {
          io.to(user.currentRoom!).emit("race:countdown", { countdown });
        } else {
          clearInterval(countdownInterval);
          room.status = "racing";
          room.startTime = Date.now();

          // Reset all player stats
          room.players.forEach((player) => {
            player.progress = 0;
            player.wpm = 0;
            player.accuracy = 100;
            player.finished = false;
            player.finishTime = undefined;
            player.typedText = "";
          });

          io.to(user.currentRoom!).emit("race:started", {
            startTime: room.startTime,
            text: room.text,
          });
        }
      }, 1000);

      room.countdownTimer = countdownInterval;
    } catch (error) {
      handleSocketError(socket, error, "race:start");
    }
  });

  // Update typing progress
  socket.on("typing:update", (data) => {
    try {
      const validatedData = validateSocketData(typingUpdateSchema, data);
      const user = users.get(socket.id);
      if (!user || !user.currentRoom) return;

      const room = rooms.get(user.currentRoom);
      if (!room || room.status !== "racing" || !room.startTime) return;

      const player = room.players.get(socket.id);
      if (!player || player.finished) return;

      const { typedText } = validatedData;
      const progress = (typedText.length / room.text.length) * 100;
      const timeElapsed = Date.now() - room.startTime;
      const wpm = calculateWPM(typedText, timeElapsed);
      const accuracy = calculateAccuracy(room.text, typedText);

      // Update player stats
      player.progress = Math.min(progress, 100);
      player.wpm = wpm;
      player.accuracy = accuracy;
      player.typedText = typedText;

      // Check if player finished
      if (progress >= 100 && !player.finished) {
        player.finished = true;
        player.finishTime = Date.now();

        const placement = Array.from(room.players.values()).filter(
          (p) => p.finished,
        ).length;

        socket.emit("race:finished", {
          placement,
          wpm,
          accuracy,
          timeElapsed: timeElapsed / 1000,
        });

        // Check if all players finished
        const allFinished = Array.from(room.players.values()).every(
          (p) => p.finished,
        );
        if (allFinished) {
          room.status = "finished";
          const results: RaceResult[] = Array.from(room.players.values())
            .sort(
              (a, b) =>
                (a.finishTime || Number.POSITIVE_INFINITY) -
                (b.finishTime || Number.POSITIVE_INFINITY),
            )
            .map(
              (player, index) =>
                ({
                  placement: index + 1,
                  name: player.name,
                  wpm: player.wpm,
                  accuracy: player.accuracy,
                  finishTime: player.finishTime,
                  isGuest: player.isGuest,
                }) as RaceResult,
            );

          io.to(user.currentRoom).emit("race:all_finished", { results });
        }
      }

      // Broadcast progress to all players in room
      socket.to(user.currentRoom).emit("player:progress", {
        playerId: socket.id,
        progress: player.progress,
        wpm: player.wpm,
        accuracy: player.accuracy,
      });
    } catch (error) {
      handleSocketError(socket, error, "typing:update");
    }
  });

  // Chat message
  socket.on("chat:message", (data) => {
    try {
      const validatedData = validateSocketData(chatMessageSchema, data);
      const user = users.get(socket.id);
      if (!user || !user.currentRoom) return;

      const message: ChatMessage = {
        id: Date.now().toString(),
        userId: socket.id,
        userName: user.name,
        message: validatedData.message,
        timestamp: new Date().toISOString(),
        isGuest: user.isGuest,
      };

      io.to(user.currentRoom).emit("chat:message", message);
    } catch (error) {
      handleSocketError(socket, error, "chat:message");
    }
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    try {
      const user = users.get(socket.id);
      if (user && user.currentRoom) {
        const room = rooms.get(user.currentRoom);
        if (room) {
          room.players.delete(socket.id);
          socket
            .to(user.currentRoom)
            .emit("player:left", { playerId: socket.id });

          // Update counts
          if (user.isGuest) {
            room.guestCount = Math.max(0, room.guestCount - 1);
          } else {
            room.userCount = Math.max(0, room.userCount - 1);
          }

          // Handle host leaving
          if (room.hostId === socket.id) {
            if (room.players.size > 0) {
              const newHost = Array.from(room.players.values())[0] as Player;
              room.host = newHost.name;
              room.hostId = newHost.id;
              io.to(user.currentRoom).emit("room:host_changed", {
                newHost: newHost.name,
              });
            } else {
              // Clear any timers
              if (room.countdownTimer) {
                clearInterval(room.countdownTimer);
              }
              rooms.delete(user.currentRoom);
            }
          }

          // Update rooms list
          const roomsList: RoomListItem[] = Array.from(rooms.values()).map(
            mapRoomToListItem,
          );
          io.emit("rooms:updated", roomsList);
        }
      }

      users.delete(socket.id);
      console.log(`User disconnected: ${socket.id}`);
    } catch (error) {
      console.error("Error handling disconnect:", error);
    }
  });
});

// Health check endpoint
app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    rooms: rooms.size,
    users: users.size,
    timestamp: new Date().toISOString(),
  });
});

httpServer.listen(PORT, () => {
  console.log(`🚀 Socket.IO server running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
});

export { app, io };
