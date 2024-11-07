"use client";

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { Bot, Loader2, AlertCircle } from 'lucide-react';
import { ScrollArea } from "@/components/ui/scroll-area";
import { useAuth } from "@/components/auth/auth-provider";
import { Progress } from "@/components/ui/progress";
import { apiClient, type ChatMessage } from "@/lib/api-client";
import { useToast } from "@/components/ui/use-toast";
import { MessageItem } from "@/components/chat/message-item";
import { ChatInput } from "@/components/chat/chat-input";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function ChatPage() {
  const { user, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [progress] = useState(79);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user) {
      console.log("User authenticated, loading chat history...");
      loadChatHistory();
    } else if (!authLoading) {
      console.log("No user found or not authenticated");
      setError("Authentication required");
    }
  }, [user, authLoading]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadChatHistory = async () => {
    try {
      console.log("Fetching chat history...");
      setIsLoading(true);
      setError(null);
      
      const response = await apiClient.getChatHistory();
      console.log("Chat history response:", response);
      
      if (response.status === "success" && response.data?.history) {
        // Ensure all messages have created_at
        const validMessages = response.data.history.map(msg => ({
          ...msg,
          created_at: msg.created_at || new Date().toISOString()
        }));
        setMessages(validMessages);
        console.log("Chat history loaded successfully");
      } else {
        throw new Error(response.message || "Failed to load chat history");
      }
    } catch (error) {
      console.error("Chat history error:", error);
      setError("Failed to load chat history. Please try again.");
      toast({
        title: "Error loading chat history",
        description: "Please refresh the page",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSend = async () => {
    if (!input.trim() && files.length === 0) return;
    if (isLoading) return;

    const currentInput = input;
    const currentFiles = [...files];
    
    setInput('');
    setFiles([]);
    setIsLoading(true);
    setError(null);

    console.log("Sending message:", { input: currentInput, filesCount: currentFiles.length });

    // Optimistically add user message
    const tempMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      user_id: user?.id || '',
      message: currentInput,
      response: '',
      created_at: new Date().toISOString(),
    };
    
    setMessages(prev => [...prev, tempMessage]);

    try {
      const response = await apiClient.sendMessage(currentInput, currentFiles);
      console.log("Message response:", response);
      
      if (response.status === "success" && response.data) {
        // Update the message with the response
        setMessages(prev => prev.map(msg => 
          msg.id === tempMessage.id
            ? {
                ...msg,
                id: response.data.id || msg.id,
                response: response.data.response,
                metadata: response.data.metadata,
                created_at: response.data.created_at || msg.created_at,
              }
            : msg
        ));
      } else {
        throw new Error(response.message || "Failed to send message");
      }
    } catch (error) {
      console.error("Send message error:", error);
      setError("Failed to send message");
      toast({
        title: "Failed to send message",
        description: "Please try again",
        variant: "destructive",
      });
      // Remove the optimistic message on error
      setMessages(prev => prev.filter(msg => msg.id !== tempMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-white/60" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Alert variant="destructive" className="max-w-md">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to access the chat.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_120%,rgba(120,119,198,0.3),rgba(255,255,255,0))]" />
      <Image
        src="https://images.unsplash.com/photo-1451187580459-43490279c0fa?q=80&w=2072&auto=format&fit=crop"
        alt="Abstract space background"
        fill
        className="object-cover opacity-30 mix-blend-overlay"
        priority
      />
      
      <div className="absolute inset-0 flex items-center justify-center p-4">
        <div className="bg-gradient-to-b from-white/[0.12] to-white/[0.08] dark:from-black/30 dark:to-black/20 backdrop-blur-xl rounded-3xl w-full max-w-[900px] h-[calc(100vh-6rem)] p-8 flex flex-col border border-white/20 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-saturate-200">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-3">
              <div className="flex space-x-2">
                <div className="w-3 h-3 rounded-full bg-red-500/90 shadow-lg shadow-red-500/20" />
                <div className="w-3 h-3 rounded-full bg-yellow-500/90 shadow-lg shadow-yellow-500/20" />
                <div className="w-3 h-3 rounded-full bg-green-500/90 shadow-lg shadow-green-500/20" />
              </div>
              <div className="h-5 w-[1px] bg-white/20" />
              <div className="flex items-center space-x-2">
                <Bot className="w-5 h-5 text-white/80" />
                <span className="text-white/80 text-sm font-medium tracking-wide">AI Assistant</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/20 animate-pulse" />
                <span className="text-white/80 text-sm">Online</span>
              </div>
              <div className="flex items-center space-x-2">
                <Progress value={progress} className="w-16 h-1 bg-white/10" />
                <span className="text-white/80 text-sm font-medium">{progress}%</span>
              </div>
            </div>
          </div>

          {/* Error Display */}
          {error && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Messages */}
          <ScrollArea className="flex-grow pr-4 mb-6">
            {isLoading && messages.length === 0 ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="h-8 w-8 animate-spin text-white/60" />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-white/60">
                <Bot className="w-12 h-12 mb-4" />
                <p className="text-lg font-medium">No messages yet</p>
                <p className="text-sm">Start a conversation with your AI assistant</p>
              </div>
            ) : (
              <div className="space-y-4">
                {messages.map((message) => (
                  <MessageItem key={message.id} message={message} user={user} />
                ))}
                <div ref={messagesEndRef} />
              </div>
            )}
          </ScrollArea>

          {/* Input */}
          <ChatInput
            input={input}
            setInput={setInput}
            files={files}
            setFiles={setFiles}
            onSend={handleSend}
            isLoading={isLoading}
          />
        </div>
      </div>
    </div>
  );
}