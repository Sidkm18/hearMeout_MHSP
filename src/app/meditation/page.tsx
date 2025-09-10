
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
import { Play, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { db } from '@/lib/firebase';
import { collection, onSnapshot, query } from 'firebase/firestore';
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

type GroupedResources = {
  [key in Resource['type']]?: Resource[];
};

export default function SelfHelpResourcesPage() {
  const [resources, setResources] = useState<Resource[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const q = query(collection(db, 'resources'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedResources: Resource[] = [];
      snapshot.forEach((doc) => {
        fetchedResources.push({ id: doc.id, ...(doc.data() as Omit<Resource, 'id'>) });
      });
      setResources(fetchedResources);
      setIsLoading(false);
    }, (error) => {
      console.error("Error fetching resources: ", error);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const groupedResources = resources.reduce((acc, resource) => {
    const { type } = resource;
    if (!acc[type]) {
      acc[type] = [];
    }
    acc[type]!.push(resource);
    return acc;
  }, {} as GroupedResources);

  const resourceOrder: Resource['type'][] = ['video', 'audio', 'spotify', 'book', 'article'];
  const resourceTitles: Record<Resource['type'], string> = {
    video: "Helpful Videos",
    audio: "Guided Meditations & Audio",
    spotify: "Curated Spotify Playlists",
    book: "Recommended Books",
    article: "Interesting Articles"
  }

  return (
    <>
      <Header />
      <main className="container py-8">
        <h2 className="font-headline text-4xl mb-2">Self Help Resources</h2>
        <p className="text-muted-foreground mb-8">
          Explore our collection of curated resources to support your mental wellness journey.
        </p>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-10 w-10 animate-spin" />
          </div>
        ) : (
          <div className="space-y-8">
            {resourceOrder.map(type => (
              groupedResources[type] && groupedResources[type]!.length > 0 && (
                <Card key={type} className="rounded-2xl shadow-lg">
                  <CardHeader>
                    <CardTitle>{resourceTitles[type]}</CardTitle>
                  </CardHeader>
                  <CardContent className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                    {groupedResources[type]!.map((resource) => (
                      <Link href={resource.link} key={resource.id} target="_blank" className="group relative overflow-hidden rounded-lg">
                        <div className="relative">
                          <Image
                            src={resource.thumbnail || 'https://picsum.photos/600/400'}
                            alt={resource.title}
                            width={600}
                            height={400}
                            className="aspect-video object-cover w-full transition-transform group-hover:scale-105"
                          />
                          {(type === 'video' || type === 'audio') && (
                            <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                              <Button variant="secondary" size="icon" className="h-12 w-12 rounded-full opacity-80 group-hover:opacity-100 transition-opacity">
                                <Play className="h-6 w-6 fill-current" />
                              </Button>
                            </div>
                          )}
                           <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity p-4 flex flex-col justify-end">
                                <h3 className="font-bold text-lg text-white drop-shadow-md">{resource.title}</h3>
                                <p className="text-sm text-white/90 drop-shadow-md line-clamp-2">{resource.description}</p>
                            </div>
                        </div>
                         <div className="p-3 bg-card/50">
                            <h3 className="font-semibold truncate">{resource.title}</h3>
                            {resource.duration && <p className="text-sm text-muted-foreground">{resource.duration}</p>}
                          </div>
                      </Link>
                    ))}
                  </CardContent>
                </Card>
              )
            ))}
          </div>
        )}
      </main>
    </>
  );
}
