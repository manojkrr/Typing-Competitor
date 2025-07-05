"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  ArrowLeft,
  Plus,
  Users,
  Crown,
  MessageCircle,
  Wifi,
  WifiOff,
  User,
} from "lucide-react";
import Link from "next/link";
import { RoomCard } from "@/components/room-card";
import { CreateRoomModal } from "@/components/create-room-modal";
import { useSocket } from "@/hooks/useSocket";
import { useMultiplayer } from "@/hooks/useMultiplayer";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSession } from "next-auth/react";
import { GuestMultiplayerBanner } from "@/components/guest-multiplayer-banner";

export default function MultiplayerPage() {
  const { data: session, status } = useSession();
  const [showCreateRoom, setShowCreateRoom] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"rooms" | "leaderboard">("rooms");
  const [userName, setUserName] = useState("");
  const [isNameSet, setIsNameSet] = useState(false);

  const { connect, isConnected, connectionError } = useSocket();
  const {
    rooms,
    error: multiplayerError,
    clearError,
    createRoom: createMultiplayerRoom,
    joinRoom,
  } = useMultiplayer();

  const isGuest = status !== "loading" && !session;
  const isAuthenticated = !!session;

  // Initialize connection when name is set or user is authenticated
  useEffect(() => {
    if (isAuthenticated && session.user?.name && !isConnected) {
      connect({ name: session.user.name });
      setIsNameSet(true);
    } else if (isNameSet && userName && !isConnected && isGuest) {
      connect({ name: userName });
    }
  }, [isNameSet, userName, isConnected, connect, isAuthenticated, session]);

  const handleSetName = () => {
    if (userName.trim()) {
      setIsNameSet(true);
    }
  };

  const handleCreateRoom = (roomData: any) => {
    createMultiplayerRoom(roomData);
    setShowCreateRoom(false);
  };

  const handleJoinRoom = (roomId: string, password?: string) => {
    joinRoom(roomId, password);
  };

  const filteredRooms = rooms.filter(
    (room) =>
      room.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      room.host.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  // Show name input for guests who want to join multiplayer
  if (isGuest && !isNameSet) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-4">
              <User className="h-8 w-8 text-blue-600" />
              <Badge
                variant="outline"
                className="bg-blue-100 text-blue-700 border-blue-300"
              >
                Guest Mode
              </Badge>
            </div>
            <CardTitle>Join Multiplayer as Guest</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-blue-200 bg-blue-50">
              <AlertDescription className="text-blue-700">
                <strong>Guest Multiplayer Features:</strong>
                <ul className="mt-1 ml-4 list-disc text-xs space-y-1">
                  <li>Join and create race rooms</li>
                  <li>Real-time racing with other players</li>
                  <li>Live chat during races</li>
                  <li>Session-based progress tracking</li>
                </ul>
                <strong className="block mt-2">Limitations:</strong>
                <ul className="mt-1 ml-4 list-disc text-xs space-y-1">
                  <li>No persistent race history</li>
                  <li>No global leaderboards</li>
                  <li>Progress resets when you leave</li>
                </ul>
              </AlertDescription>
            </Alert>

            <div>
              <label
                htmlFor="username"
                className="block text-sm font-medium mb-2"
              >
                Choose a display name for racing
              </label>
              <Input
                id="username"
                placeholder="Enter your racing name..."
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSetName()}
                maxLength={20}
              />
              <p className="text-xs text-gray-500 mt-1">
                This name will be visible to other racers during competitions
              </p>
            </div>

            <Button
              onClick={handleSetName}
              className="w-full"
              disabled={!userName.trim()}
            >
              Join Multiplayer Racing
            </Button>

            <div className="space-y-2">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-gray-500">Or</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <Link href="/auth/signup">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                  >
                    Create Account
                  </Button>
                </Link>
                <Link href="/auth/signin">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full bg-transparent"
                  >
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>

            <div className="text-center">
              <Link href="/">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Home
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show loading while checking authentication
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-500">Loading...</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Rest of the component remains the same for authenticated users
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Button>
            </Link>
            <h1 className="text-xl font-semibold">Multiplayer Racing</h1>
          </div>
          <div className="flex items-center space-x-2">
            <Badge
              variant="outline"
              className={
                isConnected
                  ? "bg-green-50 text-green-700 border-green-200"
                  : "bg-red-50 text-red-700 border-red-200"
              }
            >
              {isConnected ? (
                <>
                  <Wifi className="w-2 h-2 mr-2" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="w-2 h-2 mr-2" />
                  Connecting...
                </>
              )}
            </Badge>
            <span className="text-sm text-gray-600">{session?.user?.name}</span>
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {session?.user?.name?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Error Messages */}
        {(connectionError || multiplayerError) && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription>
              {connectionError || multiplayerError}
              <Button
                variant="ghost"
                size="sm"
                onClick={clearError}
                className="ml-2"
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Guest Multiplayer Banner */}
        {isGuest && isConnected && <GuestMultiplayerBanner />}

        {/* Rest of the component remains the same */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex space-x-1 mb-6 bg-gray-100 dark:bg-gray-800 p-1 rounded-lg">
              <Button
                variant={activeTab === "rooms" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("rooms")}
                className="flex-1"
              >
                <Users className="h-4 w-4 mr-2" />
                Race Rooms ({rooms.length})
              </Button>
              <Button
                variant={activeTab === "leaderboard" ? "default" : "ghost"}
                size="sm"
                onClick={() => setActiveTab("leaderboard")}
                className="flex-1"
              >
                <Crown className="h-4 w-4 mr-2" />
                Leaderboard
              </Button>
            </div>

            {activeTab === "rooms" && (
              <>
                {/* Room Controls */}
                <div className="flex flex-col sm:flex-row gap-4 mb-6">
                  <div className="flex-1">
                    <Input
                      placeholder="Search rooms or hosts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full"
                    />
                  </div>
                  <Button
                    onClick={() => setShowCreateRoom(true)}
                    className="bg-gradient-to-r from-blue-600 to-purple-600"
                    disabled={!isConnected}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Create Room
                  </Button>
                </div>

                {/* Rooms List */}
                <div className="space-y-4">
                  {!isConnected ? (
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <p className="text-gray-500 dark:text-gray-400">
                          Connecting to server...
                        </p>
                      </CardContent>
                    </Card>
                  ) : filteredRooms.length > 0 ? (
                    filteredRooms.map((room) => (
                      <RoomCard
                        key={room.id}
                        room={room}
                        onJoin={handleJoinRoom}
                      />
                    ))
                  ) : (
                    <Card>
                      <CardContent className="pt-6 text-center">
                        <p className="text-gray-500 dark:text-gray-400">
                          {searchQuery
                            ? "No rooms found matching your search."
                            : "No active rooms. Create one to get started!"}
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              </>
            )}

            {activeTab === "leaderboard" && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <Crown className="h-5 w-5 mr-2 text-yellow-500" />
                    Global Leaderboard
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    Leaderboard coming soon...
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Sidebar - keep existing sidebar content */}
          <div className="space-y-6">
            {/* Connection Status */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Connection Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-2">
                  {isConnected ? (
                    <>
                      <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
                      <span className="text-green-600">Connected</span>
                    </>
                  ) : (
                    <>
                      <div className="w-3 h-3 bg-yellow-500 rounded-full animate-pulse" />
                      <span className="text-yellow-600">Connecting...</span>
                    </>
                  )}
                </div>
                <div className="mt-2 text-sm text-gray-600">
                  Active Rooms: {rooms.length}
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Best WPM
                  </span>
                  <span className="font-bold text-blue-600">87</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Avg Accuracy
                  </span>
                  <span className="font-bold text-green-600">94%</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Races Won
                  </span>
                  <span className="font-bold text-purple-600">23</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-300">
                    Global Rank
                  </span>
                  <span className="font-bold text-orange-600">#1,247</span>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Races</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">
                      vs. Alice, Bob
                    </span>
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-200"
                    >
                      Won
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">
                      vs. Charlie
                    </span>
                    <Badge
                      variant="outline"
                      className="text-red-600 border-red-200"
                    >
                      Lost
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">
                      vs. Dave, Eve
                    </span>
                    <Badge
                      variant="outline"
                      className="text-green-600 border-green-200"
                    >
                      Won
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Online Friends */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center">
                  <MessageCircle className="h-4 w-4 mr-2" />
                  Online Friends
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {["Alice", "Bob", "Charlie"].map((friend) => (
                    <div
                      key={friend}
                      className="flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full" />
                        <span className="text-sm">{friend}</span>
                      </div>
                      <Button size="sm" variant="outline">
                        Invite
                      </Button>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Create Room Modal */}
      <CreateRoomModal
        isOpen={showCreateRoom}
        onClose={() => setShowCreateRoom(false)}
        onCreateRoom={handleCreateRoom}
      />
    </div>
  );
}
