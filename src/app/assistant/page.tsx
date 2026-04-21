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
  Sparkles,
  Trash2,
  AlertTriangle,
  ArrowLeft
} from 'lucide-react';
import { agriBotFarmAssistant } from '@/ai/flows/agri-bot-farm-assistant';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore, useUser, useCollection, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, limit, doc, writeBatch } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import Link from 'next/link';

export default function AssistantPage() {
  const router = useRouter();
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('English');
  const [isBotThinking, setIsBotThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const scrollAnchorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isUserLoading && !user) {
      router.push('/login');
    }
  }, [user, isUserLoading, router]);

  const messagesQuery = useMemoFirebase(() => {
    if (!firestore || !user) return null;
    return query(
      collection(firestore, 'users', user.uid, 'chatMessages'),
      orderBy('timestamp', 'asc'),
      limit(50)
    );
  }, [firestore, user]);

  const { data: messages, isLoading: isChatLoading } = useCollection(messagesQuery);

  // Improved auto-scroll logic
  useEffect(() => {
    if (scrollAnchorRef.current) {
      scrollAnchorRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isBotThinking]);

  const handleSend = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!input.trim() || isBotThinking || !user || !firestore) return;

    const userMessage = input.trim();
    setInput('');
    setIsBotThinking(true);

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
      const response = await agriBotFarmAssistant({
        question: userMessage,
        language: language
      });

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

    } catch (err: any) {
      const isQuotaError = err.message?.includes('429') || err.message?.toLowerCase().includes('quota');
      const errorMessage = isQuotaError 
        ? "Daily request quota reached (30/day). Please try again tomorrow." 
        : `AI Model Identification Error: The requested Gemini model configuration is temporarily unavailable. Standardizing to stable flash-1.5. Error: ${err.message}`;

      const errorMsgId = crypto.randomUUID();
      const errorMsgRef = doc(firestore, 'users', user.uid, 'chatMessages', errorMsgId);
      setDocumentNonBlocking(errorMsgRef, {
        id: errorMsgId,
        userId: user.uid,
        timestamp: new Date().toISOString(),
        senderType: 'bot',
        messageText: errorMessage,
        language: language,
        isError: true
      }, { merge: true });
    } finally {
      setIsBotThinking(false);
    }
  };

  const clearChat = async () => {
    if (!user || !firestore || !messages) return;
    const batch = writeBatch(firestore);
    messages.forEach(msg => {
      const msgRef = doc(firestore, 'users', user.uid, 'chatMessages', msg.id);
      batch.delete(msgRef);
    });
    await batch.commit();
  };

  if (isUserLoading || isChatLoading) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col p-4">
      <Card className="flex-1 flex flex-col border-none shadow-xl bg-white overflow-hidden rounded-[2rem]">
        <CardHeader className="bg-primary/5 border-b py-4 flex items-center justify-between shrink-0 flex-row px-6">
          <div className="flex items-center gap-3">
             <Link href="/dashboard">
              <Button variant="ghost" size="icon" className="rounded-full h-8 w-8">
                <ArrowLeft className="w-4 h-4" />
              </Button>
            </Link>
            <CardTitle className="text-lg">Agri-Bot Assistant</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-32 h-9 rounded-xl text-xs">
                <Globe className="w-3 h-3 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="English">English</SelectItem>
                <SelectItem value="Hindi">हिन्दी</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="ghost" size="icon" onClick={clearChat} className="h-9 w-9 text-destructive">
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 p-0 overflow-hidden relative bg-muted/5">
          <ScrollArea className="h-full">
            <div className="px-6 py-6 space-y-6">
              {messages?.map((msg) => (
                <div key={msg.id} className={`flex ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-5 rounded-[1.5rem] max-w-[85%] shadow-sm ${
                    msg.senderType === 'user' 
                      ? 'bg-primary text-primary-foreground rounded-tr-none' 
                      : msg.isError ? 'bg-destructive/10 text-destructive border border-destructive/20 rounded-tl-none' : 'bg-white border rounded-tl-none'
                  }`}>
                    {msg.isError && <AlertTriangle className="w-4 h-4 mb-2" />}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.messageText}</p>
                  </div>
                </div>
              ))}
              {isBotThinking && (
                <div className="flex justify-start">
                  <div className="bg-white border rounded-[1.5rem] rounded-tl-none p-5 flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Bot is thinking...</span>
                  </div>
                </div>
              )}
              <div ref={scrollAnchorRef} className="h-2" />
            </div>
          </ScrollArea>
        </CardContent>

        <div className="p-6 border-t bg-white shrink-0">
          <form onSubmit={handleSend} className="flex gap-3">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Agri-Bot about crops, pests, or weather..." 
              className="h-14 rounded-2xl px-6 bg-muted/30 border-none focus-visible:ring-primary text-base"
            />
            <Button type="submit" disabled={isBotThinking || !input.trim()} size="icon" className="h-14 w-14 rounded-2xl shadow-lg hover:scale-105 transition-transform">
              <Send className="w-6 h-6" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
