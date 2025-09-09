'use client';

import { Header } from '@/components/layout/header';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Send, Bot, User } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';

const chatMessages = [
    { sender: 'counsellor', text: "Hi there! Just checking in. How are you finding the volunteer experience so far?" },
    { sender: 'volunteer', text: "Hi Dr. Reed! It's been really rewarding. I had a question about handling a specific topic that came up in the forums." },
    { sender: 'counsellor', text: "Of course, I'm happy to help. What's on your mind?" },
]

export default function VolunteerDashboard() {
  const { user } = useAuth();
  const router = useRouter();

  if (!user || user.role !== 'Volunteer') {
    if (typeof window !== 'undefined') router.push('/');
    return null;
  }

  return (
    <>
      <Header />
      <main className="container py-8">
        <h2 className="font-headline text-4xl mb-6">
          Hello, {user.name}! How are you feeling today?
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="rounded-2xl shadow-lg h-full flex flex-col">
              <CardHeader>
                <CardTitle>Chat with a Counsellor</CardTitle>
                <CardDescription>
                  A dedicated space for volunteers to connect with counsellors for guidance.
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-grow flex flex-col">
                <ScrollArea className="flex-grow pr-4 -mr-4 mb-4 h-80">
                  <div className="space-y-4">
                     {chatMessages.map((message, index) => (
                      <div
                        key={index}
                        className={cn(
                          'flex items-start gap-3',
                          message.sender === 'volunteer' ? 'justify-end' : 'justify-start'
                        )}
                      >
                        {message.sender === 'counsellor' && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              <Bot className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                        <div
                          className={cn(
                            'max-w-md rounded-2xl px-4 py-3 text-sm',
                             message.sender === 'volunteer'
                              ? 'bg-primary text-primary-foreground rounded-br-none'
                              : 'bg-muted rounded-bl-none'
                          )}
                        >
                          <p>{message.text}</p>
                        </div>
                        {message.sender === 'volunteer' && (
                          <Avatar className="h-8 w-8">
                            <AvatarFallback>
                              <User className="h-5 w-5" />
                            </AvatarFallback>
                          </Avatar>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
                <div className="flex items-center gap-2">
                  <Input placeholder="Type your message..." />
                  <Button size="icon">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle>Community Forums</CardTitle>
                <CardDescription>
                  Provide support and engage with students.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" asChild>
                  <Link href="/forums">Go to Forums</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
