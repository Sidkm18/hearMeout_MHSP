'use client';

import { useState, useRef, useEffect, use } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Send, Bot, User, Loader } from 'lucide-react';
import { cn } from '@/lib/utils';
import { aiChatbot } from '@/ai/flows/ai-chatbot-with-mood-tracking';
import { useToast } from '@/hooks/use-toast';

type Message = {
  sender: 'user' | 'bot';
  text: string;
};

interface ChatbotModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mood: string;
}

export function ChatbotModal({ open, onOpenChange, mood }: ChatbotModalProps) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollAreaRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (open && messages.length === 0) {
        setIsLoading(true);
        aiChatbot({
            mood: mood,
            message: "Just opened the chat."
        }).then(response => {
            setMessages([{ sender: 'bot', text: response.response }]);
        }).catch(error => {
            toast({ title: "Error", description: "Could not connect to the chatbot.", variant: "destructive" });
            console.error(error);
        }).finally(() => setIsLoading(false));
    }
  }, [open, messages.length, mood, toast]);


  useEffect(() => {
    // Scroll to bottom when new messages are added
    if (scrollAreaRef.current) {
        const viewport = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
        if(viewport) {
            viewport.scrollTop = viewport.scrollHeight;
        }
    }
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage: Message = { sender: 'user', text: inputValue };
    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const response = await aiChatbot({ mood, message: inputValue });
      const botMessage: Message = { sender: 'bot', text: response.response };
      setMessages((prev) => [...prev, botMessage]);
    } catch (error) {
      console.error('Chatbot error:', error);
      toast({
        title: 'Error',
        description: 'Failed to get a response from the chatbot.',
        variant: 'destructive',
      });
       const errorMessage: Message = { sender: 'bot', text: "I'm sorry, I'm having trouble connecting right now. Please try again later." };
       setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl h-[70vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle className="font-headline text-2xl flex items-center gap-2">
            <Bot /> Chat with your AI Companion
          </DialogTitle>
          <DialogDescription>
            Feeling {mood.toLowerCase()}? I'm here to listen. How can I help you today?
          </DialogDescription>
        </DialogHeader>
        <ScrollArea className="flex-grow px-6" ref={scrollAreaRef}>
          <div className="space-y-4 pr-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={cn(
                  'flex items-start gap-3',
                  message.sender === 'user' ? 'justify-end' : 'justify-start'
                )}
              >
                {message.sender === 'bot' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
                <div
                  className={cn(
                    'max-w-md rounded-2xl px-4 py-3 text-sm',
                    message.sender === 'user'
                      ? 'bg-primary text-primary-foreground rounded-br-none'
                      : 'bg-muted rounded-bl-none'
                  )}
                >
                  <p>{message.text}</p>
                </div>
                {message.sender === 'user' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                )}
              </div>
            ))}
             {isLoading && messages[messages.length - 1]?.sender === 'user' && (
              <div className="flex items-start gap-3 justify-start">
                 <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      <Bot className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                <div className="bg-muted rounded-2xl rounded-bl-none px-4 py-3 flex items-center">
                  <Loader className="h-5 w-5 animate-spin" />
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
        <div className="p-6 pt-2">
          <form onSubmit={handleSendMessage} className="flex items-center gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder="Type your message..."
              autoComplete="off"
              disabled={isLoading}
            />
            <Button type="submit" size="icon" disabled={isLoading || !inputValue.trim()}>
              {isLoading ? <Loader className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
