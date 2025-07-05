export interface User {
  _id?: string;
  id: string;
  userId: string;
  name: string;
  email?: string;
  avatar?: string;
  isGuest: boolean;
  currentRoom?: string | undefined;
  joinedAt: Date;
  createdAt?: Date;
  stats?: UserStats;
  preferences?: UserPreferences;
}

export interface UserStats {
  totalTests: number;
  totalTime: number;
  bestWpm: number;
  averageWpm: number;
  bestAccuracy: number;
  averageAccuracy: number;
  totalWords: number;
  totalErrors: number;
  racesWon: number;
  racesPlayed: number;
}

export interface UserPreferences {
  soundEnabled: boolean;
  theme: "light" | "dark" | "system";
}

export interface Room {
  id: string;
  name: string;
  host: string;
  hostId: string;
  hostIsGuest: boolean;
  maxPlayers: number;
  difficulty: "easy" | "medium" | "hard";
  isPrivate: boolean;
  password?: string;
  status: "waiting" | "countdown" | "racing" | "finished";
  players: Map<string, Player>;
  text: string;
  startTime?: number;
  countdownTimer?: NodeJS.Timeout;
  raceResults: RaceResult[];
  guestCount: number;
  userCount: number;
  createdAt: Date;
}

export interface Player {
  id: string;
  userId?: string;
  name: string;
  avatar?: string;
  isGuest: boolean;
  progress: number;
  wpm: number;
  accuracy: number;
  finished: boolean;
  finishTime?: number | undefined;
  typedText: string;
  isYou?: boolean;
}

export interface RaceResult {
  placement: number;
  name: string;
  wpm: number;
  accuracy: number;
  finishTime?: number;
  isGuest: boolean;
}

export interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
  isGuest?: boolean;
}

export interface RaceStatus {
  status: "waiting" | "countdown" | "racing" | "finished";
  countdown?: number;
  startTime?: number;
}

export interface CheatDetectionResult {
  isCheatDetected: boolean;
  cheatType: string[];
  confidence: number;
  details: string[];
}

export interface TestResult {
  wpm: number;
  accuracy: number;
  errors: number;
  timeElapsed: number;
  testType: string;
  timestamp: string;
  cheatDetected: boolean;
  cheatDetection?: CheatDetectionResult;
}

export interface SocketUserData {
  name: string;
  avatar?: string;
  userId?: string;
}

export interface RoomCreateData {
  name: string;
  maxPlayers: number;
  difficulty: "easy" | "medium" | "hard";
  isPrivate: boolean;
  password?: string;
}

export interface RoomJoinData {
  roomId: string;
  password?: string;
}

export interface TypingUpdateData {
  typedText: string;
}

export interface ChatMessageData {
  message: string;
}

export interface SocketError {
  message: string;
}

export interface RoomListItem {
  id: string;
  name: string;
  players: number;
  maxPlayers: number;
  status: "waiting" | "countdown" | "racing" | "finished";
  host: string;
  hostIsGuest: boolean;
  difficulty: string;
  isPrivate: boolean;
  guestCount: number;
  userCount: number;
}

export interface RaceFinishedData {
  placement: number;
  wpm: number;
  accuracy: number;
  timeElapsed: number;
}

export interface DatabaseUser {
  _id?: import("mongodb").ObjectId;
  email: string;
  password: string;
  name: string;
  createdAt: Date;
  stats: UserStats;
  preferences: UserPreferences;
  lastActive?: Date;
}

export interface DatabaseTestResult {
  _id?: import("mongodb").ObjectId;
  userId: import("mongodb").ObjectId;
  wpm: number;
  accuracy: number;
  errors: number;
  timeElapsed: number;
  testType: string;
  cheatDetection?: CheatDetectionResult;
  timestamp: Date;
  ip: string;
}
