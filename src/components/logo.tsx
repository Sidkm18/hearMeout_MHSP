
'use client';

import Link from 'next/link';
import { cn } from '@/lib/utils';
import { BrainCircuit } from 'lucide-react';

export const Logo = ({ className }: { className?: string }) => {
  return (
    <Link href="/" className={cn('flex items-center gap-2 group', className)}>
      <div className="p-2 bg-primary/10 rounded-lg">
        <BrainCircuit className="w-6 h-6 text-primary" />
      </div>
      <span className="font-headline text-2xl font-bold text-foreground group-hover:text-primary transition-colors">
        hearMeout
      </span>
    </Link>
  );
};
