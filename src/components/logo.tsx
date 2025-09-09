import { BrainCircuit } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

export const Logo = ({ className }: { className?: string }) => {
  return (
    <Link href="/" className={cn("flex items-center gap-2", className)}>
      <BrainCircuit className="h-8 w-8 text-primary" />
      <h1 className="font-headline text-3xl font-bold text-primary">
        Inner Space
      </h1>
    </Link>
  );
};
