"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  TrendingUp,
  Target,
  Clock,
  Trophy,
  AlertTriangle,
  Calendar,
  User,
} from "lucide-react";
import {
  GuestStorageManager,
  type GuestStats,
  type GuestTestResult,
} from "@/lib/guest-storage";

interface UserStats {
  totalTests: number;
  totalTime: number;
  bestWpm: number;
  averageWpm: number;
  bestAccuracy: number;
  averageAccuracy: number;
  totalWords: number;
  totalErrors: number;
  racesWon: number;
  racesPlayed: number;
}

interface TestResult {
  wpm: number;
  accuracy: number;
  errors: number;
  timeElapsed: number;
  testType: string;
  timestamp: string;
  cheatDetected: boolean;
}

interface PracticeStatisticsProps {
  userId?: string;
  isGuest?: boolean;
}

export function PracticeStatistics({
  userId,
  isGuest = false,
}: PracticeStatisticsProps) {
  const [stats, setStats] = useState<UserStats | GuestStats | null>(null);
  const [recentTests, setRecentTests] = useState<
    TestResult[] | GuestTestResult[]
  >([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isGuest) {
      fetchGuestStats();
    } else if (userId) {
      fetchUserStats();
    }
  }, [userId, isGuest]);

  const fetchGuestStats = () => {
    try {
      const guestStats = GuestStorageManager.getStats();
      const guestTests = GuestStorageManager.getRecentTests();
      setStats(guestStats);
      setRecentTests(guestTests);
    } catch (error) {
      console.error("Error fetching guest stats:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStats = async () => {
    try {
      const response = await fetch("/api/stats");
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setRecentTests(data.recentTests);
      }
    } catch (error) {
      console.error("Error fetching stats:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="pt-6">
                <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <Card>
        <CardContent className="pt-6 text-center">
          <p className="text-gray-500">
            No statistics available. Complete some tests to see your progress!
          </p>
        </CardContent>
      </Card>
    );
  }

  const chartData = recentTests.map((test, index) => ({
    test: `Test ${recentTests.length - index}`,
    wpm: test.wpm,
    accuracy: test.accuracy,
    date: new Date(test.timestamp).toLocaleDateString(),
  }));

  // Handle guest stats (no races data)
  const winRate =
    "racesPlayed" in stats && stats.racesPlayed > 0
      ? Math.round((stats.racesWon / stats.racesPlayed) * 100)
      : 0;
  const averageTestTime =
    stats.totalTests > 0 ? Math.round(stats.totalTime / stats.totalTests) : 0;
  const cheatDetectedCount = recentTests.filter(
    (test) => test.cheatDetected,
  ).length;

  return (
    <div className="space-y-6">
      {/* Guest Mode Indicator */}
      {isGuest && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <User className="h-5 w-5 text-blue-600" />
              <div>
                <div className="font-medium text-blue-700 dark:text-blue-300">
                  Guest Mode Statistics
                </div>
                <div className="text-sm text-blue-600 dark:text-blue-400">
                  Data stored locally on this device only
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5 text-blue-500" />
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {stats.bestWpm}
                </div>
                <div className="text-sm text-gray-500">Best WPM</div>
                <div className="text-xs text-gray-400">
                  Avg: {stats.averageWpm}
                </div>
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
                  {stats.bestAccuracy}%
                </div>
                <div className="text-sm text-gray-500">Best Accuracy</div>
                <div className="text-xs text-gray-400">
                  Avg: {stats.averageAccuracy}%
                </div>
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
                  {stats.totalTests}
                </div>
                <div className="text-sm text-gray-500">Tests Completed</div>
                <div className="text-xs text-gray-400">
                  {Math.round(stats.totalTime / 60)}min total
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              <div>
                {isGuest ? (
                  <>
                    <div className="text-2xl font-bold text-yellow-600">
                      {stats.totalWords}
                    </div>
                    <div className="text-sm text-gray-500">Words Typed</div>
                    <div className="text-xs text-gray-400">
                      {stats.totalErrors} errors
                    </div>
                  </>
                ) : (
                  <>
                    <div className="text-2xl font-bold text-yellow-600">
                      {winRate}%
                    </div>
                    <div className="text-sm text-gray-500">Win Rate</div>
                    <div className="text-xs text-gray-400">
                      {"racesWon" in stats &&
                        "racesPlayed" in stats &&
                        `${stats.racesWon}/${stats.racesPlayed} races`}
                    </div>
                  </>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Progress Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>WPM Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="test" />
                <YAxis />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="wpm"
                  stroke="#3b82f6"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Accuracy Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="test" />
                <YAxis domain={[0, 100]} />
                <Tooltip />
                <Line
                  type="monotone"
                  dataKey="accuracy"
                  stroke="#10b981"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Performance Breakdown</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Speed Consistency</span>
                <span>
                  {Math.round((stats.averageWpm / stats.bestWpm) * 100)}%
                </span>
              </div>
              <Progress
                value={(stats.averageWpm / stats.bestWpm) * 100}
                className="h-2"
              />
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Accuracy Consistency</span>
                <span>
                  {Math.round(
                    (stats.averageAccuracy / stats.bestAccuracy) * 100,
                  )}
                  %
                </span>
              </div>
              <Progress
                value={(stats.averageAccuracy / stats.bestAccuracy) * 100}
                className="h-2"
              />
            </div>

            <div className="pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Words Typed</span>
                <span className="font-medium">
                  {stats.totalWords.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Total Errors</span>
                <span className="font-medium text-red-600">
                  {stats.totalErrors}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Average Test Time</span>
                <span className="font-medium">{averageTestTime}s</span>
              </div>
              {isGuest && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Session Started</span>
                  <span className="font-medium">
                    {new Date(stats.sessionStarted).toLocaleDateString()}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentTests.slice(0, 5).map((test, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded"
                >
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <div className="text-sm font-medium">
                        {test.wpm} WPM • {test.accuracy}%
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(test.timestamp).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant="outline" className="text-xs">
                      {test.testType}
                    </Badge>
                    {test.cheatDetected && (
                      <AlertTriangle className="h-4 w-4 text-red-500" />
                    )}
                  </div>
                </div>
              ))}
              {recentTests.length === 0 && (
                <div className="text-center text-gray-500 py-4">
                  No tests completed yet
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Security Alert */}
      {cheatDetectedCount > 0 && (
        <Card className="border-red-200 bg-red-50 dark:bg-red-900/20">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <div className="font-medium text-red-700 dark:text-red-400">
                  Security Notice
                </div>
                <div className="text-sm text-red-600 dark:text-red-300">
                  {cheatDetectedCount} test(s) flagged for suspicious activity
                  in recent history
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
