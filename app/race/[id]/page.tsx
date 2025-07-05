"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ArrowLeft, MessageCircle, Users, Trophy, Play } from "lucide-react";
import Link from "next/link";
import { TypingInterface } from "@/components/typing-interface";
import { RaceProgress } from "@/components/race-progress";
import { ChatPanel } from "@/components/chat-panel";
import { useMultiplayer } from "@/hooks/useMultiplayer";
import { useSocket } from "@/hooks/useSocket";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

export default function RacePage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [userInput, setUserInput] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showChat, setShowChat] = useState(false);
  const [placement, setPlacement] = useState<number | null>(null);

  const { isConnected } = useSocket();
  const {
    currentRoom,
    players,
    raceStatus,
    chatMessages,
    updateTyping,
    sendMessage,
    leaveRoom,
    startRace,
  } = useMultiplayer();
  const { status } = useSession();

  // Redirect if not connected or no room
  useEffect(() => {
    if (!isConnected) {
      router.push("/multiplayer");
    }
  }, [isConnected, router]);

  // Add after the existing useEffect for connection check
  useEffect(() => {
    // Allow both authenticated users and guests
    if (status !== "loading" && !isConnected) {
      router.push("/multiplayer");
    }
  }, [isConnected, router, status]);

  // Handle typing input changes
  const handleInputChange = useCallback(
    (value: string) => {
      if (raceStatus.status !== "racing") return;

      setUserInput(value);
      setCurrentIndex(value.length);
      updateTyping(value);
    },
    [raceStatus.status, updateTyping],
  );

  // Handle race start (host only)
  const handleStartRace = () => {
    if (
      currentRoom &&
      players.find((p) => p.isYou)?.name === currentRoom.host
    ) {
      startRace();
    }
  };

  // Handle leaving room
  const handleLeaveRoom = () => {
    leaveRoom();
    router.push("/multiplayer");
  };

  // Send chat message
  const handleSendMessage = (message: string) => {
    sendMessage(message);
  };

  if (!currentRoom) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Card>
          <CardContent className="pt-6 text-center">
            <p className="text-gray-500 mb-4">
              Room not found or connection lost
            </p>
            <Link href="/multiplayer">
              <Button>Back to Lobby</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isHost = players.find((p) => p.isYou)?.name === currentRoom.host;
  const canStartRace =
    isHost && raceStatus.status === "waiting" && players.length >= 2;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" onClick={handleLeaveRoom}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Leave Room
            </Button>
            <h1 className="text-xl font-semibold">{currentRoom.name}</h1>
            {isHost && (
              <Badge
                variant="outline"
                className="bg-yellow-50 text-yellow-700 border-yellow-200"
              >
                Host
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              variant="outline"
              className="bg-green-50 text-green-700 border-green-200"
            >
              <Users className="h-3 w-3 mr-1" />
              {players.length} Players
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowChat(!showChat)}
            >
              <MessageCircle className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Race Area */}
          <div className="lg:col-span-3">
            {/* Race Status */}
            {raceStatus.status === "waiting" && (
              <Card className="mb-6">
                <CardContent className="pt-6 text-center">
                  <h3 className="text-xl font-semibold mb-4">
                    Waiting for Race to Start
                  </h3>
                  <p className="text-gray-600 mb-4">
                    {players.length < 2
                      ? "Waiting for more players to join..."
                      : isHost
                        ? "You can start the race when ready!"
                        : `Waiting for ${currentRoom.host} to start the race...`}
                  </p>
                  {canStartRace && (
                    <Button
                      onClick={handleStartRace}
                      className="bg-gradient-to-r from-green-600 to-blue-600"
                    >
                      <Play className="h-4 w-4 mr-2" />
                      Start Race
                    </Button>
                  )}
                </CardContent>
              </Card>
            )}

            {raceStatus.status === "countdown" && raceStatus.countdown && (
              <Card className="mb-6 bg-gradient-to-r from-blue-500 to-purple-600 text-white">
                <CardContent className="pt-6 text-center">
                  <div className="text-6xl font-bold mb-2">
                    {raceStatus.countdown}
                  </div>
                  <p className="text-xl">Get ready to race!</p>
                </CardContent>
              </Card>
            )}

            {raceStatus.status === "finished" && placement && (
              <Card className="mb-6 bg-gradient-to-r from-green-500 to-blue-600 text-white">
                <CardContent className="pt-6 text-center">
                  <Trophy className="h-12 w-12 mx-auto mb-4" />
                  <div className="text-3xl font-bold mb-2">
                    {placement === 1
                      ? "🏆 Winner!"
                      : `${placement}${placement === 2 ? "nd" : placement === 3 ? "rd" : "th"} Place`}
                  </div>
                  <p className="text-lg">Great job!</p>
                </CardContent>
              </Card>
            )}

            {/* Race Progress */}
            <RaceProgress
              players={players.sort((a, b) => b.progress - a.progress)}
            />

            {/* Typing Interface */}
            {currentRoom.text && (
              <TypingInterface
                text={currentRoom.text}
                userInput={userInput}
                currentIndex={currentIndex}
                onInputChange={handleInputChange}
                isActive={raceStatus.status === "racing"}
                disabled={raceStatus.status !== "racing"}
              />
            )}

            {/* Instructions */}
            {raceStatus.status === "waiting" && (
              <Card className="mt-6">
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-600 dark:text-gray-300">
                    Get ready to race! The text will appear when the race
                    starts.
                  </p>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Live Rankings */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <Trophy className="h-4 w-4 mr-2" />
                  Live Rankings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {players
                    .sort((a, b) => b.progress - a.progress)
                    .map((player, index) => (
                      <div
                        key={player.id}
                        className={`flex items-center justify-between p-2 rounded ${
                          player.isYou
                            ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                            : ""
                        }`}
                      >
                        <div className="flex items-center space-x-2">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                              index === 0
                                ? "bg-yellow-500 text-white"
                                : index === 1
                                  ? "bg-gray-400 text-white"
                                  : index === 2
                                    ? "bg-amber-600 text-white"
                                    : "bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300"
                            }`}
                          >
                            {index + 1}
                          </div>
                          <Avatar className="h-6 w-6">
                            <AvatarImage
                              src={player.avatar || "/placeholder.svg"}
                            />
                            <AvatarFallback>{player.name[0]}</AvatarFallback>
                          </Avatar>
                          <span
                            className={`text-sm ${player.isYou ? "font-bold" : ""}`}
                          >
                            {player.name}
                            {player.name === currentRoom.host && (
                              <Badge variant="outline" className="ml-1 text-xs">
                                Host
                              </Badge>
                            )}
                          </span>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-bold">
                            {player.wpm} WPM
                          </div>
                          <div className="text-xs text-gray-500">
                            {Math.round(player.progress)}%
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Chat Panel */}
            {showChat && (
              <ChatPanel
                messages={chatMessages}
                onSendMessage={handleSendMessage}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
