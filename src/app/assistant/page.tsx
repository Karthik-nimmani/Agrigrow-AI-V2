
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
  AlertTriangle
} from 'lucide-react';
import { agriBotFarmAssistant } from '@/ai/flows/agri-bot-farm-assistant';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useFirestore, useUser, useCollection, useMemoFirebase, setDocumentNonBlocking } from '@/firebase';
import { collection, query, orderBy, limit, doc, writeBatch } from 'firebase/firestore';
import { useRouter } from 'next/navigation';
import { ScrollArea } from '@/components/ui/scroll-area';

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
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
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

    const timestamp = new Date().toISOString();

    // 1. Save User Message
    const userMsgId = crypto.randomUUID();
    const userMsgRef = doc(firestore, 'users', user.uid, 'chatMessages', userMsgId);
    setDocumentNonBlocking(userMsgRef, {
      id: userMsgId,
      userId: user.uid,
      timestamp,
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

    } catch (err: any) {
      const isQuotaError = err.message?.includes('429') || err.message?.toLowerCase().includes('quota');
      const isNotFoundError = err.message?.includes('404') || err.message?.toLowerCase().includes('not found');
      
      let errorMessage = `AI Error: ${err.message || "I encountered an unexpected problem. Please try again."}`;
      
      if (isQuotaError) {
        errorMessage = "I've reached my daily limit for free agricultural advice (30 requests/day). Please try again tomorrow!";
      } else if (isNotFoundError) {
        errorMessage = "The AI model configuration is temporarily unavailable. This is likely a maintenance issue with the Gemini service. Please try again in a few minutes.";
      }

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
    <div className="max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col p-4 overflow-hidden">
      <Card className="flex-1 flex flex-col border-none shadow-xl bg-white overflow-hidden rounded-3xl">
        <CardHeader className="bg-primary/5 border-b py-4 flex flex-row items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 rounded-full">
              <Bot className="w-5 h-5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg text-slate-900">Agri-Bot Assistant</CardTitle>
              <CardDescription className="flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-primary" />
                Real-time Farm Intelligence
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={language} onValueChange={setLanguage}>
              <SelectTrigger className="w-32 h-9 border-none bg-white shadow-sm rounded-xl text-xs">
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
        
        <CardContent className="flex-1 p-0 overflow-hidden relative bg-muted/5">
          <ScrollArea className="h-full">
            <div className="px-4 md:px-6 py-6 space-y-6">
              {(!messages || messages.length === 0) && !isBotThinking && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-40 py-20">
                  <MessageSquare className="w-12 h-12" />
                  <p className="text-sm font-medium max-w-xs">Ask Agri-Bot about soil health, weather risks, or crop optimization.</p>
                </div>
              )}

              {messages?.map((msg) => (
                <div key={msg.id} className={`flex ${msg.senderType === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}>
                  <div className={`flex gap-3 max-w-[85%] md:max-w-[70%] ${msg.senderType === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className={`h-8 w-8 rounded-full shrink-0 flex items-center justify-center mt-1 ${msg.senderType === 'user' ? 'bg-primary/10' : 'bg-accent/20'}`}>
                      {msg.senderType === 'user' ? <User className="w-4 h-4 text-primary" /> : <Bot className="w-4 h-4 text-accent-foreground" />}
                    </div>
                    <div className={`p-4 rounded-2xl shadow-sm ${
                      msg.senderType === 'user' 
                        ? 'bg-primary text-primary-foreground rounded-tr-none' 
                        : msg.isError 
                          ? 'bg-destructive/10 text-destructive border border-destructive/20 rounded-tl-none' 
                          : 'bg-white rounded-tl-none border border-border text-slate-800'
                    }`}>
                      {msg.isError && <AlertTriangle className="w-4 h-4 mb-2" />}
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
                    <div className="bg-white p-4 rounded-2xl rounded-tl-none flex items-center gap-2 border border-border">
                      <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce"></span>
                      <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                      <span className="w-1.5 h-1.5 bg-muted-foreground/40 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} className="h-4" />
            </div>
          </ScrollArea>
        </CardContent>

        <div className="p-4 border-t bg-white shrink-0">
          <form onSubmit={handleSend} className="flex gap-2">
            <Input 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about fertilizer, weather, or crop care..." 
              className="h-12 rounded-full px-6 bg-muted/30 border-none focus-visible:ring-primary shadow-inner"
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
