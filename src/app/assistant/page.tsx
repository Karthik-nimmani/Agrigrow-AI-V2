"use client";

import React, { useState, useRef, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  MessageSquare, 
  Send, 
  Loader2, 
  Globe, 
  User, 
  Bot,
  RefreshCw,
  Sparkles
} from 'lucide-react';
import { agriBotFarmAssistant } from '@/ai/flows/agri-bot-farm-assistant';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

type Message = {
  role: 'user' | 'bot';
  content: string;
};

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'bot', content: "Hello! I am Agri-Bot, your virtual farm advisor. How can I help you today?" }
  ]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('English');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsLoading(true);

    try {
      const response = await agriBotFarmAssistant({
        question: userMessage,
        language: language
      });
      setMessages(prev => [...prev, { role: 'bot', content: response.answer }]);
    } catch (err) {
      console.error(err);
      setMessages(prev => [...prev, { role: 'bot', content: "I'm sorry, I encountered an error. Please try again." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([{ role: 'bot', content: "Chat cleared. How can I assist you?" }]);
  };

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col gap-4">
      <Card className="flex-1 flex flex-col border-none shadow-lg bg-white overflow-hidden">
        <CardHeader className="bg-primary/5 border-b py-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Agri-Bot Assistant</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-primary" />
                Powered by AI
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-32 h-9">
                <Globe className="w-3 h-3 mr-2 text-muted-foreground" />
                <SelectValue placeholder="Language" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Hindi">हिन्दी</SelectItem>
                <SelectItem value="Punjabi">ਪੰਜਾਬੀ</SelectItem>
                <SelectItem value="Tamil">தமிழ்</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={clearChat} className="h-9 w-9 rounded-full">
              <RefreshCw className="w-4 h-4 text-muted-foreground" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent 
          ref={scrollRef} 
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth"
        >
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center mt-1 ${msg.role === 'user' ? 'bg-primary/10' : 'bg-accent/20'}`}>
                  {msg.role === 'user' ? <User className="w-4 h-4 text-primary" /> : <Bot className="w-4 h-4 text-accent-foreground" />}
                </div>
                <div className={`p-4 rounded-2xl shadow-sm ${msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted rounded-tl-none'}`}>
                  <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.content}</p>
                </div>
              </div>
            </div>
          ))}
          {isLoading && (
            <div className="flex justify-start">
              <div className="flex gap-3 max-w-[85%] md:max-w-[70%]">
                <div className="h-8 w-8 rounded-full bg-accent/20 shrink-0 flex items-center justify-center animate-pulse">
                  <Bot className="w-4 h-4 text-accent-foreground" />
                </div>
                <div className="bg-muted p-4 rounded-2xl rounded-tl-none flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              </div>
            </div>
          )}
        </CardContent>

        <div className="p-4 border-t bg-white">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about fertilizer, weather, or crop care..." 
              className="h-12 rounded-full px-6 bg-muted/30 border-none focus-visible:ring-primary"
            />
            <Button type="submit" disabled={isLoading} size="icon" className="h-12 w-12 rounded-full shrink-0">
              <Send className="w-5 h-5" />
            </Button>
          </form>
          <p className="text-center text-[10px] text-muted-foreground mt-2 px-4">
            AI can make mistakes. Please verify important agricultural decisions with local experts.
          </p>
        </div>
      </Card>
    </div>
  );
}
