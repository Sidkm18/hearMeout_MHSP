
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
  MessageSquare,
  BookOpen,
  Headphones,
  Wind,
  BrainCircuit,
  Loader2,
  ListPlus,
  Star,
  ArrowDown,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { ChatbotModal } from '@/components/chatbot-modal';
import Image from 'next/image';
import { db } from '@/lib/firebase';
import { collection, addDoc, query, where, onSnapshot, Timestamp, getDocs, serverTimestamp } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { User as AppUser } from '@/lib/types';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useAvailability } from '@/hooks/use-availability';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

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

export default function StudentDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [date, setDate] = useState<Date | undefined>(new Date());
  const [isChatbotOpen, setChatbotOpen] = useState(false);
  const [counsellors, setCounsellors] = useState<Counsellor[]>([]);
  const [selectedCounsellor, setSelectedCounsellor] = useState('');
  const [selectedTime, setSelectedTime] = useState('');
  const [reason, setReason] = useState('');
  const [shareInfo, setShareInfo] = useState(false);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isBooking, setIsBooking] = useState(false);
  const [isLoadingResources, setIsLoadingResources] = useState(true);

  const [isFeedbackModalOpen, setIsFeedbackModalOpen] = useState(false);
  const [selectedCounsellorForFeedback, setSelectedCounsellorForFeedback] = useState('');
  const [feedbackRating, setFeedbackRating] = useState(0);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  
  const { availableSlots, isLoading: isLoadingSlots } = useAvailability(selectedCounsellor, date);

  useEffect(() => {
      // Reset time when counsellor or date changes
      setSelectedTime('');
  }, [selectedCounsellor, date])

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
      if (!user || !selectedCounsellor || !date || !selectedTime || !reason) {
          toast({
              title: "Incomplete Details",
              description: "Please select a counsellor, date, time and provide a reason.",
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
            reason: reason,
            shareMedicalInfo: shareInfo,
            createdAt: Timestamp.now(),
        });
        toast({
            title: "Success!",
            description: "Your appointment has been booked."
        })
        setSelectedCounsellor('');
        setSelectedTime('');
        setReason('');
        setShareInfo(false);
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

  const handleFeedbackSubmit = async () => {
    if (!user || !selectedCounsellorForFeedback || feedbackRating === 0 || !feedbackComment) {
        toast({
            title: "Incomplete Feedback",
            description: "Please select a counsellor, provide a rating and a comment.",
            variant: "destructive"
        });
        return;
    }
    setIsSubmittingFeedback(true);
    try {
        const counsellor = counsellors.find(c => c.id === selectedCounsellorForFeedback);
        await addDoc(collection(db, 'feedback'), {
            studentId: user.uid,
            studentName: user.name,
            counsellorId: selectedCounsellorForFeedback,
            counsellorName: counsellor?.name,
            rating: feedbackRating,
            comment: feedbackComment,
            createdAt: serverTimestamp(),
        });
        toast({
            title: "Thank You!",
            description: "Your feedback has been submitted successfully."
        });
        setIsFeedbackModalOpen(false);
        setSelectedCounsellorForFeedback('');
        setFeedbackRating(0);
        setFeedbackComment('');
    } catch (error) {
        console.error("Error submitting feedback: ", error);
        toast({
            title: "Submission Failed",
            description: "Could not submit your feedback. Please try again.",
            variant: "destructive"
        });
    } finally {
        setIsSubmittingFeedback(false);
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
      <main>
        <section className="relative flex flex-col items-center justify-center text-center min-h-[calc(100vh-80px)]">
            <h2 className="font-headline text-7xl mb-12">
            How are you doing today, {user.name}?
            </h2>
             <Button size="lg" onClick={() => setChatbotOpen(true)} className="rounded-full shadow-lg text-lg py-8 px-12 bg-primary text-primary-foreground hover:bg-primary/90">
                <MessageSquare className="mr-3 h-6 w-6"/>
                Talk to my AI companion
            </Button>
            <div className="absolute bottom-10 animate-bounce">
                <ArrowDown className="w-8 h-8 text-muted-foreground" />
            </div>
        </section>

        <section id="dashboard-content" className="container py-12">
            <Tabs defaultValue="hear-me" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="hear-me">HearMe</TabsTrigger>
                <TabsTrigger value="know-me">KnowMe</TabsTrigger>
                <TabsTrigger value="heal-me">HealMe</TabsTrigger>
            </TabsList>

            <TabsContent value="hear-me" className="mt-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                        <div className="space-y-4">
                            <div>
                                <h4 className="font-semibold mb-2">Available Times</h4>
                                {isLoadingSlots ? <Loader2 className="animate-spin" /> :
                                availableSlots.length > 0 ? (
                                    <div className="grid grid-cols-2 gap-2">
                                    {availableSlots.map((time) => (
                                        <Button 
                                            key={time} 
                                            variant={selectedTime === time ? 'default' : 'outline'}
                                            onClick={() => setSelectedTime(time)}
                                        >
                                            {time}
                                        </Button>
                                    ))}
                                    </div>
                                ) : <p className="text-sm text-muted-foreground">
                                    {selectedCounsellor ? "No available slots for this day." : "Please select a counsellor first."}
                                    </p>
                                }
                            </div>
                            <div>
                            <Label htmlFor="reason">Reason for booking</Label>
                            <Textarea 
                                    id="reason"
                                    placeholder="Briefly describe what you'd like to talk about..."
                                    value={reason}
                                    onChange={(e) => setReason(e.target.value)}
                                    className="mt-1"
                            />
                            </div>
                            <div className="flex items-center space-x-2">
                                <Checkbox id="share-info" checked={shareInfo} onCheckedChange={(checked) => setShareInfo(checked as boolean)} />
                                <Label htmlFor="share-info" className="text-sm text-muted-foreground">I consent to sharing my medical test results with the counsellor.</Label>
                            </div>
                            <Button 
                                className="w-full"
                                onClick={handleBookAppointment}
                                disabled={isBooking || !selectedCounsellor || !date || !selectedTime || !reason}
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
                            <CardTitle>My Journal</CardTitle>
                            <CardDescription>A private space to track your mood and thoughts.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <Button className="w-full" asChild>
                                <Link href="/journal"><ListPlus className="mr-2 h-5 w-5"/> Go to Journal</Link>
                            </Button>
                        </CardContent>
                    </Card>
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
                        <CardTitle>Provide Feedback</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-sm text-muted-foreground mb-4">Help us improve by sharing your experience with a counsellor.</p>
                        <Button className="w-full" variant="outline" onClick={() => setIsFeedbackModalOpen(true)}>Give Feedback</Button>
                    </CardContent>
                    </Card>
                </div>
                </div>
            </TabsContent>

            <TabsContent value="know-me" className="mt-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
                            <Button className="w-full" variant="secondary" asChild>
                            <Link href="/medical-tests">Start Assessment</Link>
                            </Button>
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
        </section>
      </main>
      <ChatbotModal open={isChatbotOpen} onOpenChange={setChatbotOpen} mood={"Neutral"} />

       <Dialog open={isFeedbackModalOpen} onOpenChange={setIsFeedbackModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Provide Feedback</DialogTitle>
            <DialogDescription>
              Your feedback is anonymous and helps us improve our services.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="counsellor-select">Counsellor</Label>
              <Select value={selectedCounsellorForFeedback} onValueChange={setSelectedCounsellorForFeedback}>
                <SelectTrigger id="counsellor-select">
                    <SelectValue placeholder="Select a counsellor" />
                </SelectTrigger>
                <SelectContent>
                    {counsellors.map((c) => (
                        <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Rating</Label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Button
                    key={star}
                    variant="ghost"
                    size="icon"
                    onClick={() => setFeedbackRating(star)}
                    className={cn(feedbackRating >= star ? 'text-yellow-400' : 'text-muted-foreground')}
                  >
                    <Star className="h-6 w-6" fill={feedbackRating >= star ? 'currentColor' : 'none'} />
                  </Button>
                ))}
              </div>
            </div>
            <div className="space-y-2">
                <Label htmlFor="feedback-comment">Comments</Label>
                <Textarea 
                    id="feedback-comment"
                    placeholder="Share your experience..."
                    value={feedbackComment}
                    onChange={e => setFeedbackComment(e.target.value)}
                    rows={4}
                />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={handleFeedbackSubmit} disabled={isSubmittingFeedback}>
              {isSubmittingFeedback ? <Loader2 className="animate-spin" /> : 'Submit Feedback'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
