"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Trophy, Zap } from "lucide-react";
import { Player } from "@/types";

interface RaceProgressProps {
  players: Player[];
}

export function RaceProgress({ players }: RaceProgressProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Trophy className="h-5 w-5 mr-2" />
          Race Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {players.map((player, index) => (
            <div
              key={player.id}
              className={`p-3 rounded-lg ${
                player.isYou
                  ? "bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800"
                  : "bg-gray-50 dark:bg-gray-800"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-3">
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
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={player.avatar || "/placeholder.svg"} />
                    <AvatarFallback>{player.name[0]}</AvatarFallback>
                  </Avatar>
                  <span
                    className={`font-medium ${player.isYou ? "text-blue-700 dark:text-blue-300" : ""}`}
                  >
                    {player.name}
                    {player.isYou && (
                      <Badge variant="outline" className="ml-2 text-xs">
                        You
                      </Badge>
                    )}
                    {player.isGuest && !player.isYou && (
                      <Badge
                        variant="outline"
                        className="ml-2 text-xs bg-blue-100 text-blue-700 border-blue-300"
                      >
                        Guest
                      </Badge>
                    )}
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <Zap className="h-4 w-4 text-blue-500" />
                  <span className="font-bold text-blue-600">
                    {player.wpm} WPM
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{Math.round(player.progress)}%</span>
                </div>
                <Progress value={player.progress} className="h-2" />
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
