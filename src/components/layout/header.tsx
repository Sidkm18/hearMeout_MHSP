'use client';

import { useAuth } from '@/hooks/use-auth';
import { Logo } from '../logo';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { LogOut, User as UserIcon } from 'lucide-react';
import Link from 'next/link';

export function Header() {
  const { user, logout } = useAuth();

  const getProfileLink = () => {
    if (!user) return '/';
    switch (user.role) {
      case 'Student':
        return '/student-profile';
      case 'Counsellor':
        return '/counsellor-profile';
      default:
        return '#';
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-20 items-center justify-between">
        <Logo />
        <nav className="flex items-center gap-4">
          {user ? (
            <>
            {user.role === 'Student' && (
                <div className="hidden md:flex items-center gap-4 text-sm font-medium">
                    <Link href="/student" className="text-muted-foreground transition-colors hover:text-foreground">Dashboard</Link>
                    <Link href="/journal" className="text-muted-foreground transition-colors hover:text-foreground">Journal</Link>
                    <Link href="/meditation" className="text-muted-foreground transition-colors hover:text-foreground">Meditation</Link>
                    <Link href="/forums" className="text-muted-foreground transition-colors hover:text-foreground">Forums</Link>
                </div>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={`https://i.pravatar.cc/150?u=${user.email}`} alt={user.name} />
                    <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{user.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                {(user.role === 'Student' || user.role === 'Counsellor') && (
                  <>
                    <DropdownMenuItem asChild>
                       <Link href={getProfileLink()}>
                        <UserIcon className="mr-2 h-4 w-4" />
                        <span>Profile</span>
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                <DropdownMenuItem onClick={logout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            </>
          ) : (
            <Button asChild>
              <Link href="/">Login</Link>
            </Button>
          )}
        </nav>
      </div>
    </header>
  );
}
