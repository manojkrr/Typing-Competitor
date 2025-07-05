import { z } from "zod";

// User validation schemas
export const userStatsSchema = z.object({
  totalTests: z.number().min(0),
  totalTime: z.number().min(0),
  bestWpm: z.number().min(0),
  averageWpm: z.number().min(0),
  bestAccuracy: z.number().min(0).max(100),
  averageAccuracy: z.number().min(0).max(100),
  totalWords: z.number().min(0),
  totalErrors: z.number().min(0),
  racesWon: z.number().min(0),
  racesPlayed: z.number().min(0),
});

export const userPreferencesSchema = z.object({
  soundEnabled: z.boolean(),
  theme: z.enum(["light", "dark", "system"]),
});

export const userSchema = z.object({
  id: z.string(),
  userId: z.string(),
  name: z.string().min(1).max(50),
  email: z.string().email().optional(),
  avatar: z.string().url().optional(),
  isGuest: z.boolean(),
  currentRoom: z.string().optional(),
  joinedAt: z.date(),
  createdAt: z.date().optional(),
  stats: userStatsSchema.optional(),
  preferences: userPreferencesSchema.optional(),
});

// Room validation schemas
export const roomCreateSchema = z.object({
  name: z.string().min(1).max(30),
  maxPlayers: z.number().min(2).max(8),
  difficulty: z.enum(["easy", "medium", "hard"]),
  isPrivate: z.boolean(),
  password: z.string().min(1).max(20).optional(),
});

export const roomJoinSchema = z.object({
  roomId: z.string().min(1),
  password: z.string().optional(),
});

// Test result validation schemas
export const cheatDetectionSchema = z.object({
  isCheatDetected: z.boolean(),
  cheatType: z.array(z.string()),
  confidence: z.number().min(0).max(1),
  details: z.array(z.string()),
});

export const testResultSchema = z.object({
  wpm: z.number().min(0).max(500),
  accuracy: z.number().min(0).max(100),
  errors: z.number().min(0),
  timeElapsed: z.number().min(1),
  testType: z.string(),
  cheatDetection: cheatDetectionSchema.optional(),
});

// Socket event validation schemas
export const socketUserDataSchema = z.object({
  name: z.string().min(1).max(50),
  avatar: z.string().url().optional(),
  userId: z.string().optional(),
});

export const typingUpdateSchema = z.object({
  typedText: z.string().max(10000),
});

export const chatMessageSchema = z.object({
  message: z.string().min(1).max(200),
});

// Auth validation schemas
export const signInSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const signUpSchema = z
  .object({
    name: z.string().min(1).max(50),
    email: z.string().email(),
    password: z.string().min(6).max(100),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
  });

// Export types from schemas
export type UserStats = z.infer<typeof userStatsSchema>;
export type UserPreferences = z.infer<typeof userPreferencesSchema>;
export type User = z.infer<typeof userSchema>;
export type RoomCreateData = z.infer<typeof roomCreateSchema>;
export type RoomJoinData = z.infer<typeof roomJoinSchema>;
export type CheatDetectionResult = z.infer<typeof cheatDetectionSchema>;
export type TestResult = z.infer<typeof testResultSchema>;
export type SocketUserData = z.infer<typeof socketUserDataSchema>;
export type TypingUpdateData = z.infer<typeof typingUpdateSchema>;
export type ChatMessageData = z.infer<typeof chatMessageSchema>;
export type SignInData = z.infer<typeof signInSchema>;
export type SignUpData = z.infer<typeof signUpSchema>;
