"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Clock, Target, Zap, AlertTriangle } from "lucide-react";

interface TypingStatsProps {
  wpm: number;
  accuracy: number;
  errors: number;
  timeLeft: number;
}

export function TypingStats({
  wpm,
  accuracy,
  errors,
  timeLeft,
}: TypingStatsProps) {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Zap className="h-5 w-5 text-blue-500" />
            <div>
              <div className="text-2xl font-bold text-blue-600">{wpm}</div>
              <div className="text-sm text-gray-500">WPM</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Target className="h-5 w-5 text-green-500" />
            <div>
              <div className="text-2xl font-bold text-green-600">
                {accuracy}%
              </div>
              <div className="text-sm text-gray-500">Accuracy</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <div>
              <div className="text-2xl font-bold text-red-600">{errors}</div>
              <div className="text-sm text-gray-500">Errors</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center space-x-2">
            <Clock className="h-5 w-5 text-purple-500" />
            <div>
              <div className="text-2xl font-bold text-purple-600">
                {formatTime(timeLeft)}
              </div>
              <div className="text-sm text-gray-500">Time Left</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
