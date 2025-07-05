"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Keyboard,
  Users,
  Trophy,
  Zap,
  Target,
  Clock,
  User,
} from "lucide-react";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { GuestModeBanner } from "@/components/guest-mode-banner";
import { useSession, signOut } from "next-auth/react";

export default function HomePage() {
  const { data: session, status } = useSession();
  const [stats] = useState({
    totalUsers: 12847,
    activeRaces: 23,
    recordWPM: 187,
  });
  const [guestBannerDismissed, setGuestBannerDismissed] = useState(false);

  const isGuest = status !== "loading" && !session;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      {/* Header */}
      <header className="border-b bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Keyboard className="h-8 w-8 text-blue-600" />
            <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Typing Competitor
            </h1>
          </div>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            {session ? (
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600 dark:text-gray-300">
                  Welcome, {session.user?.name}
                </span>
                <Button variant="outline" onClick={() => signOut()}>
                  Sign Out
                </Button>
              </div>
            ) : (
              <>
                {isGuest && (
                  <Badge
                    variant="outline"
                    className="bg-blue-100 text-blue-700 border-blue-300"
                  >
                    <User className="h-3 w-3 mr-1" />
                    Guest Mode
                  </Badge>
                )}
                <Link href="/auth/signin">
                  <Button variant="outline">Sign In</Button>
                </Link>
                <Link href="/auth/signup">
                  <Button>Sign Up</Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4">
        {/* Guest Mode Banner */}
        {isGuest && !guestBannerDismissed && (
          <div className="py-4">
            <GuestModeBanner
              onDismiss={() => setGuestBannerDismissed(true)}
              showStats={false}
            />
          </div>
        )}

        {/* Hero Section */}
        <section className="py-16 text-center">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-4">
              🚀 New: Real-time Multiplayer Racing
            </Badge>
            <h2 className="text-5xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
              Master Your Typing Speed
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
              Challenge yourself and compete with friends in real-time typing
              races. Improve your WPM, track your progress, and become a typing
              champion.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/solo">
                <Button
                  size="lg"
                  className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700"
                >
                  <Target className="mr-2 h-5 w-5" />
                  Start Solo Practice
                </Button>
              </Link>
              {session ? (
                <Link href="/multiplayer">
                  <Button size="lg" variant="outline">
                    <Users className="mr-2 h-5 w-5" />
                    Join Multiplayer Race
                  </Button>
                </Link>
              ) : (
                <Link href="/auth/signup">
                  <Button size="lg" variant="outline">
                    <Users className="mr-2 h-5 w-5" />
                    Sign Up for Multiplayer
                  </Button>
                </Link>
              )}
            </div>

            {/* Guest Mode Info */}
            {isGuest && (
              <Card className="mb-12 max-w-2xl mx-auto border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-center space-x-2 mb-2">
                    <User className="h-5 w-5 text-blue-600" />
                    <span className="font-medium text-blue-700 dark:text-blue-300">
                      You're in Guest Mode
                    </span>
                  </div>
                  <p className="text-sm text-blue-600 dark:text-blue-400 mb-4">
                    Practice typing and track your progress locally. Create an
                    account to unlock multiplayer racing and sync your data
                    across devices.
                  </p>
                  <div className="flex justify-center space-x-2">
                    <Link href="/auth/signup">
                      <Button
                        size="sm"
                        className="bg-blue-600 hover:bg-blue-700"
                      >
                        Create Account
                      </Button>
                    </Link>
                    <Link href="/auth/signin">
                      <Button variant="outline" size="sm">
                        Sign In
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-2xl mx-auto">
              <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {stats.totalUsers.toLocaleString()}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Active Typists
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {stats.activeRaces}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Live Races
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/60 dark:bg-gray-800/60 backdrop-blur-sm border-0 shadow-lg">
                <CardContent className="p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {stats.recordWPM}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-300">
                    Record WPM
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-16">
          <div className="text-center mb-12">
            <h3 className="text-3xl font-bold mb-4">
              Why Choose Typing Competitor?
            </h3>
            <p className="text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Experience the most advanced typing platform with real-time
              multiplayer, detailed analytics, and engaging challenges.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Zap className="h-12 w-12 text-yellow-500 mb-4" />
                <CardTitle>Real-time Racing</CardTitle>
                <CardDescription>
                  Compete with friends in lag-free, real-time typing races with
                  live progress tracking.
                  {isGuest && (
                    <span className="text-blue-600"> (Account required)</span>
                  )}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Target className="h-12 w-12 text-blue-500 mb-4" />
                <CardTitle>Accuracy Training</CardTitle>
                <CardDescription>
                  Improve both speed and accuracy with intelligent feedback and
                  personalized practice modes.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Trophy className="h-12 w-12 text-purple-500 mb-4" />
                <CardTitle>Achievements</CardTitle>
                <CardDescription>
                  Unlock badges, climb leaderboards, and track your progress
                  with detailed statistics.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Clock className="h-12 w-12 text-green-500 mb-4" />
                <CardTitle>Multiple Modes</CardTitle>
                <CardDescription>
                  Practice with timed tests, quotes, custom text, or challenge
                  modes to keep improving.
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Users className="h-12 w-12 text-red-500 mb-4" />
                <CardTitle>Social Features</CardTitle>
                <CardDescription>
                  Create rooms, invite friends, chat during races, and build
                  your typing community.
                  {isGuest && (
                    <span className="text-blue-600"> (Account required)</span>
                  )}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white dark:bg-gray-800 border-0 shadow-lg hover:shadow-xl transition-shadow">
              <CardHeader>
                <Keyboard className="h-12 w-12 text-indigo-500 mb-4" />
                <CardTitle>Smart Analytics</CardTitle>
                <CardDescription>
                  Get detailed insights into your typing patterns, weak keys,
                  and improvement areas.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </section>

        {/* CTA Section */}
        <section className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-16 rounded-lg mb-16">
          <div className="text-center">
            <h3 className="text-3xl font-bold mb-4">
              Ready to Become a Typing Champion?
            </h3>
            <p className="text-xl mb-8 opacity-90">
              {isGuest
                ? "Start practicing now or create an account to unlock all features!"
                : "Join thousands of typists improving their skills every day."}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/solo">
                <Button size="lg" variant="secondary">
                  Start Free Practice
                </Button>
              </Link>
              {isGuest ? (
                <Link href="/auth/signup">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent"
                  >
                    Create Account
                  </Button>
                </Link>
              ) : (
                <Link href="/multiplayer">
                  <Button
                    size="lg"
                    variant="outline"
                    className="text-white border-white hover:bg-white hover:text-blue-600 bg-transparent"
                  >
                    Challenge Friends
                  </Button>
                </Link>
              )}
            </div>
          </div>
        </section>
      </div>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-900 border-t py-8">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-300">
          <p>&copy; 2024 Typing Competitor. Built with Next.js and ❤️</p>
        </div>
      </footer>
    </div>
  );
}
