'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Frown,
  Smile,
  Meh,
  Heart,
  Laugh,
  MessageSquare,
  Send,
  Calendar as CalendarIcon,
  Video,
  BookOpen,
  Headphones,
  Wind,
  BrainCircuit,
  User,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import {
  availableTimes,
  counsellors,
  featuredDiscussions,
  activeTopics,
  healMeResources,
} from '@/lib/data';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { ChatbotModal } from '@/components/chatbot-modal';
import Image from 'next/image';

const moodOptions = [
  { name: 'Sad', icon: Frown },
  { name: 'Neutral', icon: Meh },
  { name: 'Happy', icon: Smile },
  { name: 'Excited', icon: Laugh },
  { name: 'Loved', icon: Heart },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [mood, setMood] = useState('Neutral');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isChatbotOpen, setChatbotOpen] = useState(false);

  if (!user || user.role !== 'Student') {
    if (typeof window !== 'undefined') router.push('/');
    return null;
  }

  return (
    <>
      <Header />
      <main className="container py-8">
        <h2 className="font-headline text-4xl mb-6">
          How are you doing today, {user.name}?
        </h2>

        <div className="flex justify-center mb-8">
            <Button size="lg" onClick={() => setChatbotOpen(true)} className="rounded-full shadow-lg">
                <MessageSquare className="mr-2 h-5 w-5"/>
                Talk to my AI companion
            </Button>
        </div>

        <Tabs defaultValue="hear-me" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="hear-me">HearMe</TabsTrigger>
            <TabsTrigger value="know-me">KnowMe</TabsTrigger>
            <TabsTrigger value="heal-me">HealMe</TabsTrigger>
          </TabsList>

          <TabsContent value="hear-me" className="mt-6">
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              <Card className="lg:col-span-3 rounded-2xl shadow-lg">
                <CardHeader>
                  <CardTitle>Select Your Mood</CardTitle>
                  <CardDescription>
                    Let us know how you're feeling. This helps us support you better.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex justify-around items-center">
                  {moodOptions.map(({ name, icon: Icon }) => (
                    <button
                      key={name}
                      onClick={() => setMood(name)}
                      className={cn(
                        'flex flex-col items-center gap-2 p-3 rounded-lg transition-all duration-200',
                        mood === name
                          ? 'bg-accent text-accent-foreground scale-110'
                          : 'hover:bg-accent/50'
                      )}
                    >
                      <Icon
                        className={cn(
                          'h-10 w-10',
                          mood === name ? 'text-primary' : 'text-muted-foreground'
                        )}
                      />
                      <span className="text-sm font-medium">{name}</span>
                    </button>
                  ))}
                </CardContent>
              </Card>

              <Card className="lg:col-span-2 rounded-2xl shadow-lg">
                <CardHeader>
                  <CardTitle>Book a Counsellor</CardTitle>
                  <CardDescription>
                    Schedule a one-on-one session with a professional.
                  </CardDescription>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2">
                    <div>
                        <Select>
                        <SelectTrigger>
                            <SelectValue placeholder="Select a therapist" />
                        </SelectTrigger>
                        <SelectContent>
                            {counsellors.map((c) => (
                            <SelectItem key={c.id} value={c.id}>
                                {c.name}
                            </SelectItem>
                            ))}
                        </SelectContent>
                        </Select>
                        <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        className="rounded-md border mt-4"
                        />
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">Available Times</h4>
                        <div className="grid grid-cols-2 gap-2">
                        {availableTimes.map((time) => (
                            <Button key={time} variant="outline">{time}</Button>
                        ))}
                        </div>
                        <Button className="w-full mt-4">Book Appointment</Button>
                    </div>
                </CardContent>
                 <CardFooter className="flex-col items-start gap-4">
                    <h4 className="font-semibold">Your Appointments</h4>
                    <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
                </CardFooter>
              </Card>

              <div className="space-y-6">
                <Card className="rounded-2xl shadow-lg">
                  <CardHeader>
                    <CardTitle>Community Forums</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-4">Connect with peers and share experiences.</p>
                     <Button className="w-full" asChild>
                      <Link href="/forums">Go to Forums</Link>
                    </Button>
                  </CardContent>
                </Card>
                <Card className="rounded-2xl shadow-lg">
                  <CardHeader>
                    <CardTitle>I Want to Rant</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Textarea placeholder="Let it all out... This is a private space for your thoughts, and nothing here will be saved or submitted." />
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="know-me" className="mt-6">
             <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <Card className="rounded-2xl shadow-lg">
                    <CardHeader>
                        <CardTitle>My Journal</CardTitle>
                        <CardDescription>Reflect on your day and track your thoughts.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">A private and secure space to write down your feelings.</p>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" asChild>
                            <Link href="/journal">Open Journal</Link>
                        </Button>
                    </CardFooter>
                </Card>
                <Card className="rounded-2xl shadow-lg">
                    <CardHeader>
                        <CardTitle>Medical Tests</CardTitle>
                        <CardDescription>Simple self-assessment questionnaires.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ul className="text-sm text-muted-foreground list-disc pl-5 space-y-1">
                            <li>PHQ-9 (Depression)</li>
                            <li>GAD-7 (Anxiety)</li>
                            <li>DASS-21</li>
                        </ul>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" variant="secondary">Start Assessment</Button>
                    </CardFooter>
                </Card>
                <Card className="rounded-2xl shadow-lg">
                    <CardHeader>
                        <CardTitle>My Profile</CardTitle>
                        <CardDescription>Manage your personal information.</CardDescription>
                    </CardHeader>
                    <CardContent>
                         <p className="text-sm text-muted-foreground mb-4">Keep your profile details up to date.</p>
                    </CardContent>
                    <CardFooter>
                        <Button className="w-full" asChild>
                            <Link href="/student-profile">Go to Profile</Link>
                        </Button>
                    </CardFooter>
                </Card>
             </div>
          </TabsContent>

          <TabsContent value="heal-me" className="mt-6">
             <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2 space-y-6">
                    <Card className="rounded-2xl shadow-lg">
                        <CardHeader>
                            <CardTitle>Recommended For You</CardTitle>
                            <CardDescription>Videos and books to help you on your journey.</CardDescription>
                        </CardHeader>
                        <CardContent className="grid gap-6 md:grid-cols-2">
                            {healMeResources.videos.map(res => (
                                <div key={res.id} className="group relative">
                                    <Image data-ai-hint={res.dataAiHint} src={res.thumbnail} alt={res.title} width={600} height={400} className="rounded-lg aspect-video object-cover" />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                        <h3 className="text-white font-bold text-lg text-center p-4">{res.title}</h3>
                                    </div>
                                </div>
                            ))}
                            {healMeResources.books.map(res => (
                                <div key={res.id} className="group relative">
                                    <Image data-ai-hint={res.dataAiHint} src={res.thumbnail} alt={res.title} width={600} height={400} className="rounded-lg aspect-video object-cover" />
                                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                                        <h3 className="text-white font-bold text-lg text-center p-4">{res.title}</h3>
                                    </div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                    <Card className="rounded-2xl shadow-lg">
                         <CardHeader>
                            <CardTitle>Explore Topics</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 md:grid-cols-3 gap-4">
                            <Button variant="outline" className="h-20 flex-col gap-1">
                                <Wind/>
                                Breathing
                            </Button>
                            <Button variant="outline" className="h-20 flex-col gap-1">
                                <BookOpen/>
                                Books
                            </Button>
                             <Button variant="outline" className="h-20 flex-col gap-1">
                                <BrainCircuit/>
                                Techniques
                            </Button>
                        </CardContent>
                    </Card>
                </div>
                <div className="space-y-6">
                    <Card className="rounded-2xl shadow-lg">
                        <CardHeader>
                            <CardTitle>Meditation</CardTitle>
                            <CardDescription>Find your inner peace.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Image data-ai-hint="meditation nature" src="https://picsum.photos/600/400" alt="Meditation" width={600} height={400} className="rounded-lg aspect-video object-cover mb-4" />
                            <Button asChild className="w-full"><Link href="/meditation">Start a Session</Link></Button>
                        </CardContent>
                    </Card>
                     <Card className="rounded-2xl shadow-lg">
                        <CardHeader>
                            <CardTitle>Calming Music</CardTitle>
                            <CardDescription>Listen to curated playlists.</CardDescription>
                        </CardHeader>
                        <CardContent>
                             <Button variant="secondary" className="w-full"><Headphones className="mr-2"/> Open Playlist</Button>
                        </CardContent>
                    </Card>
                </div>
             </div>
          </TabsContent>
        </Tabs>
        <ChatbotModal open={isChatbotOpen} onOpenChange={setChatbotOpen} mood={mood} />
      </main>
    </>
  );
}
