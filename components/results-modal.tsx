"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy, Target, Zap, Clock, RotateCcw, Share } from "lucide-react";

interface ResultsModalProps {
  isOpen: boolean;
  onClose: () => void;
  wpm: number;
  accuracy: number;
  errors: number;
  timeElapsed: number;
  onRestart: () => void;
}

export function ResultsModal({
  isOpen,
  onClose,
  wpm,
  accuracy,
  errors,
  timeElapsed,
  onRestart,
}: ResultsModalProps) {
  const getPerformanceLevel = (wpm: number) => {
    if (wpm >= 80)
      return { level: "Expert", color: "text-purple-600", bg: "bg-purple-100" };
    if (wpm >= 60)
      return { level: "Advanced", color: "text-blue-600", bg: "bg-blue-100" };
    if (wpm >= 40)
      return {
        level: "Intermediate",
        color: "text-green-600",
        bg: "bg-green-100",
      };
    if (wpm >= 20)
      return {
        level: "Beginner",
        color: "text-yellow-600",
        bg: "bg-yellow-100",
      };
    return { level: "Novice", color: "text-gray-600", bg: "bg-gray-100" };
  };

  const performance = getPerformanceLevel(wpm);

  const handleRestart = () => {
    onRestart();
    onClose();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open) {
          onClose();
        }
      }}
    >
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-center space-x-2">
            <Trophy className="h-6 w-6 text-yellow-500" />
            <span>Test Complete!</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Performance Badge */}
          <div className="text-center">
            <Badge
              className={`${performance.bg} ${performance.color} text-lg px-4 py-2`}
            >
              {performance.level} Typist
            </Badge>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="pt-4 text-center">
                <Zap className="h-6 w-6 text-blue-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-blue-600">{wpm}</div>
                <div className="text-sm text-gray-500">WPM</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 text-center">
                <Target className="h-6 w-6 text-green-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-green-600">
                  {accuracy}%
                </div>
                <div className="text-sm text-gray-500">Accuracy</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 text-center">
                <Clock className="h-6 w-6 text-purple-500 mx-auto mb-2" />
                <div className="text-2xl font-bold text-purple-600">
                  {timeElapsed}s
                </div>
                <div className="text-sm text-gray-500">Time</div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="pt-4 text-center">
                <div className="text-2xl font-bold text-red-600">{errors}</div>
                <div className="text-sm text-gray-500">Errors</div>
              </CardContent>
            </Card>
          </div>

          {/* Improvement Tips */}
          <Card className="bg-blue-50 dark:bg-blue-900/20">
            <CardContent className="pt-4">
              <h4 className="font-semibold mb-2">💡 Tip for Improvement</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                {accuracy < 90
                  ? "Focus on accuracy first - slow down and make fewer mistakes. Speed will naturally follow!"
                  : wpm < 40
                    ? "Great accuracy! Now try to increase your typing rhythm and speed."
                    : "Excellent work! Keep practicing to maintain consistency at higher speeds."}
              </p>
            </CardContent>
          </Card>

          {/* Action Buttons */}
          <div className="flex space-x-2">
            <Button onClick={handleRestart} className="flex-1">
              <RotateCcw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
            <Button variant="outline" className="flex-1 bg-transparent">
              <Share className="h-4 w-4 mr-2" />
              Share
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
