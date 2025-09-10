
'use client';

import { useState, useEffect } from 'react';
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
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Loader2, PlusCircle, Trash2, Edit, AlertCircle, Clock, X } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, query, where, onSnapshot, doc, addDoc, updateDoc, deleteDoc, Timestamp, getDocs, orderBy, limit } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useCounsellorAvailability, type Availability } from '@/hooks/use-availability';
import { availableTimes as allPossibleTimes } from '@/lib/data';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface Appointment {
  id: string;
  studentId: string;
  studentName: string;
  date: string; 
  time: string;
  reason?: string; 
  shareMedicalInfo: boolean;
}

interface Resource {
  id: string;
  title: string;
  type: 'video' | 'book' | 'article' | 'audio' | 'spotify';
  link: string;
  description: string;
  thumbnail: string;
  duration?: string;
  tags?: string;
  uploaderName?: string;
}

const emptyResource: Omit<Resource, 'id'> = {
  title: '',
  type: 'video',
  link: '',
  description: '',
  thumbnail: '',
  duration: '',
  tags: '',
  uploaderName: '',
};

const daysOfWeek = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export default function CounsellorDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentResource, setCurrentResource] = useState<Omit<Resource, 'id'> | Resource>(emptyResource);
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);
  
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertContent, setAlertContent] = useState<{title: string, description: React.ReactNode}>({ title: '', description: ''});
  
  const { availability, saveAvailability, isLoading: isLoadingAvailability } = useCounsellorAvailability(user?.uid || '');
  const [isSavingAvailability, setIsSavingAvailability] = useState(false);
  const [isAvailabilityModalOpen, setIsAvailabilityModalOpen] = useState(false);
  const [currentAvailability, setCurrentAvailability] = useState<Availability>({});

  useEffect(() => {
    if (availability) {
        setCurrentAvailability(availability);
    }
  }, [availability]);


  useEffect(() => {
    if (user && user.role !== 'Counsellor') {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
    if (!user || user.role !== 'Counsellor') return;

    setIsLoading(true);
    const apptQuery = query(
      collection(db, 'appointments'),
      where('counsellorId', '==', user.uid)
    );
    const apptUnsubscribe = onSnapshot(
      apptQuery,
      (querySnapshot) => {
        const counsellorAppointments: Appointment[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          counsellorAppointments.push({
            id: doc.id,
            studentId: data.studentId,
            studentName: data.studentName,
            date: data.date,
            time: data.time,
            reason: data.reason || 'Not specified',
            shareMedicalInfo: data.shareMedicalInfo || false,
          });
        });
        setAppointments(
          counsellorAppointments.sort(
            (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
          )
        );
        setIsLoading(false);
      },
      (error) => {
        console.error('Error fetching appointments: ', error);
        toast({ title: "Error", description: "Could not fetch appointments.", variant: "destructive" });
        setIsLoading(false);
      }
    );

    const resourceQuery = query(collection(db, 'resources'));
    const resourceUnsubscribe = onSnapshot(
      resourceQuery,
      (querySnapshot) => {
        const fetchedResources: Resource[] = [];
        querySnapshot.forEach((doc) => {
            fetchedResources.push({ id: doc.id, ...(doc.data() as Omit<Resource, 'id'>) });
        });
        setResources(fetchedResources);
      }, (error) => {
          console.error("Error fetching resources: ", error);
          toast({ title: "Error", description: "Could not fetch resources.", variant: "destructive" });
      }
    );


    return () => {
        apptUnsubscribe();
        resourceUnsubscribe();
    };
  }, [user, toast]);
  
  const handleOpenModal = (resource?: Resource) => {
    if (resource) {
      setCurrentResource(resource);
      setEditingResourceId(resource.id);
    } else {
      setCurrentResource({...emptyResource, uploaderName: user?.name});
      setEditingResourceId(null);
    }
    setIsModalOpen(true);
  };
  
  const handleSaveResource = async () => {
    if (!user) return;
    setIsSaving(true);
    try {
      const resourceData = {
        ...currentResource,
        uploaderName: user.name,
        uploaderId: user.uid,
      };

      if (editingResourceId) {
        const resourceDoc = doc(db, 'resources', editingResourceId);
        await updateDoc(resourceDoc, resourceData);
         toast({ title: 'Success', description: 'Resource updated successfully.' });
      } else {
        await addDoc(collection(db, 'resources'), { 
            ...resourceData,
            createdAt: Timestamp.now()
         });
        toast({ title: 'Success', description: 'Resource added successfully.' });
      }
      setIsModalOpen(false);
    } catch (error) {
        console.error("Error saving resource: ", error);
        toast({ title: 'Error', description: 'Failed to save resource.', variant: 'destructive' });
    } finally {
        setIsSaving(false);
    }
  }

  const handleDeleteResource = async (resourceId: string) => {
    if(!window.confirm("Are you sure you want to delete this resource?")) return;
    try {
        await deleteDoc(doc(db, 'resources', resourceId));
        toast({ title: 'Success', description: 'Resource deleted.'});
    } catch (error) {
        console.error("Error deleting resource: ", error);
        toast({ title: 'Error', description: 'Failed to delete resource.', variant: 'destructive' });
    }
  }
  
  const showMedicalInfo = async (appointment: Appointment) => {
    if(appointment.shareMedicalInfo) {
        const testResultsQuery = query(
            collection(db, 'testResults'),
            where('userId', '==', appointment.studentId),
            orderBy('date', 'desc'),
            limit(1)
        );
        const snapshot = await getDocs(testResultsQuery);
        if (snapshot.empty) {
            setAlertContent({ title: `${appointment.studentName}'s Medical Info`, description: "No test results found for this student." });
        } else {
            const lastTest = snapshot.docs[0].data();
            const description = (
                <div className="space-y-2 text-sm">
                    <p><strong>Test:</strong> {lastTest.testName}</p>
                    <p><strong>Date:</strong> {format(lastTest.date.toDate(), 'PPP')}</p>
                    <p><strong>Score:</strong> {lastTest.score}</p>
                    <p><strong>Interpretation:</strong> {lastTest.interpretation}</p>
                </div>
            );
            setAlertContent({ title: `${appointment.studentName}'s Latest Medical Test`, description });
        }
    } else {
        setAlertContent({ title: `Consent Not Provided`, description: `${appointment.studentName} has not consented to sharing their medical test information.` });
    }
    setIsAlertOpen(true);
  }
  
  const showPersonalInfo = (appointment: Appointment) => {
     setAlertContent({ title: `${appointment.studentName}'s Personal Info`, description: `This is placeholder data. A full implementation would fetch the student's email and academic year from the database.` });
     setIsAlertOpen(true);
  }

  const handleToggleTimeSlot = (day: string, time: string) => {
    setCurrentAvailability(prev => {
        const daySlots = prev[day] || [];
        const newSlots = daySlots.includes(time)
            ? daySlots.filter(t => t !== time)
            : [...daySlots, time].sort((a, b) => new Date('1970/01/01 ' + a.replace(' ', '')).getTime() - new Date('1970/01/01 ' + b.replace(' ', '')).getTime());
        return { ...prev, [day]: newSlots };
    });
  };

  const handleSaveAvailability = async () => {
    setIsSavingAvailability(true);
    try {
        await saveAvailability(currentAvailability);
        toast({ title: 'Success', description: 'Your availability has been updated.' });
        setIsAvailabilityModalOpen(false);
    } catch (error) {
        console.error("Error saving availability: ", error);
        toast({ title: 'Error', description: 'Failed to save availability.', variant: 'destructive' });
    } finally {
        setIsSavingAvailability(false);
    }
  }


  if (!user || user.role !== 'Counsellor') {
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
          Welcome back, {user.name}!
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle>Your Schedule</CardTitle>
                <CardDescription>
                  Manage your appointments and view upcoming sessions.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid md:grid-cols-2 gap-6">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  className="rounded-md border"
                />
                <div>
                  <h3 className="font-semibold text-lg mb-4">
                    Upcoming Sessions on {date ? format(date, 'PPP') : '...'}
                  </h3>
                   {isLoading ? (
                    <div className="flex justify-center items-center h-40">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : appointments.filter(a => a.date === (date ? format(date, 'yyyy-MM-dd') : '')).length === 0 ? (
                    <p className="text-muted-foreground text-sm">You have no upcoming appointments for this day.</p>
                  ) : (
                  <Accordion type="single" collapsible className="w-full">
                    {appointments.filter(a => a.date === (date ? format(date, 'yyyy-MM-dd') : '')).map((session) => (
                      <AccordionItem value={session.id} key={session.id}>
                        <AccordionTrigger>
                          <div className="flex items-center justify-between w-full pr-4">
                            <span>{session.studentName}</span>
                            <div className="text-sm text-muted-foreground">
                               <span>at {session.time}</span>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="px-4 space-y-3">
                             <p className="text-sm">
                              <strong>Reason:</strong> {session.reason}
                            </p>
                            <div className="flex gap-2">
                              <Button size="sm" variant="outline" onClick={() => showMedicalInfo(session)}>
                                Medical Info
                              </Button>
                              <Button size="sm" variant="outline" onClick={() => showPersonalInfo(session)}>
                                Personal Info
                              </Button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card className="rounded-2xl shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Manage Availability</CardTitle>
                        <CardDescription>Set the days and times you are available for sessions.</CardDescription>
                    </div>
                    <Button onClick={() => setIsAvailabilityModalOpen(true)}>
                        <Clock className="mr-2 h-4 w-4" /> Manage
                    </Button>
                </CardHeader>
                <CardContent>
                    {isLoadingAvailability ? <div className="flex justify-center"><Loader2 className="animate-spin" /></div> :
                     <div className="space-y-4">
                        {daysOfWeek.map(day => (
                            <div key={day} className="flex items-start gap-4">
                                <h4 className="font-medium text-sm w-20 text-right pt-1">{day}</h4>
                                {availability[day] && availability[day]!.length > 0 ? (
                                    <div className="flex flex-wrap gap-2 flex-1">
                                        {availability[day]!.sort().map(time => (
                                            <Badge key={time} variant="secondary">{time}</Badge>
                                        ))}
                                    </div>
                                ) : <p className="text-xs text-muted-foreground flex-1 pt-1">Not available</p>}
                            </div>
                        ))}
                    </div>
                    }
                </CardContent>
            </Card>
            
            <Card className="rounded-2xl shadow-lg">
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Manage HealMe Resources</CardTitle>
                        <CardDescription>Add, edit, or delete resources for students.</CardDescription>
                    </div>
                    <Button onClick={() => handleOpenModal()}>
                        <PlusCircle className="mr-2 h-4 w-4" /> Add Resource
                    </Button>
                </CardHeader>
                <CardContent>
                   <div className="border rounded-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-border">
                        <thead className="bg-muted/50">
                            <tr>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Title</th>
                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-muted-foreground uppercase tracking-wider">Type</th>
                                <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-muted-foreground uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-background divide-y divide-border">
                            {resources.map(resource => (
                                <tr key={resource.id}>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-foreground">{resource.title}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-muted-foreground">{resource.type}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <Button variant="ghost" size="icon" onClick={() => handleOpenModal(resource)}><Edit className="h-4 w-4" /></Button>
                                        <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDeleteResource(resource.id)}><Trash2 className="h-4 w-4" /></Button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                   </div>
                </CardContent>
            </Card>
          </div>
          <div className="space-y-6">
            <Card className="rounded-2xl shadow-lg">
              <CardHeader>
                <CardTitle>Community Forums</CardTitle>
                <CardDescription>
                  Engage with the student community.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button className="w-full" asChild>
                  <Link href="/forums">Go to Forums</Link>
                </Button>
              </CardContent>
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

       <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingResourceId ? 'Edit Resource' : 'Add New Resource'}</DialogTitle>
            <DialogDescription>
              Fill in the details for the resource. Click save when you're done.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input id="title" value={currentResource.title} onChange={e => setCurrentResource({...currentResource, title: e.target.value})} className="col-span-3" />
            </div>
             <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Type
              </Label>
              <Select value={currentResource.type} onValueChange={(value: Resource['type']) => setCurrentResource({...currentResource, type: value})}>
                <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select resource type" />
                </SelectTrigger>
                <SelectContent>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="book">Book</SelectItem>
                    <SelectItem value="article">Article</SelectItem>
                    <SelectItem value="audio">Audio</SelectItem>
                    <SelectItem value="spotify">Spotify Playlist</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="link" className="text-right">
                Link
              </Label>
              <Input id="link" value={currentResource.link} onChange={e => setCurrentResource({...currentResource, link: e.target.value})} className="col-span-3" />
            </div>
            {(currentResource.type === 'video' || currentResource.type === 'book' || currentResource.type === 'article') && (
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="thumbnail" className="text-right">
                  Thumbnail URL
                </Label>
                <Input id="thumbnail" value={currentResource.thumbnail} onChange={e => setCurrentResource({...currentResource, thumbnail: e.target.value})} className="col-span-3" placeholder="https://picsum.photos/600/400" />
              </div>
            )}
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="duration" className="text-right">
                Duration
              </Label>
              <Input id="duration" value={currentResource.duration || ''} onChange={e => setCurrentResource({...currentResource, duration: e.target.value})} className="col-span-3" placeholder="e.g. 10 mins" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="tags" className="text-right">
                Tags
              </Label>
              <Input id="tags" value={currentResource.tags || ''} onChange={e => setCurrentResource({...currentResource, tags: e.target.value})} className="col-span-3" placeholder="e.g. anxiety, stress" />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea id="description" value={currentResource.description} onChange={e => setCurrentResource({...currentResource, description: e.target.value})} className="col-span-3" />
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={handleSaveResource} disabled={isSaving}>
              {isSaving ? <Loader2 className="animate-spin" /> : 'Save Resource'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
       <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2"><AlertCircle/>{alertContent.title}</AlertDialogTitle>
            <AlertDialogDescription>
              {alertContent.description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setIsAlertOpen(false)}>OK</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

       <Dialog open={isAvailabilityModalOpen} onOpenChange={setIsAvailabilityModalOpen}>
        <DialogContent className="sm:max-w-2xl">
          <DialogHeader>
            <DialogTitle>Manage Your Weekly Availability</DialogTitle>
            <DialogDescription>
                Select the time slots you're available for appointments on each day. This schedule will repeat weekly.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4 space-y-6">
            {daysOfWeek.map(day => (
                <div key={day} className="grid grid-cols-5 gap-4 items-start">
                    <Label className="font-semibold text-right pt-2 col-span-1">{day}</Label>
                    <div className="col-span-4">
                        <div className="grid grid-cols-3 gap-2">
                           {allPossibleTimes.map(time => (
                             <Button 
                                key={time}
                                variant={currentAvailability[day]?.includes(time) ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handleToggleTimeSlot(day, time)}
                                className="font-mono"
                            >
                               {time}
                             </Button>
                           ))}
                        </div>
                    </div>
                </div>
            ))}
          </div>
          <DialogFooter>
            <DialogClose asChild>
                <Button type="button" variant="secondary">Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={handleSaveAvailability} disabled={isSavingAvailability}>
              {isSavingAvailability ? <Loader2 className="animate-spin" /> : 'Save Availability'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

    </>
  );
}

    