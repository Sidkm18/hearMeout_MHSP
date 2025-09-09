'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Logo } from '@/components/logo';
import { useAuth } from '@/hooks/use-auth';
import type { UserRole } from '@/lib/types';

export default function LoginPage() {
  const [role, setRole] = useState<UserRole>('Student');
  const { login } = useAuth();

  const handleLogin = () => {
    login(role);
  };

  return (
    <div className="flex min-h-screen w-full flex-col items-center justify-center p-4">
      <div className="absolute top-8 left-8">
        <Logo />
      </div>
      <Card className="w-full max-w-md rounded-2xl shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="font-headline text-4xl">
            Welcome to Inner Space
          </CardTitle>
          <CardDescription className="pt-2">
            Your safe space for mental wellness. Please select your role to
            begin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Select onValueChange={(value) => setRole(value as UserRole)} defaultValue={role}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Student">Student</SelectItem>
                <SelectItem value="Counsellor">Counsellor</SelectItem>
                <SelectItem value="Volunteer">Volunteer</SelectItem>
                <SelectItem value="Admin">Admin</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
        <CardFooter>
          <Button className="w-full" onClick={handleLogin}>
            Login
          </Button>
        </CardFooter>
      </Card>
      <p className="mt-8 text-center text-sm text-primary-foreground/50">
        This is a mock authentication system. No password required.
      </p>
    </div>
  );
}
