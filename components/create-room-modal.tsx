"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Users, Lock } from "lucide-react";

interface CreateRoomModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateRoom: (roomData: {
    name: string;
    maxPlayers: number;
    difficulty: string;
    isPrivate: boolean;
    password?: string;
  }) => void;
}

export function CreateRoomModal({
  isOpen,
  onClose,
  onCreateRoom,
}: CreateRoomModalProps) {
  const [roomName, setRoomName] = useState("");
  const [maxPlayers, setMaxPlayers] = useState([4]);
  const [difficulty, setDifficulty] = useState("medium");
  const [isPrivate, setIsPrivate] = useState(false);
  const [password, setPassword] = useState("");

  const handleCreate = () => {
    if (!roomName.trim()) return;

    onCreateRoom({
      name: roomName.trim(),
      maxPlayers: maxPlayers[0],
      difficulty,
      isPrivate,
      password: isPrivate ? password : undefined,
    });

    // Reset form
    setRoomName("");
    setMaxPlayers([4]);
    setDifficulty("medium");
    setIsPrivate(false);
    setPassword("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Users className="h-5 w-5" />
            <span>Create New Room</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Room Name */}
          <div className="space-y-2">
            <Label htmlFor="room-name">Room Name</Label>
            <Input
              id="room-name"
              placeholder="Enter room name..."
              value={roomName}
              onChange={(e) => setRoomName(e.target.value)}
              maxLength={30}
            />
          </div>

          {/* Max Players */}
          <div className="space-y-3">
            <Label>Max Players: {maxPlayers[0]}</Label>
            <Slider
              value={maxPlayers}
              onValueChange={setMaxPlayers}
              max={8}
              min={2}
              step={1}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-gray-500">
              <span>2</span>
              <span>8</span>
            </div>
          </div>

          {/* Difficulty */}
          <div className="space-y-2">
            <Label>Difficulty</Label>
            <Select value={difficulty} onValueChange={setDifficulty}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="easy">Easy - Simple words</SelectItem>
                <SelectItem value="medium">Medium - Mixed content</SelectItem>
                <SelectItem value="hard">Hard - Complex text</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Private Room */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Lock className="h-4 w-4" />
              <Label htmlFor="private-room">Private Room</Label>
            </div>
            <Switch
              id="private-room"
              checked={isPrivate}
              onCheckedChange={setIsPrivate}
            />
          </div>

          {/* Password */}
          {isPrivate && (
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter room password..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                maxLength={20}
              />
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 bg-transparent"
            >
              Cancel
            </Button>
            <Button
              onClick={handleCreate}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600"
              disabled={!roomName.trim() || (isPrivate && !password.trim())}
            >
              Create Room
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
