
'use client';

import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { Loader2 } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';

export default function CounsellorProfilePage() {
  const { user } = useAuth();

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
      <main className="container py-8 flex justify-center">
        <Card className="w-full max-w-2xl rounded-2xl shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-4xl">My Profile</CardTitle>
            <CardDescription>View and manage your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
             <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={user.name} readOnly />
            </div>
             <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input id="email" value={user.email} readOnly />
            </div>
             <div className="space-y-2">
                <Label htmlFor="role">Role</Label>
                <Input id="role" value={user.role} readOnly />
            </div>
          </CardContent>
        </Card>
      </main>
    </>
  );
}
