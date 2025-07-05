import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { getDatabase } from "./mongodb";
import { signInSchema, signUpSchema } from "./validation/schemas";
import type { DatabaseUser } from "@/types";

interface CredentialsInput {
  email: string;
  password: string;
  name?: string;
  isSignUp: string;
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
        name: { label: "Name", type: "text" },
        isSignUp: { label: "Is Sign Up", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const typedCredentials = credentials as CredentialsInput;

        const db = await getDatabase();
        const users = db.collection<DatabaseUser>("users");

        if (typedCredentials.isSignUp === "true") {
          // Validate sign up data
          const signUpData = signUpSchema.parse({
            name: typedCredentials.name || typedCredentials.email.split("@")[0],
            email: typedCredentials.email,
            password: typedCredentials.password,
            confirmPassword: typedCredentials.password, // For API, we assume password confirmation is handled on frontend
          });

          // Check if user already exists
          const existingUser = await users.findOne({ email: signUpData.email });
          if (existingUser) {
            throw new Error("User already exists");
          }

          const hashedPassword = await bcrypt.hash(signUpData.password, 12);
          const newUser: Omit<DatabaseUser, "_id"> = {
            email: signUpData.email,
            password: hashedPassword,
            name: signUpData.name,
            createdAt: new Date(),
            stats: {
              totalTests: 0,
              totalTime: 0,
              bestWpm: 0,
              averageWpm: 0,
              bestAccuracy: 0,
              averageAccuracy: 0,
              totalWords: 0,
              totalErrors: 0,
              racesWon: 0,
              racesPlayed: 0,
            },
            preferences: {
              soundEnabled: true,
              theme: "system",
            },
          };

          const result = await users.insertOne(newUser);
          return {
            id: result.insertedId.toString(),
            email: signUpData.email,
            name: signUpData.name,
          };
        } else {
          // Validate sign in data
          const signInData = signInSchema.parse({
            email: typedCredentials.email,
            password: typedCredentials.password,
          });

          // Find user
          const user = await users.findOne({ email: signInData.email });
          if (!user) {
            return null;
          }

          const isPasswordValid = await bcrypt.compare(
            signInData.password,
            user.password,
          );
          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user._id!.toString(),
            email: user.email,
            name: user.name,
          };
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
  },
  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id;
        session.user.name = session.user.name || "";
        session.user.email = session.user.email || "";
      }
      return session;
    },
  },
};
