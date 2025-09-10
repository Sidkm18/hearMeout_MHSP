
'use client';
import { useEffect, useState } from 'react';
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
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Check, X, User as UserIcon, PlusCircle, Edit, Trash2, Loader2, Calendar, Star } from 'lucide-react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, doc, updateDoc, addDoc, deleteDoc, Timestamp, query } from 'firebase/firestore';
import { useToast } from '@/hooks/use-toast';
import type { User as AppUser } from '@/lib/types';
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
import { format } from 'date-fns';

interface UserApproval extends AppUser {
    id: string;
    status: 'Pending' | 'Approved' | 'Rejected';
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

interface Appointment {
  id: string;
  studentName: string;
  counsellorName: string;
  date: string;
  time: string;
}

interface Feedback {
    id: string;
    studentName: string;
    counsellorName: string;
    comment: string;
    rating: number;
    createdAt: Timestamp;
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

const mockStudents = [
    { name: 'John Doe', year: '2nd Year', email: 'john.d@example.edu'},
    { name: 'Jane Smith', year: '3rd Year', email: 'jane.s@example.edu'},
    { name: 'Mike Ross', year: '1st Year', email: 'mike.r@example.edu'},
]

export default function AdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const { toast } = useToast();

  const [approvals, setApprovals] = useState<UserApproval[]>([]);
  const [resources, setResources] = useState<Resource[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [feedback, setFeedback] = useState<Feedback[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentResource, setCurrentResource] = useState<Omit<Resource, 'id'> | Resource>(emptyResource);
  const [editingResourceId, setEditingResourceId] = useState<string | null>(null);

  useEffect(() => {
    if (user && user.role !== 'Admin') {
      router.push('/');
    }
  }, [user, router]);

  useEffect(() => {
     if (!user || user.role !== 'Admin') return;

     setIsLoading(true);
     const usersUnsubscribe = onSnapshot(query(collection(db, 'users')), (snapshot) => {
         const userList: UserApproval[] = [];
         snapshot.forEach(doc => {
            const data = doc.data();
             userList.push({ id: doc.id, ...(data as AppUser), status: data.status || 'Pending' } as UserApproval);
         });
         setApprovals(userList.filter(u => u.role === 'Counsellor' || u.role === 'Volunteer'));
         setIsLoading(false);
     }, (error) => {
         console.error("Error fetching users for approval: ", error);
         toast({ title: "Error", description: "Could not fetch users.", variant: "destructive" });
         setIsLoading(false);
     });

    const resourceUnsubscribe = onSnapshot(query(collection(db, 'resources')), (snapshot) => {
        const fetchedResources: Resource[] = [];
        snapshot.forEach((doc) => {
            fetchedResources.push({ id: doc.id, ...(doc.data() as Omit<Resource, 'id'>) });
        });
        setResources(fetchedResources);
    }, (error) => {
        console.error("Error fetching resources: ", error);
        toast({ title: "Error", description: "Could not fetch resources.", variant: "destructive" });
    });
    
     const apptUnsubscribe = onSnapshot(query(collection(db, 'appointments')), (snapshot) => {
        const fetchedAppointments: Appointment[] = [];
        snapshot.forEach((doc) => {
            fetchedAppointments.push({ id: doc.id, ...(doc.data() as Omit<Appointment, 'id'>) });
        });
        setAppointments(fetchedAppointments.sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime()));
    }, (error) => {
        console.error("Error fetching appointments: ", error);
        toast({ title: "Error", description: "Could not fetch appointments.", variant: "destructive" });
    });

     const feedbackUnsubscribe = onSnapshot(query(collection(db, 'feedback')), (snapshot) => {
        const fetchedFeedback: Feedback[] = [];
        snapshot.forEach((doc) => {
            fetchedFeedback.push({ id: doc.id, ...(doc.data() as Omit<Feedback, 'id'>) });
        });
        setFeedback(fetchedFeedback.sort((a,b) => b.createdAt.toMillis() - a.createdAt.toMillis()));
    }, (error) => {
        console.error("Error fetching feedback: ", error);
        toast({ title: "Error", description: "Could not fetch feedback.", variant: "destructive" });
    });

     return () => {
         usersUnsubscribe();
         resourceUnsubscribe();
         apptUnsubscribe();
         feedbackUnsubscribe();
     };
  }, [user, toast]);

  const handleApproval = async (userId: string, status: 'Approved' | 'Rejected') => {
      try {
          const userDoc = doc(db, 'users', userId);
          await updateDoc(userDoc, { status });
          toast({ title: "Success", description: `User has been ${status.toLowerCase()}.`})
      } catch (error) {
          console.error("Error updating user status: ", error);
          toast({ title: "Error", description: "Failed to update user status.", variant: "destructive" });
      }
  }

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

  if (!user || user.role !== 'Admin') {
    return (
       <div className="flex min-h-screen w-full flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 animate-spin" />
        </div>
    );
  }
  
  const counsellors = approvals.filter(a => a.role === 'Counsellor');
  const volunteers = approvals.filter(a => a.role === 'Volunteer');

  return (
    <>
      <Header />
      <main className="container py-8">
        <h2 className="font-headline text-4xl mb-6">Admin Dashboard</h2>
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          <Card className="md:col-span-2 rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle>Counsellor Approvals</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {isLoading ? <TableRow><TableCell colSpan={3} className="text-center"><Loader2 className="animate-spin mx-auto"/></TableCell></TableRow> :
                        counsellors.map(c => (
                            <TableRow key={c.id}>
                                <TableCell className="font-medium">{c.name}</TableCell>
                                <TableCell><Badge variant={c.status === 'Approved' ? 'default' : c.status === 'Pending' ? 'secondary' : 'destructive'}>{c.status}</Badge></TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon"><UserIcon className="h-4 w-4"/></Button>
                                    <Button variant="ghost" size="icon" className="text-green-500" onClick={() => handleApproval(c.id, 'Approved')}><Check className="h-4 w-4"/></Button>
                                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleApproval(c.id, 'Rejected')}><X className="h-4 w-4"/></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>

          <Card className="rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle>Counsellor Feedback</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 max-h-80 overflow-y-auto">
              {feedback.map((f, i) => (
                <div key={i} className="border p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                         <p className="text-sm font-medium">{f.comment}</p>
                         <div className="flex items-center gap-1">
                            <Star className="w-4 h-4 text-yellow-400" fill="currentColor" />
                            <span className="font-bold">{f.rating}</span>
                         </div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">From: {f.studentName} | For: {f.counsellorName}</p>
                </div>
              ))}
            </CardContent>
          </Card>
          
          <Card className="rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle>Volunteer Approvals</CardTitle>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Name</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                         {isLoading ? <TableRow><TableCell colSpan={3} className="text-center"><Loader2 className="animate-spin mx-auto"/></TableCell></TableRow> :
                        volunteers.map(v => (
                            <TableRow key={v.id}>
                                <TableCell className="font-medium">{v.name}</TableCell>
                                <TableCell><Badge variant={v.status === 'Approved' ? 'default' : v.status === 'Pending' ? 'secondary' : 'destructive'}>{v.status}</Badge></TableCell>
                                <TableCell className="text-right">
                                    <Button variant="ghost" size="icon" className="text-green-500" onClick={() => handleApproval(v.id, 'Approved')}><Check className="h-4 w-4"/></Button>
                                    <Button variant="ghost" size="icon" className="text-red-500" onClick={() => handleApproval(v.id, 'Rejected')}><X className="h-4 w-4"/></Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-2 rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle>Student Enrollment</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Year</TableHead>
                        <TableHead>Email</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {mockStudents.map(s => (
                        <TableRow key={s.email}>
                            <TableCell>{s.name}</TableCell>
                            <TableCell>{s.year}</TableCell>
                            <TableCell>{s.email}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>

           <Card className="md:col-span-3 rounded-2xl shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Calendar /> All Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Student</TableHead>
                        <TableHead>Counsellor</TableHead>
                        <TableHead>Date & Time</TableHead>
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {appointments.map(a => (
                        <TableRow key={a.id}>
                            <TableCell>{a.studentName}</TableCell>
                            <TableCell>{a.counsellorName}</TableCell>
                            <TableCell>{format(new Date(a.date), 'PPP')} at {a.time}</TableCell>
                        </TableRow>
                    ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          
          <Card className="md:col-span-3 rounded-2xl shadow-lg">
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
    </>
  );
}
