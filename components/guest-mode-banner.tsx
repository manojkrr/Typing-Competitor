"use client";

import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { User, UserPlus, Download, Trash2, Info, X } from "lucide-react";
import Link from "next/link";
import { GuestStorageManager } from "@/lib/guest-storage";

interface GuestModeBannerProps {
  onDismiss?: () => void;
  showStats?: boolean;
}

export function GuestModeBanner({
  onDismiss,
  showStats = true,
}: GuestModeBannerProps) {
  const [dismissed, setDismissed] = useState(false);
  const [showInfo, setShowInfo] = useState(false);

  if (dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss?.();
  };

  const handleExportData = () => {
    const data = GuestStorageManager.exportData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `typing-stats-${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleClearData = () => {
    if (
      confirm(
        "Are you sure you want to clear all your guest data? This cannot be undone.",
      )
    ) {
      GuestStorageManager.clearData();
      window.location.reload();
    }
  };

  const stats = GuestStorageManager.getStats();

  return (
    <Card className="mb-6 border-blue-200 bg-blue-50 dark:bg-blue-900/20">
      <CardContent className="pt-6">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <User className="h-5 w-5 text-blue-600 mt-0.5" />
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <Badge
                  variant="outline"
                  className="bg-blue-100 text-blue-700 border-blue-300"
                >
                  Guest Mode
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowInfo(!showInfo)}
                  className="h-6 w-6 p-0"
                >
                  <Info className="h-3 w-3" />
                </Button>
              </div>

              <p className="text-sm text-blue-700 dark:text-blue-300 mb-3">
                You're practicing as a guest. Your progress is saved locally but
                won't sync across devices.
              </p>

              {showInfo && (
                <Alert className="mb-3 bg-blue-100 border-blue-200">
                  <Info className="h-4 w-4" />
                  <AlertDescription className="text-blue-800">
                    <strong>Guest Mode Features:</strong>
                    <ul className="mt-1 ml-4 list-disc text-xs space-y-1">
                      <li>Practice typing with full functionality</li>
                      <li>Track your progress locally on this device</li>
                      <li>Export your data anytime</li>
                      <li>No account required</li>
                    </ul>
                    <strong className="block mt-2">Limitations:</strong>
                    <ul className="mt-1 ml-4 list-disc text-xs space-y-1">
                      <li>Data doesn't sync across devices</li>
                      <li>No multiplayer racing</li>
                      <li>No global leaderboards</li>
                      <li>Data may be lost if browser storage is cleared</li>
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {showStats && stats.totalTests > 0 && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {stats.totalTests}
                    </div>
                    <div className="text-xs text-blue-600">Tests</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {stats.bestWpm}
                    </div>
                    <div className="text-xs text-blue-600">Best WPM</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {stats.bestAccuracy}%
                    </div>
                    <div className="text-xs text-blue-600">Best Accuracy</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-blue-600">
                      {Math.round(stats.totalTime / 60)}
                    </div>
                    <div className="text-xs text-blue-600">Minutes</div>
                  </div>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                <Link href="/auth/signup">
                  <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                    <UserPlus className="h-3 w-3 mr-1" />
                    Create Account
                  </Button>
                </Link>
                <Link href="/auth/signin">
                  <Button variant="outline" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Button variant="outline" size="sm" onClick={handleExportData}>
                  <Download className="h-3 w-3 mr-1" />
                  Export Data
                </Button>
                {stats.totalTests > 0 && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleClearData}
                    className="text-red-600 hover:text-red-700 bg-transparent"
                  >
                    <Trash2 className="h-3 w-3 mr-1" />
                    Clear Data
                  </Button>
                )}
              </div>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-6 w-6 p-0"
          >
            <X className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
