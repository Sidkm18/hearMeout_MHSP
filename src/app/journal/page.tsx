
'use client';

import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { Header } from '@/components/layout/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import {
  Heart,
  Smile,
  Meh,
  Frown,
  Angry,
  SmilePlus,
  Annoyed,
  WandSparkles,
  Zap,
  Coffee,
  Brain,
  Leaf,
  Sparkles,
  Plus,
  Trash2,
  BrainCircuit,
  Loader2,
  CalendarDays,
  Tag,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export interface JournalEntry {
  id?: string;
  userId: string;
  title: string;
  content: string;
  overallMood: number;
  specificEmotions: string[];
  tags: string[];
  createdAt: Timestamp;
  updatedAt?: Timestamp;
}

const emotionOptions = [
  { name: 'Happy', icon: Smile },
  { name: 'Sad', icon: Frown },
  { name: 'Neutral', icon: Meh },
  { name: 'Loved', icon: Heart },
  { name: 'Energetic', icon: Zap },
  { name: 'Calm', icon: Leaf },
  { name: 'Optimistic', icon: Sparkles },
  { name: 'Melancholy', icon: Coffee },
  { name: 'Frustrated', icon: Angry },
  { name: 'Motivated', icon: SmilePlus },
  { name: 'Peaceful', icon: Leaf },
  { name: 'Excited', icon: WandSparkles },
];

const suggestedTags = [
  'work', 'school', 'family', 'friends', 'health', 'exercise',
  'stress', 'anxiety', 'depression', 'sleep', 'relationships', 'achievement'
];

const emptyEntry: Omit<JournalEntry, 'id' | 'userId' | 'createdAt'> = {
  title: '',
  content: '',
  overallMood: 5,
  specificEmotions: [],
  tags: [],
};

export default function JournalPage() {
  const { user } = useAuth();
  const { toast } = useToast();

  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [currentEntry, setCurrentEntry] = useState<Omit<JournalEntry, 'id' | 'userId' | 'createdAt'> | JournalEntry>(emptyEntry);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [tagInput, setTagInput] = useState('');

  useEffect(() => {
    if (!user) {
      setIsLoading(false);
      return;
    };

    const q = query(
      collection(db, 'journalEntries'),
      where('userId', '==', user.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userEntries = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as JournalEntry));
      setEntries(userEntries);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching journal entries:", error);
      toast({ title: 'Error', description: 'Could not fetch journal entries.', variant: 'destructive' });
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, [user, toast]);

  const handleNewEntry = () => {
    setCurrentEntry({...emptyEntry, title: `Journal Entry for ${format(new Date(), 'PPP')}`});
    setEditingId(null);
  };
  
  const handleSelectEntry = (entry: JournalEntry) => {
    setCurrentEntry(entry);
    setEditingId(entry.id!);
  }

  const handleSave = async () => {
    if (!user) {
      toast({ title: 'Not Authenticated', description: 'You must be logged in to save an entry.', variant: 'destructive' });
      return;
    }
    if(!currentEntry.content) {
       toast({ title: 'Empty Entry', description: 'Cannot save an empty journal entry.', variant: 'destructive' });
       return;
    }

    setIsSaving(true);
    try {
      const entryData = {
        ...currentEntry,
        updatedAt: serverTimestamp(),
      };

      if (editingId) {
        const entryDoc = doc(db, 'journalEntries', editingId);
        await updateDoc(entryDoc, entryData);
        toast({ title: 'Success', description: 'Journal entry updated.' });
      } else {
        const newEntryData = {
          ...currentEntry,
          userId: user.uid,
          createdAt: serverTimestamp(),
        };
        const newDocRef = await addDoc(collection(db, 'journalEntries'), newEntryData);
        toast({ title: 'Success', description: 'New journal entry saved.' });
        handleNewEntry();
        setEditingId(newDocRef.id);
      }
    } catch (error) {
      console.error('Error saving entry:', error);
      toast({ title: 'Error', description: 'Failed to save journal entry.', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  };
  
  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this entry? This action cannot be undone.")) return;

    setIsSaving(true);
    try {
        await deleteDoc(doc(db, 'journalEntries', id));
        toast({ title: 'Entry Deleted', description: 'Your journal entry has been removed.' });
        handleNewEntry();
    } catch(error) {
        console.error("Error deleting entry:", error);
        toast({ title: 'Error', description: 'Failed to delete journal entry.', variant: 'destructive' });
    } finally {
        setIsSaving(false);
    }
  }

  const moodValueToLabel = (value: number): string => {
    if (value <= 2) return 'Very Low';
    if (value <= 4) return 'Low';
    if (value <= 6) return 'Neutral';
    if (value <= 8) return 'Good';
    return 'Excellent';
  };

  const toggleEmotion = (emotionName: string) => {
    setCurrentEntry(prev => {
      const newEmotions = prev.specificEmotions.includes(emotionName)
        ? prev.specificEmotions.filter(e => e !== emotionName)
        : [...prev.specificEmotions, emotionName];
      return { ...prev, specificEmotions: newEmotions };
    });
  };

  const handleTagInput = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && tagInput.trim() !== '') {
      e.preventDefault();
      addTag(tagInput.trim());
    }
  };

  const addTag = (tag: string) => {
    if (tag && !currentEntry.tags.includes(tag)) {
      setCurrentEntry(prev => ({ ...prev, tags: [...prev.tags, tag] }));
    }
    setTagInput('');
  };

  const removeTag = (tagToRemove: string) => {
    setCurrentEntry(prev => ({ ...prev, tags: prev.tags.filter(tag => tag !== tagToRemove) }));
  };

  const allTags = useMemo(() => {
    const tags = new Set<string>();
    entries.forEach(entry => entry.tags.forEach(tag => tags.add(tag)));
    return Array.from(tags);
  }, [entries]);


  return (
    <>
      <Header />
      <main className="container py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          {/* Journal Entries List */}
          <div className="lg:col-span-1 space-y-4">
              <Card className="rounded-2xl shadow-lg">
                <CardHeader>
                  <CardTitle>My Journal Entries</CardTitle>
                   <CardDescription>You have {entries.length} entries.</CardDescription>
                </CardHeader>
                <CardContent className="max-h-[70vh] overflow-y-auto">
                   {isLoading ? <div className="flex justify-center"><Loader2 className="animate-spin" /></div> :
                    <div className="space-y-3">
                         <Button onClick={handleNewEntry} className="w-full"><Plus className="mr-2"/> New Entry</Button>
                        {entries.map(entry => (
                           <div key={entry.id} onClick={() => handleSelectEntry(entry)} className="p-4 rounded-lg cursor-pointer border hover:bg-accent transition-colors">
                             <h3 className="font-semibold">{entry.title || "Journal Entry"}</h3>
                             <p className="text-sm text-muted-foreground">
                                {entry.createdAt ? format(entry.createdAt.toDate(), 'MMMM dd, yyyy') : 'Date pending...'}
                             </p>
                           </div>
                        ))}
                    </div>
                   }
                </CardContent>
              </Card>
          </div>

          {/* Journal Editor */}
          <div className="lg:col-span-2 space-y-6">
            <Card className="rounded-2xl shadow-lg">
                <CardHeader className="flex flex-row justify-between items-center">
                    <div>
                        <CardTitle className="flex items-center gap-2"><Heart className="text-primary"/> {editingId ? 'Edit Journal Entry' : 'New Journal Entry'}</CardTitle>
                    </div>
                    <Badge variant="outline">{currentEntry.overallMood}/10 - {moodValueToLabel(currentEntry.overallMood)}</Badge>
                </CardHeader>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card className="rounded-2xl shadow-lg">
                    <CardHeader>
                        <CardTitle>How are you feeling?</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <Label>Overall Mood</Label>
                            <Slider
                                value={[currentEntry.overallMood]}
                                onValueChange={(value) => setCurrentEntry({...currentEntry, overallMood: value[0]})}
                                max={10}
                                step={1}
                            />
                            <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Very Low</span>
                                <span>Neutral</span>
                                <span>Excellent</span>
                            </div>
                        </div>
                        <div className="space-y-4 mt-6">
                            <Label>Specific Emotions</Label>
                            <div className="flex flex-wrap gap-2">
                                {emotionOptions.map(({ name, icon: Icon }) => (
                                <Button
                                    key={name}
                                    variant={currentEntry.specificEmotions.includes(name) ? 'default' : 'outline'}
                                    size="sm"
                                    onClick={() => toggleEmotion(name)}
                                    className="rounded-full"
                                >
                                    <Icon className="mr-2" />
                                    {name}
                                </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                </Card>

                <Card className="rounded-2xl shadow-lg">
                    <CardHeader>
                        <CardTitle>Tags & Categories</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Label>Add Tags</Label>
                        <div className="flex gap-2">
                            <Input
                                value={tagInput}
                                onChange={(e) => setTagInput(e.target.value)}
                                onKeyDown={handleTagInput}
                                placeholder="Type a tag and press Enter..."
                            />
                             <Button size="icon" onClick={() => addTag(tagInput.trim())}><Plus /></Button>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-2">
                            {currentEntry.tags.map(tag => (
                                <Badge key={tag} variant="secondary" className="group">
                                    {tag}
                                    <button onClick={() => removeTag(tag)} className="ml-1 opacity-50 group-hover:opacity-100">&times;</button>
                                </Badge>
                            ))}
                        </div>
                        <Label className="mt-4 block">Suggested Tags</Label>
                        <div className="flex flex-wrap gap-1 mt-2">
                            {suggestedTags.map(tag => (
                                <Button key={tag} size="sm" variant="ghost" onClick={() => addTag(tag)}>
                                    # {tag}
                                </Button>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
            
             <Card className="rounded-2xl shadow-lg">
                <CardHeader>
                    <div className="flex justify-between items-center">
                         <Input 
                            value={currentEntry.title}
                            onChange={(e) => setCurrentEntry({...currentEntry, title: e.target.value})}
                            placeholder="Give your entry a title..."
                            className="text-lg font-semibold w-full border-0 shadow-none focus-visible:ring-0"
                         />
                        <Button variant="outline"><BrainCircuit className="mr-2"/> Prompts</Button>
                    </div>
                </CardHeader>
                <CardContent>
                     <Textarea
                        value={currentEntry.content}
                        onChange={(e) => setCurrentEntry({...currentEntry, content: e.target.value})}
                        placeholder="What's on your mind today? Take your time and write freely..."
                        className="min-h-[30vh] rounded-xl text-base"
                    />
                    <div className="mt-4 flex justify-between items-center">
                        <p className="text-sm text-muted-foreground">{currentEntry.content.length} characters</p>
                        <div className="flex gap-2">
                            {editingId && (
                               <Button variant="destructive" onClick={() => handleDelete(editingId)} disabled={isSaving}>
                                {isSaving ? <Loader2 className="animate-spin" /> : <Trash2/>}
                               </Button>
                            )}
                            <Button variant="outline" onClick={handleNewEntry}>Cancel</Button>
                            <Button onClick={handleSave} disabled={isSaving}>
                                {isSaving ? <Loader2 className="animate-spin" /> : 'Save Now'}
                            </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>

          </div>
        </div>
      </main>
    </>
  );
}

    