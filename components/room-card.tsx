"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Users, Crown, Play, Clock, Lock } from "lucide-react";
import { useState } from "react";
import { Input } from "@/components/ui/input";

interface Room {
  id: string;
  name: string;
  players: number;
  maxPlayers: number;
  status: "waiting" | "racing";
  host: string;
  difficulty: string;
  isPrivate?: boolean;
  guestCount: number;
  userCount: number;
  hostIsGuest: boolean;
}

interface RoomCardProps {
  room: Room;
  onJoin: (roomId: string, password?: string) => void;
}

export function RoomCard({ room, onJoin }: RoomCardProps) {
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [password, setPassword] = useState("");

  const isRacing = room.status === "racing";
  const isFull = room.players >= room.maxPlayers;

  const handleJoin = () => {
    if (room.isPrivate && !showPasswordInput) {
      setShowPasswordInput(true);
      return;
    }

    onJoin(room.id, room.isPrivate ? password : undefined);
    setShowPasswordInput(false);
    setPassword("");
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center">
            {room.name}
            {room.isPrivate && <Lock className="h-4 w-4 ml-2 text-gray-500" />}
          </CardTitle>
          <Badge variant={isRacing ? "default" : "secondary"}>
            {isRacing ? (
              <>
                <Play className="h-3 w-3 mr-1" />
                Racing
              </>
            ) : (
              <>
                <Clock className="h-3 w-3 mr-1" />
                Waiting
              </>
            )}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Room Info */}
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-1">
                <Users className="h-4 w-4 text-gray-500" />
                <span>
                  {room.players}/{room.maxPlayers}
                </span>
              </div>
              <Badge variant="outline" className="text-xs">
                {room.difficulty}
              </Badge>
              {(room.guestCount > 0 || room.userCount > 0) && (
                <div className="flex items-center space-x-2 text-xs text-gray-500">
                  {room.userCount > 0 && (
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-green-500 rounded-full mr-1" />
                      {room.userCount} users
                    </span>
                  )}
                  {room.guestCount > 0 && (
                    <span className="flex items-center">
                      <div className="w-2 h-2 bg-blue-500 rounded-full mr-1" />
                      {room.guestCount} guests
                    </span>
                  )}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-1 text-gray-500">
              <Crown className="h-3 w-3" />
              <span className="text-xs">
                {room.host}
                {room.hostIsGuest && (
                  <span className="text-blue-600"> (Guest)</span>
                )}
              </span>
            </div>
          </div>

          {/* Players Preview */}
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Players:</span>
            <div className="flex -space-x-2">
              {Array.from({ length: Math.min(room.players, 4) }).map((_, i) => (
                <Avatar key={i} className="h-6 w-6 border-2 border-white">
                  <AvatarImage src={`/placeholder.svg?height=24&width=24`} />
                  <AvatarFallback className="text-xs">
                    {String.fromCharCode(65 + i)}
                  </AvatarFallback>
                </Avatar>
              ))}
              {room.players > 4 && (
                <div className="h-6 w-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center">
                  <span className="text-xs text-gray-600">
                    +{room.players - 4}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Password Input */}
          {showPasswordInput && (
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Enter room password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleJoin()}
              />
            </div>
          )}

          {/* Action Button */}
          <div className="pt-2">
            {isFull ? (
              <Button disabled className="w-full">
                Room Full
              </Button>
            ) : (
              <Button
                onClick={handleJoin}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {isRacing ? (
                  <>
                    <Play className="h-4 w-4 mr-2" />
                    Spectate Race
                  </>
                ) : (
                  <>
                    <Users className="h-4 w-4 mr-2" />
                    {showPasswordInput ? "Join with Password" : "Join Race"}
                  </>
                )}
              </Button>
            )}
            {showPasswordInput && (
              <Button
                variant="outline"
                onClick={() => {
                  setShowPasswordInput(false);
                  setPassword("");
                }}
                className="w-full mt-2"
              >
                Cancel
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
