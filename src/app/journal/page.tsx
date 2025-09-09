'use client';

import { useState } from 'react';
import { Header } from '@/components/layout/header';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';

export default function JournalPage() {
  const [entry, setEntry] = useState('');

  return (
    <>
      <Header />
      <main className="container py-8 flex justify-center">
        <Card className="w-full max-w-4xl rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-4xl">My Journal</CardTitle>
            <CardDescription>
              A private space for your thoughts, feelings, and reflections. Your
              entries are safe and secure.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Textarea
              value={entry}
              onChange={(e) => setEntry(e.target.value)}
              placeholder="Start writing... What's on your mind today?"
              className="min-h-[50vh] rounded-xl text-base"
            />
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="outline">Load Previous Entry</Button>
              <Button>Save Entry</Button>
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
