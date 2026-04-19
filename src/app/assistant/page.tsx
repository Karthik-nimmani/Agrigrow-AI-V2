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
  Sparkles,
  Trash2
} from 'lucide-react';
import { agriBotFarmAssistant } from '@/ai/flows/agri-bot-farm-assistant';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore, useUser, useCollection, useMemoFirebase, setDocumentNonBlocking, deleteDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, limit, doc, serverTimestamp, getDocs, writeBatch } from 'firebase/firestore';
import { useRouter } from 'next/navigation';

export default function AssistantPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('English');
  const [isBotThinking, setIsBotThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auth check
  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  // Chat messages query
  const messagesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'chatMessages'),
      orderBy('timestamp', 'asc'),
      limit(50)
    );
  }, [firestore, user]);

  const { data: messages, isLoading: isChatLoading } = useCollection(messagesQuery);

  // Auto scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isBotThinking]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isBotThinking || !user || !firestore) return;

    const userMessage = input.trim();
    setInput('');
    setIsBotThinking(true);

    // 1. Save User Message
    const userMsgId = crypto.randomUUID();
    const userMsgRef = doc(firestore, 'users', user.uid, 'chatMessages', userMsgId);
    setDocumentNonBlocking(userMsgRef, {
      id: userMsgId,
      userId: user.uid,
      timestamp: new Date().toISOString(),
      senderType: 'user',
      messageText: userMessage,
      language: language
    }, { merge: true });

    try {
      // 2. Call AI Bot
      const response = await agriBotFarmAssistant({
        question: userMessage,
        language: language
      });

      // 3. Save Bot Response
      const botMsgId = crypto.randomUUID();
      const botMsgRef = doc(firestore, 'users', user.uid, 'chatMessages', botMsgId);
      setDocumentNonBlocking(botMsgRef, {
        id: botMsgId,
        userId: user.uid,
        timestamp: new Date().toISOString(),
        senderType: 'bot',
        messageText: response.answer,
        language: language
      }, { merge: true });

    } catch (err) {
      console.error(err);
      // Save error message as bot response
      const errorMsgId = crypto.randomUUID();
      const errorMsgRef = doc(firestore, 'users', user.uid, 'chatMessages', errorMsgId);
      setDocumentNonBlocking(errorMsgRef, {
        id: errorMsgId,
        userId: user.uid,
        timestamp: new Date().toISOString(),
        senderType: 'bot',
        messageText: "I'm sorry, I'm having trouble processing your request. Please check your connection or try again later.",
        language: language
      }, { merge: true });
    } finally {
      setIsBotThinking(false);
    }
  };

  const clearChat = async () => {
    if (!user || !firestore || !messages) return;
    
    // Batch delete chat history
    const batch = writeBatch(firestore);
    messages.forEach(msg => {
      const msgRef = doc(firestore, 'users', user.uid, 'chatMessages', msg.id);
      batch.delete(msgRef);
    });
    
    try {
      await batch.commit();
    } catch (err) {
      console.error("Failed to clear chat:", err);
    }
  };

  if (isUserLoading || isChatLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-120px)] flex flex-col gap-4 p-4">
      <Card className="flex-1 flex flex-col border-none shadow-lg bg-white overflow-hidden rounded-3xl">
        <CardHeader className="bg-primary/5 border-b py-4 flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">Agri-Bot Assistant</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-primary" />
                Real-time Farm Intelligence
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-32 h-9 border-none bg-white shadow-sm rounded-xl">
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
            <Button variant="ghost" size="icon" onClick={clearChat} className="h-9 w-9 rounded-full hover:bg-destructive/10 hover:text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent 
          ref={scrollRef} 
          className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth"
        >
          {(!messages || messages.length === 0) && !isBotThinking && (
            <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40 py-20">
              <MessageSquare className="w-12 h-12" />
              <p className="text-sm font-medium max-w-xs">Ask Agri-Bot about soil health, weather risks, or crop optimization.</p>
            </div>
          )}

          {messages?.map((msg, i) => (
            <div key={msg.id || i} className={`flex ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
              <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${msg.senderType === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center mt-1 ${msg.senderType === 'user' ? 'bg-primary/10' : 'bg-accent/20'}`}>
                  {msg.senderType === 'user' ? <User className="w-4 h-4 text-primary" /> : <Bot className="w-4 h-4 text-accent-foreground" />}
                </div>
                <div className={`p-4 rounded-2xl shadow-sm ${msg.senderType === 'user' ? 'bg-primary text-primary-foreground rounded-tr-none' : 'bg-muted rounded-tl-none'}`}>
                  <p className="text-sm md:text-base leading-relaxed whitespace-pre-wrap">{msg.messageText}</p>
                </div>
              </div>
            </div>
          ))}

          {isBotThinking && (
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
            <Button type="submit" disabled={isBotThinking || !input.trim()} size="icon" className="h-12 w-12 rounded-full shrink-0 shadow-lg shadow-primary/20">
              <Send className="w-5 h-5" />
            </Button>
          </form>
          <p className="text-center text-[10px] text-muted-foreground mt-2 px-4 uppercase tracking-widest font-bold">
            Precision AI Advisor • Encrypted History
          </p>
        </div>
      </Card>
    </div>
  );
}
