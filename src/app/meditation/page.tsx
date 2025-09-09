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
import { healMeResources } from '@/lib/data';
import { Wind, BookOpen, BrainCircuit, Play } from 'lucide-react';

export default function MeditationPage() {
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
            {healMeResources.meditations.map((meditation) => (
              <Card key={meditation.id} className="overflow-hidden group">
                <div className="relative">
                  <Image
                    src={meditation.thumbnail}
                    alt={meditation.title}
                    width={600}
                    height={400}
                    data-ai-hint={meditation.dataAiHint}
                    className="aspect-video object-cover w-full transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                     <Button variant="secondary" size="icon" className="h-14 w-14 rounded-full opacity-80 group-hover:opacity-100 transition-opacity">
                         <Play className="h-8 w-8 fill-current"/>
                     </Button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold">{meditation.title}</h3>
                  <p className="text-sm text-muted-foreground">{meditation.duration}</p>
                </div>
              </Card>
            ))}
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
