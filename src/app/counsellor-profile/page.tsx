
'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CounsellorProfilePage() {
  return (
    <>
      <Header />
      <main className="container py-8 flex justify-center">
        <Card className="w-full max-w-2xl rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-4xl">Counsellor Profile</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              This is where your counsellor profile information will be displayed and managed.
            </p>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
