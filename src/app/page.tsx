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
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Logo } from '@/components/logo';
import { useAuth } from '@/hooks/use-auth';
import type { UserRole } from '@/lib/types';

export default function LoginPage() {
  const [role, setRole] = useState<UserRole>('Student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');

  const { signUp, signIn, error, loading } = useAuth();

  const handleSignUp = async () => {
    await signUp(email, password, role, name);
  };

  const handleSignIn = async () => {
    await signIn(email, password);
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
            Your safe space for mental wellness. Please sign in or create an
            account.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="signin">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="signin" className="space-y-4 pt-4">
              <div className="space-y-2">
                <Label htmlFor="email-signin">Email</Label>
                <Input
                  id="email-signin"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signin">Password</Label>
                <Input
                  id="password-signin"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
               {error && <p className="text-sm text-destructive">{error}</p>}
              <Button onClick={handleSignIn} disabled={loading} className="w-full">
                {loading ? 'Signing In...' : 'Sign In'}
              </Button>
            </TabsContent>
            <TabsContent value="signup" className="space-y-4 pt-4">
               <div className="space-y-2">
                <Label htmlFor="name-signup">Full Name</Label>
                <Input
                  id="name-signup"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email-signup">Email</Label>
                <Input
                  id="email-signup"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password-signup">Password</Label>
                <Input
                  id="password-signup"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Role</Label>
                <Select
                  onValueChange={(value) => setRole(value as UserRole)}
                  defaultValue={role}
                >
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
               {error && <p className="text-sm text-destructive">{error}</p>}
              <Button onClick={handleSignUp} disabled={loading} className="w-full">
                 {loading ? 'Signing Up...' : 'Sign Up'}
              </Button>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
