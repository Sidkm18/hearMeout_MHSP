'use client';

import Image from 'next/image';
import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wind, BookOpen, BrainCircuit, Play, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import Link from 'next/link';

interface Resource {
  id: string;
  title: string;
  type: 'video' | 'book' | 'article' | 'audio' | 'spotify';
  link: string;
  description: string;
  thumbnail: string;
  duration?: string;
}

export default function MeditationPage() {
  const [meditations, setMeditations] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(
      collection(db, 'resources'),
      where('type', 'in', ['video', 'audio'])
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedMeditations: Resource[] = [];
      snapshot.forEach((doc) => {
        fetchedMeditations.push({ id: doc.id, ...(doc.data() as Omit<Resource, 'id'>) });
      });
      setMeditations(fetchedMeditations);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching meditation resources: ", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      <Header />
      <main className="container py-8">
        <h2 className="font-headline text-4xl mb-2">Find Your Inner Peace</h2>
        <p className="text-muted-foreground mb-8">
          Explore our collection of guided meditations to relax your mind and body.
        </p>

        <Card className="rounded-2xl shadow-lg mb-8">
          <CardHeader>
            <CardTitle>Meditation Sessions</CardTitle>
            <CardDescription>
              Choose a session that fits your mood and schedule.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
            {isLoading ? (
              <div className="col-span-full flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : (
              meditations.map((meditation) => (
              <Link href={meditation.link} key={meditation.id} target="_blank" className="group relative overflow-hidden rounded-lg">
                <div className="relative">
                  <Image
                    src={meditation.thumbnail || 'https://picsum.photos/600/400'}
                    alt={meditation.title}
                    width={600}
                    height={400}
                    className="aspect-video object-cover w-full transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                     <Button variant="secondary" size="icon" className="h-14 w-14 rounded-full opacity-80 group-hover:opacity-100 transition-opacity">
                         <Play className="h-8 w-8 fill-current"/>
                     </Button>
                  </div>
                </div>
                <div className="p-4 bg-card">
                  <h3 className="font-semibold">{meditation.title}</h3>
                  {meditation.duration && <p className="text-sm text-muted-foreground">{meditation.duration}</p>}
                </div>
              </Link>
            )))}
          </CardContent>
        </Card>

        <Card className="rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle>Explore Topics</CardTitle>
            <CardDescription>
              Learn more about different wellness practices.
            </CardDescription>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
             <Button variant="outline" className="h-24 flex-col gap-2 text-lg">
                <Wind/>
                Breathing Techniques
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2 text-lg">
                <BookOpen/>
                Recommended Books
            </Button>
            <Button variant="outline" className="h-24 flex-col gap-2 text-lg">
                <BrainCircuit/>
                Mindfulness
            </Button>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
