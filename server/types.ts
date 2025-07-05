import type { Socket } from "socket.io";
import type {
  Player,
  RaceResult,
  ChatMessage,
  SocketUserData,
  RoomCreateData,
  RoomJoinData,
  TypingUpdateData,
  ChatMessageData,
  SocketError,
  RoomListItem,
  RaceFinishedData,
} from "../types";

export interface ServerToClientEvents {
  "rooms:list": (rooms: RoomListItem[]) => void;
  "rooms:updated": (rooms: RoomListItem[]) => void;
  "room:joined": (data: { room: RoomInfo; players: Player[] }) => void;
  "room:host_changed": (data: { newHost: string }) => void;
  "player:joined": (data: { player: Player }) => void;
  "player:left": (data: { playerId: string }) => void;
  "player:progress": (data: {
    playerId: string;
    progress: number;
    wpm: number;
    accuracy: number;
  }) => void;
  "race:countdown": (data: { countdown: number }) => void;
  "race:started": (data: { startTime: number; text: string }) => void;
  "race:finished": (data: RaceFinishedData) => void;
  "race:all_finished": (data: { results: RaceResult[] }) => void;
  "chat:message": (message: ChatMessage) => void;
  error: (error: SocketError) => void;
}

export interface ClientToServerEvents {
  "user:join": (userData: SocketUserData) => void;
  "room:create": (roomData: RoomCreateData) => void;
  "room:join": (data: RoomJoinData) => void;
  "room:leave": () => void;
  "race:start": () => void;
  "typing:update": (data: TypingUpdateData) => void;
  "chat:message": (data: ChatMessageData) => void;
}

export interface InterServerEvents {
  ping: () => void;
}

export interface SocketData {
  userId?: string;
  userName?: string;
  isGuest?: boolean;
}

export interface RoomInfo {
  id: string;
  name: string;
  host: string;
  hostIsGuest: boolean;
  maxPlayers: number;
  difficulty: string;
  status: string;
  text: string;
  guestCount: number;
  userCount: number;
}

export type TypedSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>;
