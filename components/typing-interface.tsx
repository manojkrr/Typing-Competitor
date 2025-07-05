"use client";

import { useRef, useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Volume2, VolumeX, Shield, AlertTriangle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { CheatDetector } from "@/lib/cheat-detection";
import { soundManager } from "@/lib/sound-manager";

interface TypingInterfaceProps {
  text: string;
  userInput: string;
  currentIndex: number;
  onInputChange: (value: string) => void;
  isActive: boolean;
  disabled?: boolean;
  onCheatDetected?: (cheatInfo: any) => void;
}

export function TypingInterface({
  text,
  userInput,
  currentIndex,
  onInputChange,
  isActive,
  disabled = false,
  onCheatDetected,
}: TypingInterfaceProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const cheatDetectorRef = useRef<CheatDetector>(new CheatDetector());
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [cheatWarning, setCheatWarning] = useState<string | null>(null);
  const lastInputRef = useRef("");

  useEffect(() => {
    if (isActive && !disabled && textareaRef.current) {
      textareaRef.current.focus();
    }
  }, [isActive, disabled]);

  useEffect(() => {
    soundManager.setEnabled(soundEnabled);
  }, [soundEnabled]);

  useEffect(() => {
    if (isActive) {
      cheatDetectorRef.current.reset();
    }
  }, [isActive]);

  const handleInputChange = (value: string) => {
    if (disabled) return;

    const lastChar = value[value.length - 1];
    const expectedChar = text[value.length - 1];
    const isCorrect = lastChar === expectedChar;

    // Add to cheat detector
    if (value.length > lastInputRef.current.length) {
      cheatDetectorRef.current.addEvent(lastChar || "", isCorrect);

      // Play sound
      if (soundEnabled) {
        if (isCorrect) {
          soundManager.playSound("keypress");
        } else {
          soundManager.playSound("error");
        }
      }

      // Check for cheating every 10 characters
      if (value.length % 10 === 0 && value.length > 10) {
        const cheatResult = cheatDetectorRef.current.analyze();
        if (cheatResult.isCheatDetected) {
          setCheatWarning(
            `Suspicious activity detected: ${cheatResult.details[0]}`,
          );
          onCheatDetected?.(cheatResult);
        }
      }
    }

    lastInputRef.current = value;
    onInputChange(value);

    // Play finish sound when completed
    if (value.length === text.length && soundEnabled) {
      soundManager.playSound("finish");
    }
  };

  const renderText = () => {
    return text.split("").map((char, index) => {
      let className = "text-gray-400 dark:text-gray-500";

      if (index < userInput.length) {
        if (userInput[index] === char) {
          className = "text-green-600 bg-green-100 dark:bg-green-900/30";
        } else {
          className = "text-red-600 bg-red-100 dark:bg-red-900/30";
        }
      } else if (index === currentIndex) {
        className =
          "bg-blue-200 dark:bg-blue-800 text-blue-900 dark:text-blue-100 animate-pulse";
      }

      return (
        <span
          key={index}
          className={`${className} transition-colors duration-150`}
        >
          {char}
        </span>
      );
    });
  };

  return (
    <div className="space-y-4">
      {/* Controls */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? (
              <Volume2 className="h-4 w-4" />
            ) : (
              <VolumeX className="h-4 w-4" />
            )}
            <span className="ml-2">
              {soundEnabled ? "Sound On" : "Sound Off"}
            </span>
          </Button>
          {isActive && (
            <div className="flex items-center space-x-1 text-sm text-blue-600">
              <Shield className="h-3 w-3" />
              <span>Protected</span>
            </div>
          )}
        </div>
      </div>

      {/* Cheat Warning */}
      {cheatWarning && (
        <Alert className="border-red-200 bg-red-50">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription className="text-red-700">
            {cheatWarning}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setCheatWarning(null)}
              className="ml-2"
            >
              Dismiss
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Text Display */}
      <Card>
        <CardContent className="pt-6">
          <div
            className="text-lg leading-relaxed font-mono p-4 bg-gray-50 dark:bg-gray-800 rounded-lg min-h-[120px] select-none user-select-none pointer-events-none"
            style={{
              userSelect: "none",
              WebkitUserSelect: "none",
              MozUserSelect: "none",
              msUserSelect: "none",
              WebkitTouchCallout: "none",
              WebkitTapHighlightColor: "transparent",
            }}
            onContextMenu={(e) => e.preventDefault()}
            onSelectStart={(e) => e.preventDefault()}
            onDragStart={(e) => e.preventDefault()}
          >
            {renderText()}
          </div>
        </CardContent>
      </Card>

      {/* Input Area */}
      <Card>
        <CardContent className="pt-6">
          <Textarea
            ref={textareaRef}
            value={userInput}
            onChange={(e) => handleInputChange(e.target.value)}
            placeholder={
              disabled
                ? "Wait for the race to start..."
                : "Start typing here..."
            }
            disabled={disabled}
            className="min-h-[100px] text-lg font-mono resize-none"
            spellCheck={false}
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            onKeyDown={(e) => {
              // Prevent copy/paste shortcuts
              if (
                (e.ctrlKey || e.metaKey) &&
                (e.key === "c" ||
                  e.key === "v" ||
                  e.key === "x" ||
                  e.key === "a")
              ) {
                e.preventDefault();
              }
            }}
            onPaste={(e) => e.preventDefault()}
            onCopy={(e) => e.preventDefault()}
            onCut={(e) => e.preventDefault()}
          />
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-400 flex justify-between">
            <span>
              {userInput.length} / {text.length} characters
            </span>
            {isActive && (
              <span className="text-blue-600 flex items-center">
                <Shield className="h-3 w-3 mr-1" />
                Monitoring
              </span>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
