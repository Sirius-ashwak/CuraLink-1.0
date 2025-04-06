import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";

// Define message types
type MessageType = "user" | "bot" | "system";

interface ChatMessage {
  id: string;
  type: MessageType;
  content: string;
  timestamp: Date;
}

export default function SymptomChecker() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      type: "system",
      content: "Welcome to the AI Health Assistant! Describe your symptoms, and I'll help identify possible conditions and when you should seek medical attention.",
      timestamp: new Date(),
    },
  ]);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  // Scroll to bottom of messages when messages update
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);
  
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    // Create a new user message
    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      type: "user",
      content: input,
      timestamp: new Date(),
    };
    
    // Add user message to chat
    setMessages(prev => [...prev, userMessage]);
    
    // Clear input
    setInput("");
    
    // Set loading state
    setIsLoading(true);
    
    try {
      // Add typing indicator
      setMessages(prev => [
        ...prev,
        {
          id: "typing",
          type: "system",
          content: "Analyzing symptoms...",
          timestamp: new Date(),
        },
      ]);
      
      // Make API request to symptom checker
      console.log("Sending chat request to API", {
        message: userMessage.content,
        historyLength: messages.filter(m => m.type !== "system").length
      });
      
      const chatResponse = await fetch("/api/ai-chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ 
          message: userMessage.content,
          history: messages
            .filter(m => m.type !== "system")
            .map(m => ({
              role: m.type === "user" ? "user" : "assistant",
              content: m.content
            }))
        }),
      });
      
      if (!chatResponse.ok) {
        console.error("API error:", chatResponse.status, await chatResponse.text());
        throw new Error(`API error: ${chatResponse.status}`);
      }
      
      const response = await chatResponse.json();
      console.log("API response:", response);
      
      // Remove typing indicator
      setMessages(prev => prev.filter(m => m.id !== "typing"));
      
      // Add bot response
      if (response && typeof response === 'object' && 'message' in response) {
        const botMessage: ChatMessage = {
          id: `bot-${Date.now()}`,
          type: "bot",
          content: response.message as string,
          timestamp: new Date(),
        };
        
        setMessages(prev => [...prev, botMessage]);
      } else {
        console.error("Unexpected response format:", response);
        throw new Error("Invalid response format");
      }
    } catch (error) {
      console.error("Failed to get AI response:", error);
      
      // Remove typing indicator
      setMessages(prev => prev.filter(m => m.id !== "typing"));
      
      // Add error message
      setMessages(prev => [
        ...prev,
        {
          id: `error-${Date.now()}`,
          type: "system",
          content: "Sorry, I couldn't process your request. Please try again.",
          timestamp: new Date(),
        },
      ]);
      
      toast({
        title: "Error",
        description: "Failed to get a response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const renderMessageContent = (content: string) => {
    // Simple markdown-like rendering
    return content.split("\n").map((line, i) => (
      <p key={i} className={line.startsWith("*") ? "font-semibold" : ""}>
        {line.startsWith("*") ? line.substring(1) : line}
      </p>
    ));
  };
  
  return (
    <div className="flex flex-col h-full">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
          >
            {message.type === "bot" && (
              <Avatar className="w-8 h-8 mr-2">
                <AvatarFallback className="bg-blue-600 text-white">AI</AvatarFallback>
              </Avatar>
            )}
            
            <div
              className={`px-4 py-2 rounded-lg max-w-[80%] ${
                message.type === "user"
                  ? "bg-blue-600 text-white rounded-tr-none"
                  : message.type === "bot"
                  ? "bg-gray-800 text-gray-100 rounded-tl-none border border-gray-700"
                  : "bg-gray-900 text-gray-400 text-sm italic border border-gray-800"
              }`}
            >
              {renderMessageContent(message.content)}
              <div className="text-xs opacity-70 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </div>
            </div>
            
            {message.type === "user" && (
              <Avatar className="w-8 h-8 ml-2">
                <AvatarFallback className="bg-blue-700 text-white">
                  {user?.firstName?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
            )}
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Input area */}
      <div className="border-t border-gray-800 p-4 bg-gray-900">
        <div className="flex">
          <Input
            placeholder="Describe your symptoms..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={isLoading}
            className="flex-1 mr-2 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
          />
          <Button 
            onClick={handleSendMessage} 
            disabled={isLoading || !input.trim()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </div>
        <p className="text-xs text-gray-400 mt-2">
          This AI assistant provides general health information. Always consult with a healthcare professional for medical advice.
        </p>
      </div>
    </div>
  );
}