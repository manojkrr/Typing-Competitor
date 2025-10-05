"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, RotateCcw, Settings, BarChart3 } from "lucide-react";
import Link from "next/link";
import { TypingInterface } from "@/components/typing-interface";
import { TypingStats } from "@/components/typing-stats";
import { ResultsModal } from "@/components/results-modal";
import { PracticeStatistics } from "@/components/practice-statistics";
import { GuestModeBanner } from "@/components/guest-mode-banner";
import { useSession } from "next-auth/react";
import { GuestStorageManager } from "@/lib/guest-storage";

const sampleTexts = [
  "The quick brown fox jumps over the lazy dog. This pangram contains every letter of the alphabet and is commonly used for typing practice.",
  "In a hole in the ground there lived a hobbit. Not a nasty, dirty, wet hole, filled with the ends of worms and an oozy smell, nor yet a dry, bare, sandy hole with nothing in it to sit down on or to eat.",
  "To be or not to be, that is the question. Whether 'tis nobler in the mind to suffer the slings and arrows of outrageous fortune, or to take arms against a sea of troubles.",
  "It was the best of times, it was the worst of times, it was the age of wisdom, it was the age of foolishness, it was the epoch of belief, it was the epoch of incredulity.",
];

export default function SoloPage() {
  const { data: session, status } = useSession();
  const [currentText, setCurrentText] = useState("");
  const [userInput, setUserInput] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isActive, setIsActive] = useState(false);
  const [timeLeft, setTimeLeft] = useState(60);
  const [startTime, setStartTime] = useState<number | null>(null);
  const [wpm, setWpm] = useState(0);
  const [accuracy, setAccuracy] = useState(0);
  const [errors, setErrors] = useState(0);
  const [showResults, setShowResults] = useState(false);
  const [showStats, setShowStats] = useState(false);
  const [selectedTime, setSelectedTime] = useState(60);
  const [cheatDetection, setCheatDetection] = useState<any>(null);
  const [guestBannerDismissed, setGuestBannerDismissed] = useState(false);

  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const isGuest = status !== "loading" && !session;

  useEffect(() => {
    resetTest();
  }, []);

  const resetTest = useCallback(() => {
    const randomText =
      sampleTexts[Math.floor(Math.random() * sampleTexts.length)];
    setCurrentText(randomText);
    setUserInput("");
    setCurrentIndex(0);
    setIsActive(false);
    setTimeLeft(selectedTime);
    setStartTime(null);
    setWpm(0);
    setAccuracy(0);
    setErrors(0);
    setShowResults(false);
    setCheatDetection(null);

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
  }, [selectedTime]);

  const startTest = useCallback(() => {
    if (!isActive) {
      setIsActive(true);
      setStartTime(Date.now());

      intervalRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            setIsActive(false);
            setShowResults(true);
            if (intervalRef.current) {
              clearInterval(intervalRef.current);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
  }, [isActive]);

  const calculateStats = useCallback(() => {
    if (!startTime) return;

    const timeElapsed = (Date.now() - startTime) / 1000 / 60; // in minutes
    const wordsTyped = userInput.trim().split(" ").length;
    const currentWpm = Math.round(wordsTyped / timeElapsed) || 0;

    let correctChars = 0;
    const totalChars = userInput.length;

    for (let i = 0; i < Math.min(userInput.length, currentText.length); i++) {
      if (userInput[i] === currentText[i]) {
        correctChars++;
      }
    }

    const currentAccuracy =
      totalChars > 0 ? Math.round((correctChars / totalChars) * 100) : 0;
    const currentErrors = totalChars - correctChars;

    setWpm(currentWpm);
    setAccuracy(currentAccuracy);
    setErrors(currentErrors);
  }, [userInput, currentText, startTime]);

  useEffect(() => {
    if (isActive) {
      calculateStats();
    }
  }, [userInput, isActive, calculateStats]);

  const handleInputChange = (value: string) => {
    if (!isActive && value.length > 0) {
      setIsActive(true);
      startTest();
    }

    setUserInput(value);
    setCurrentIndex(value.length);

    if (value.length >= currentText.length) {
      setIsActive(false);
      setShowResults(true);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }
  };

  const handleCheatDetected = (cheatInfo: any) => {
    setCheatDetection(cheatInfo);
  };

  const handleTestComplete = async () => {
    const testResult = {
      wpm,
      accuracy,
      errors,
      timeElapsed: selectedTime - timeLeft,
      testType: "solo",
      cheatDetection,
    };

    if (session?.user?.id) {
      // Save to database for authenticated users
      try {
        await fetch("/api/stats", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(testResult),
        });
      } catch (error) {
        console.error("Error saving stats:", error);
      }
    } else {
      // Save to local storage for guests
      const guestResult = {
        wpm,
        accuracy,
        errors,
        timeElapsed: selectedTime - timeLeft,
        testType: "solo",
        timestamp: new Date().toISOString(),
        cheatDetected: cheatDetection?.isCheatDetected || false,
      };
      GuestStorageManager.updateStats(guestResult);
    }
  };

  useEffect(() => {
    if (showResults) {
      handleTestComplete();
    }
  }, [showResults]);

  const progress = (currentIndex / currentText.length) * 100;

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
            <h1 className="text-xl font-semibold">Solo Practice</h1>
            {isGuest && (
              <Badge
                variant="outline"
                className="bg-blue-100 text-blue-700 border-blue-300"
              >
                Guest Mode
              </Badge>
            )}
          </div>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowStats(!showStats)}
            >
              <BarChart3 className="h-4 w-4 mr-2" />
              {showStats ? "Hide Stats" : "Show Stats"}
            </Button>
            <Button variant="outline" size="sm" onClick={resetTest}>
              <RotateCcw className="h-4 w-4 mr-2" />
              Reset
            </Button>
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Guest Mode Banner */}
        {isGuest && !guestBannerDismissed && !showStats && (
          <GuestModeBanner onDismiss={() => setGuestBannerDismissed(true)} />
        )}

        {showStats ? (
          <PracticeStatistics userId={session?.user?.id} isGuest={isGuest} />
        ) : (
          <>
            {/* Test Configuration */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Test Settings</span>
                  <Badge variant={isActive ? "default" : "secondary"}>
                    {isActive ? "Active" : "Ready"}
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-4 items-center">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Mode:</span>
                    <div className="flex space-x-1">
                      {[15, 30, 60, 120].map((time) => (
                        <Button
                          key={time}
                          variant={
                            selectedTime === time ? "default" : "outline"
                          }
                          size="sm"
                          onClick={() => {
                            setSelectedTime(time);
                            setTimeLeft(time);
                          }}
                          disabled={isActive}
                        >
                          {time}s
                        </Button>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium">Time:</span>
                    <Badge variant="outline">{timeLeft}s</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Stats */}
            <TypingStats
              wpm={wpm}
              accuracy={accuracy}
              errors={errors}
              timeLeft={timeLeft}
            />

            {/* Progress */}
            <Card className="mb-6">
              <CardContent className="pt-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">Progress</span>
                  <span className="text-sm text-gray-500">
                    {Math.round(progress)}%
                  </span>
                </div>
                <Progress value={progress} className="h-2" />
              </CardContent>
            </Card>

            {/* Typing Interface */}
            <TypingInterface
              text={currentText}
              userInput={userInput}
              currentIndex={currentIndex}
              onInputChange={handleInputChange}
              isActive={isActive || userInput.length > 0}
              onCheatDetected={handleCheatDetected}
            />

            {/* Instructions */}
            {!isActive && userInput.length === 0 && (
              <Card className="mt-6">
                <CardContent className="pt-6 text-center">
                  <p className="text-gray-600 dark:text-gray-300">
                    Start typing to begin the test. Focus on accuracy first,
                    then speed will follow!
                  </p>
                  {isGuest && (
                    <p className="text-sm text-blue-600 dark:text-blue-400 mt-2">
                      💡 Create an account to sync your progress across devices
                      and access multiplayer features!
                    </p>
                  )}
                </CardContent>
              </Card>
            )}
          </>
        )}
      </div>

      {/* Results Modal */}
      <ResultsModal
        isOpen={showResults}
        onClose={() => setShowResults(false)}
        wpm={wpm}
        accuracy={accuracy}
        errors={errors}
        timeElapsed={selectedTime - timeLeft}
        onRestart={() => {
          setShowResults(false);
          resetTest();
        }}
      />
    </div>
  );
}
