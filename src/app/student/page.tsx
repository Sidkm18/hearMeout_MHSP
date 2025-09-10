
'use client';

import { useState, useEffect } from 'react';
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
  BookOpen,
  Headphones,
  Wind,
  BrainCircuit,
  Loader2,
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
} from '@/lib/data';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { ChatbotModal } from '@/components/chatbot-modal';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, onSnapshot, Timestamp, getDocs } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { User as AppUser } from '@/lib/types';

interface Appointment {
    id: string;
    studentId: string;
    counsellorId: string;
    counsellorName: string;
    date: string; // Storing date as string for simplicity
    time: string;
}

interface Counsellor extends AppUser {
    id: string;
}

interface Resource {
  id: string;
  title: string;
  type: 'video' | 'book' | 'article' | 'audio' | 'spotify';
  link: string;
  description: string;
  thumbnail: string;
}

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
  const { toast } = useToast();

  const [mood, setMood] = useState('Neutral');
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isChatbotOpen, setChatbotOpen] = useState(false);
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [selectedCounsellor, setSelectedCounsellor] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [isLoadingResources, setIsLoadingResources] = useState(true);

  useEffect(() => {
    if (user && user.role !== 'Student') {
      router.push(`/${user.role.toLowerCase()}`);
    }
  }, [user, router]);

  useEffect(() => {
    const fetchCounsellors = async () => {
      const q = query(collection(db, "users"), where("role", "==", "Counsellor"), where("status", "==", "Approved"));
      const querySnapshot = await getDocs(q);
      const fetchedCounsellors: Counsellor[] = [];
      querySnapshot.forEach((doc) => {
        fetchedCounsellors.push({ id: doc.id, ...(doc.data() as Omit<AppUser, 'uid'>), uid: doc.id });
      });
      setCounsellors(fetchedCounsellors);
    };

    fetchCounsellors();

    const resourceQuery = query(collection(db, 'resources'));
    const resourceUnsubscribe = onSnapshot(
      resourceQuery,
      (querySnapshot) => {
        const fetchedResources: Resource[] = [];
        querySnapshot.forEach((doc) => {
            fetchedResources.push({ id: doc.id, ...(doc.data() as Omit<Resource, 'id'>) });
        });
        setResources(fetchedResources);
        setIsLoadingResources(false);
      }, (error) => {
          console.error("Error fetching resources: ", error);
          toast({ title: "Error", description: "Could not fetch resources.", variant: "destructive" });
          setIsLoadingResources(false);
      }
    );

    return () => resourceUnsubscribe();

  }, [toast]);

  useEffect(() => {
    if (!user) return;

    const q = query(collection(db, 'appointments'), where('studentId', '==', user.uid));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const userAppointments: Appointment[] = [];
      querySnapshot.forEach((doc) => {
          const data = doc.data();
          userAppointments.push({
            id: doc.id,
            studentId: data.studentId,
            counsellorId: data.counsellorId,
            counsellorName: data.counsellorName,
            date: data.date,
            time: data.time,
          });
      });
      setAppointments(userAppointments.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    });

    return () => unsubscribe();
  }, [user]);
  
  const handleBookAppointment = async () => {
      if (!user || !selectedCounsellor || !date || !selectedTime) {
          toast({
              title: "Incomplete Details",
              description: "Please select a counsellor, date, and time.",
              variant: "destructive"
          });
          return;
      }
      setIsBooking(true);
      try {
        const counsellor = counsellors.find(c => c.id === selectedCounsellor);
        await addDoc(collection(db, 'appointments'), {
            studentId: user.uid,
            studentName: user.name,
            counsellorId: selectedCounsellor,
            counsellorName: counsellor?.name,
            date: date.toISOString().split('T')[0], // YYYY-MM-DD
            time: selectedTime,
            createdAt: Timestamp.now(),
        });
        toast({
            title: "Success!",
            description: "Your appointment has been booked."
        })
        setSelectedCounsellor('');
        setSelectedTime('');
        setDate(new Date());

      } catch (error) {
          console.error("Error booking appointment: ", error);
           toast({
              title: "Booking Failed",
              description: "Could not book the appointment. Please try again.",
              variant: "destructive"
          });
      } finally {
          setIsBooking(false);
      }
  }
  
  if (!user) {
    return (
        <div className="flex min-h-screen w-full flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin" />
        </div>
    );
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
                        <Select value={selectedCounsellor} onValueChange={setSelectedCounsellor}>
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
                        disabled={(date) => date < new Date(new Date().setDate(new Date().getDate() - 1))}
                        />
                    </div>
                    <div>
                        <h4 className="font-semibold mb-2">Available Times</h4>
                        <div className="grid grid-cols-2 gap-2">
                        {availableTimes.map((time) => (
                            <Button 
                                key={time} 
                                variant={selectedTime === time ? 'default' : 'outline'}
                                onClick={() => setSelectedTime(time)}
                            >
                                {time}
                            </Button>
                        ))}
                        </div>
                        <Button 
                            className="w-full mt-4"
                            onClick={handleBookAppointment}
                            disabled={isBooking || !selectedCounsellor || !date || !selectedTime}
                        >
                            {isBooking ? <Loader2 className="animate-spin"/> : "Book Appointment"}
                        </Button>
                    </div>
                </CardContent>
                 <CardFooter className="flex-col items-start gap-4">
                    <h4 className="font-semibold">Your Appointments</h4>
                     {appointments.length > 0 ? (
                        <ul className="space-y-2 w-full">
                        {appointments.map(app => (
                             <li key={app.id} className="text-sm text-muted-foreground p-3 bg-muted/50 rounded-lg flex justify-between items-center">
                                <span>With <b>{app.counsellorName}</b> on {new Date(app.date).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })} at {app.time}</span>
                            </li>
                        ))}
                        </ul>
                    ) : (
                        <p className="text-sm text-muted-foreground">No upcoming appointments.</p>
                    )}
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
            {isLoadingResources ? <div className="flex justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div> :
            <div className="space-y-6">
              <Card className="rounded-2xl shadow-lg">
                <CardHeader>
                  <CardTitle>Recommended Videos</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {resources.filter(r => r.type === 'video').map(res => (
                    <Link href={res.link} key={res.id} target="_blank" className="group relative">
                      <Image
                        src={res.thumbnail || 'https://picsum.photos/600/400'}
                        alt={res.title}
                        width={600}
                        height={400}
                        className="rounded-lg aspect-video object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg p-4">
                        <h3 className="text-white font-bold text-lg text-center">{res.title}</h3>
                        <p className="text-white/80 text-sm text-center mt-1">{res.description}</p>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-lg">
                <CardHeader>
                  <CardTitle>Recommended Books</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {resources.filter(r => r.type === 'book').map(res => (
                     <Link href={res.link} key={res.id} target="_blank" className="group relative">
                      <Image
                        src={res.thumbnail || 'https://picsum.photos/600/400'}
                        alt={res.title}
                        width={600}
                        height={400}
                        className="rounded-lg aspect-video object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg p-4">
                        <h3 className="text-white font-bold text-lg text-center">{res.title}</h3>
                         <p className="text-white/80 text-sm text-center mt-1">{res.description}</p>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>
              
               <Card className="rounded-2xl shadow-lg">
                <CardHeader>
                  <CardTitle>Helpful Articles</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {resources.filter(r => r.type === 'article').map(res => (
                     <Link href={res.link} key={res.id} target="_blank" className="group relative">
                      <Image
                        src={res.thumbnail || 'https://picsum.photos/600/400'}
                        alt={res.title}
                        width={600}
                        height={400}
                        className="rounded-lg aspect-video object-cover"
                      />
                      <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg p-4">
                        <h3 className="text-white font-bold text-lg text-center">{res.title}</h3>
                         <p className="text-white/80 text-sm text-center mt-1">{res.description}</p>
                      </div>
                    </Link>
                  ))}
                </CardContent>
              </Card>

              <Card className="rounded-2xl shadow-lg mt-6">
                <CardHeader>
                  <CardTitle>Meditation & Music</CardTitle>
                  <CardDescription>Find your inner peace.</CardDescription>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                  <Button asChild className="h-24">
                    <Link href="/self-help-resources">Start a Guided Session</Link>
                  </Button>
                  <Button variant="secondary" className="h-24" asChild>
                     <Link href={resources.find(r => r.type === 'spotify')?.link || '#'} target="_blank">
                        <Headphones className="mr-2" /> Listen on Spotify
                     </Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
            }
          </TabsContent>
        </Tabs>
      </main>
      <ChatbotModal open={isChatbotOpen} onOpenChange={setChatbotOpen} mood={mood} />
    </>
  );
}
