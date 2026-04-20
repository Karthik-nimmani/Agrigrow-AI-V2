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
  const messagesEndRef = useRef<HTMLDivElement>(null);

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

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
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
        : `AI Error: ${err.message || "Unknown error encountered."}`;

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
      <Card className="flex-1 flex flex-col border-none shadow-xl bg-white overflow-hidden rounded-3xl">
        <CardHeader className="bg-primary/5 border-b py-4 flex items-center justify-between shrink-0 flex-row">
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
            <div className="px-4 py-6 space-y-6">
              {messages?.map((msg) => (
                <div key={msg.id} className={`flex ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`p-4 rounded-2xl max-w-[85%] ${
                    msg.senderType === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : msg.isError ? 'bg-destructive/10 text-destructive border border-destructive/20' : 'bg-white border'
                  }`}>
                    {msg.isError && <AlertTriangle className="w-4 h-4 mb-2" />}
                    <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.messageText}</p>
                  </div>
                </div>
              ))}
              {isBotThinking && <Loader2 className="animate-spin text-primary" />}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          </ScrollArea>
        </CardContent>

        <div className="p-4 border-t bg-white shrink-0">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Agri-Bot..." 
              className="h-12 rounded-full px-6 bg-muted/30 border-none"
            />
            <Button type="submit" disabled={isBotThinking || !input.trim()} size="icon" className="h-12 w-12 rounded-full">
              <Send className="w-5 h-5" />
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}
