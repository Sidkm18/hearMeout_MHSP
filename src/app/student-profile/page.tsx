
'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Loader2, User, Mail, GraduationCap, Edit, Check, CalendarDays, LineChart, BookOpen } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { db } from '@/lib/firebase';
import { collection, query, where, orderBy, limit, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import type { JournalEntry } from '@/app/journal/page';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart as RechartsLineChart, Line } from 'recharts';
import { format } from 'date-fns';
import { useToast } from '@/hooks/use-toast';

export default function StudentProfilePage() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  
  const [journalEntries, setJournalEntries] = useState<JournalEntry[]>([]);
  const [isLoadingAnalytics, setIsLoadingAnalytics] = useState(true);

  const [isEditing, setIsEditing] = useState(false);
  const [editableName, setEditableName] = useState(user?.name || '');
  const [editableAcademicYear, setEditableAcademicYear] = useState(user?.academicYear || '');
  const [isSaving, setIsSaving] = useState(false);


  useEffect(() => {
    if (user) {
      setEditableName(user.name);
      setEditableAcademicYear(user.academicYear || '');
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;

    setIsLoadingAnalytics(true);
    const q = query(
      collection(db, 'journalEntries'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc'),
      limit(30)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const entries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JournalEntry));
      setJournalEntries(entries.reverse()); // reverse to have dates in ascending order for chart
      setIsLoadingAnalytics(false);
    }, (error) => {
      console.error("Error fetching analytics data: ", error);
      setIsLoadingAnalytics(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSave = async () => {
      if (!user) return;
      setIsSaving(true);
      try {
          const userDocRef = doc(db, 'users', user.uid);
          await updateDoc(userDocRef, {
              name: editableName,
              academicYear: editableAcademicYear
          });
          toast({ title: 'Success', description: 'Your profile has been updated.' });
          setIsEditing(false);
          // Note: The auth context user will update on next page reload. For instant UI update, we'd need to update context state.
      } catch (error) {
          console.error('Error updating profile:', error);
          toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' });
      } finally {
          setIsSaving(false);
      }
  }


  if (loading || !user) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  const moodChartData = journalEntries.slice(-7).map(entry => ({
    date: format(entry.createdAt.toDate(), 'MMM d'),
    mood: entry.overallMood,
  }));
  
  const totalJournalEntries = journalEntries.length;

  return (
    <>
      <Header />
      <main className="container py-8">
         <Card className="w-full max-w-4xl mx-auto rounded-2xl shadow-lg">
            <CardHeader className="bg-muted/30 p-6 rounded-t-2xl">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <Avatar className="h-24 w-24 border-4 border-background">
                            <AvatarImage src={`https://i.pravatar.cc/150?u=${user.email}`} />
                            <AvatarFallback className="text-3xl">{user.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        <div>
                             {isEditing ? (
                                <Input 
                                    className="text-4xl font-bold font-headline"
                                    value={editableName}
                                    onChange={(e) => setEditableName(e.target.value)}
                                />
                             ) : (
                                <CardTitle className="font-headline text-4xl">{user.name}</CardTitle>
                             )}
                            <CardDescription className="text-lg">Student Profile</CardDescription>
                        </div>
                    </div>
                     {isEditing ? (
                        <Button onClick={handleSave} disabled={isSaving}>
                            {isSaving ? <Loader2 className="animate-spin" /> : <Check className="mr-2"/>} Save
                        </Button>
                    ) : (
                        <Button variant="outline" onClick={() => setIsEditing(true)}>
                            <Edit className="mr-2"/> Edit Profile
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <h3 className="font-semibold text-lg border-b pb-2">Personal Information</h3>
                    <div className="flex items-center gap-4">
                        <Mail className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm">{user.email}</span>
                    </div>
                     <div className="flex items-center gap-4">
                        <GraduationCap className="w-5 h-5 text-muted-foreground" />
                         {isEditing ? (
                            <Input 
                                value={editableAcademicYear}
                                onChange={(e) => setEditableAcademicYear(e.target.value)}
                                placeholder="e.g. 2nd Year"
                            />
                         ) : (
                            <span className="text-sm">{user.academicYear || 'Not specified'}</span>
                         )}
                    </div>
                </div>

                 <div className="space-y-6">
                    <h3 className="font-semibold text-lg border-b pb-2">My Activity</h3>
                     <div className="flex items-center gap-4">
                        <BookOpen className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm">
                           {isLoadingAnalytics ? <Loader2 className="animate-spin w-4 h-4" /> : `${totalJournalEntries} journal entries written`}
                        </span>
                    </div>
                     <div className="flex items-center gap-4">
                        <CalendarDays className="w-5 h-5 text-muted-foreground" />
                        <span className="text-sm">2 appointments booked</span>
                    </div>
                </div>

                <div className="md:col-span-2">
                     <h3 className="font-semibold text-lg border-b pb-2 mb-4">Recent Mood Overview</h3>
                     {isLoadingAnalytics ? <div className="flex justify-center h-60 items-center"><Loader2 className="w-8 h-8 animate-spin" /></div> :
                        journalEntries.length > 0 ? (
                        <ResponsiveContainer width="100%" height={250}>
                            <RechartsLineChart data={moodChartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="date" />
                                <YAxis domain={[1, 10]} />
                                <Tooltip contentStyle={{ backgroundColor: 'hsl(var(--background))', border: '1px solid hsl(var(--border))' }} />
                                <Legend />
                                <Line type="monotone" dataKey="mood" stroke="hsl(var(--primary))" strokeWidth={2} name="Overall Mood (out of 10)" />
                            </RechartsLineChart>
                        </ResponsiveContainer>
                        ) : (
                           <div className="flex flex-col items-center justify-center h-60 bg-muted/50 rounded-lg">
                             <LineChart className="w-12 h-12 text-muted-foreground mb-2"/>
                             <p className="text-muted-foreground">No mood data available yet.</p>
                             <p className="text-xs text-muted-foreground">Start journaling to see your mood trends.</p>
                           </div>
                        )
                     }
                </div>
            </CardContent>
        </Card>
      </main>
    </>
  );
}
