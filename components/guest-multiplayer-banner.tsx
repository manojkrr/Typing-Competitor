"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, Info, Trophy, Users, MessageCircle } from "lucide-react";

export function GuestMultiplayerBanner() {
  return (
    <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
      <CardContent className="pt-6">
        <div className="flex items-start space-x-3">
          <User className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <Badge
                variant="outline"
                className="bg-blue-100 text-blue-700 border-blue-300"
              >
                Guest Racer
              </Badge>
              <Info className="h-3 w-3 text-blue-600" />
            </div>

            <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
              You're racing as a guest! You can compete in real-time races, but
              your results won't be saved permanently.
            </p>

            <Alert className="mb-3 bg-blue-100 border-blue-200">
              <Info className="h-4 w-4" />
              <AlertDescription className="text-blue-800">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <strong>✅ Available Features:</strong>
                    <ul className="mt-1 ml-4 list-disc text-xs space-y-1">
                      <li>
                        <Users className="inline h-3 w-3 mr-1" />
                        Join & create race rooms
                      </li>
                      <li>
                        <Trophy className="inline h-3 w-3 mr-1" />
                        Real-time competitive racing
                      </li>
                      <li>
                        <MessageCircle className="inline h-3 w-3 mr-1" />
                        Live chat with other racers
                      </li>
                      <li>Session-based progress tracking</li>
                    </ul>
                  </div>
                  <div>
                    <strong>⚠️ Guest Limitations:</strong>
                    <ul className="mt-1 ml-4 list-disc text-xs space-y-1">
                      <li>No permanent race history</li>
                      <li>No global leaderboard ranking</li>
                      <li>Progress resets when you leave</li>
                      <li>Limited to session statistics</li>
                    </ul>
                  </div>
                </div>
              </AlertDescription>
            </Alert>

            <div className="text-xs text-blue-600 dark:text-blue-400">
              💡 <strong>Tip:</strong> Create a free account to save your racing
              history and climb the global leaderboards!
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
