'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from '@/components/ui/badge';
import { Send } from 'lucide-react';


const upcomingSessions = [
    { name: 'John Doe', date: '2024-08-15', time: '10:00 AM', reason: 'Anxiety' },
    { name: 'Jane Smith', date: '2024-08-15', time: '11:00 AM', reason: 'Exam Stress' },
    { name: 'Peter Jones', date: '2024-08-16', time: '02:00 PM', reason: 'Relationship Issues' }
]

export default function CounsellorDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [date, setDate] = useState<Date | undefined>(new Date());

  if (!user || user.role !== 'Counsellor') {
    if (typeof window !== 'undefined') router.push('/');
    return null;
  }

  return (
    <>
      <Header />
      <main className="container py-8">
        <h2 className="font-headline text-4xl mb-6">Welcome back, {user.name}!</h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <Card className="rounded-2xl shadow-lg">
                <CardHeader>
                    <CardTitle>Your Schedule</CardTitle>
                    <CardDescription>Manage your appointments and view upcoming sessions.</CardDescription>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-6">
                    <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border"
                    />
                    <div>
                        <h3 className="font-semibold text-lg mb-4">Upcoming Sessions</h3>
                        <Accordion type="single" collapsible className="w-full">
                            {upcomingSessions.map((session, index) => (
                                <AccordionItem value={`item-${index}`} key={index}>
                                    <AccordionTrigger>
                                        <div className="flex items-center justify-between w-full pr-4">
                                            <span>{session.name}</span>
                                            <div className="text-sm text-muted-foreground">
                                                <span>{session.date} at {session.time}</span>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent>
                                        <div className="px-4 space-y-3">
                                            <Badge>{session.reason}</Badge>
                                            <p className="text-sm">Links to student information would appear here.</p>
                                            <div className="flex gap-2">
                                                <Button size="sm" variant="outline">Medical Info</Button>
                                                <Button size="sm" variant="outline">Personal Info</Button>
                                            </div>
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </div>
                </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="rounded-2xl shadow-lg">
                <CardHeader>
                    <CardTitle>Community Forums</CardTitle>
                    <CardDescription>Engage with the student community.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Button className="w-full" asChild>
                        <Link href="/forums">Go to Forums</Link>
                    </Button>
                </CardContent>
            </Card>
            <Card className="rounded-2xl shadow-lg">
                <CardHeader>
                    <CardTitle>Recommend Resources</CardTitle>
                    <CardDescription>Share helpful materials with students.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea placeholder="Enter resource link or description..."/>
                </CardContent>
                <CardFooter>
                    <Button className="w-full">Recommend</Button>
                </CardFooter>
            </Card>
            <Card className="rounded-2xl shadow-lg">
                <CardHeader>
                    <CardTitle>Send Message to User</CardTitle>
                    <CardDescription>Communicate directly with a student.</CardDescription>
                </CardHeader>
                <CardContent>
                    <Textarea placeholder="Type your message..."/>
                </CardContent>
                <CardFooter>
                    <Button className="w-full">
                        <Send className="mr-2 h-4 w-4"/>
                        Send
                    </Button>
                </CardFooter>
            </Card>
             <Card className="rounded-2xl shadow-lg">
                <CardHeader>
                    <CardTitle>My Profile</CardTitle>
                </CardHeader>
                <CardContent>
                     <Button className="w-full" variant="secondary" asChild>
                        <Link href="/counsellor-profile">View Profile</Link>
                    </Button>
                </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </>
  );
}
