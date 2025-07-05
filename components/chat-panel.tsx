"use client";

import type React from "react";

import { useState, useEffect, useRef } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { MessageCircle, Send } from "lucide-react";

interface ChatMessage {
  id: string;
  userId: string;
  userName: string;
  message: string;
  timestamp: string;
}

interface ChatPanelProps {
  messages: ChatMessage[];
  onSendMessage: (message: string) => void;
}

export function ChatPanel({ messages, onSendMessage }: ChatPanelProps) {
  const [newMessage, setNewMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      onSendMessage(newMessage.trim());
      setNewMessage("");
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center">
          <MessageCircle className="h-4 w-4 mr-2" />
          Chat ({messages.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Messages */}
          <div className="h-48 overflow-y-auto space-y-3 p-2 bg-gray-50 dark:bg-gray-800 rounded">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 text-sm py-4">
                No messages yet. Start the conversation!
              </div>
            ) : (
              messages.map((msg) => (
                <div key={msg.id} className="flex items-start space-x-2">
                  <Avatar className="h-6 w-6">
                    <AvatarFallback className="text-xs">
                      {msg.userName[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {msg.userName}
                      </span>
                      <span className="text-xs text-gray-500">
                        {formatTime(msg.timestamp)}
                      </span>
                    </div>
                    <p className="text-sm text-gray-700 dark:text-gray-300 break-words">
                      {msg.message}
                    </p>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="flex space-x-2">
            <Input
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              className="flex-1"
              maxLength={200}
            />
            <Button
              size="sm"
              onClick={handleSendMessage}
              disabled={!newMessage.trim()}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
