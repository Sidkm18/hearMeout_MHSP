
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BreathingExercisePage() {
  const router = useRouter();
  const [instruction, setInstruction] = useState('Get Ready...');
  const [cycle, setCycle] = useState(0);
  const [isHolding, setIsHolding] = useState(false);

  const breathingCycle = [
    { instruction: 'Breathe In', duration: 4000 },
    { instruction: 'Hold', duration: 7000 },
    { instruction: 'Breathe Out', duration: 8000 },
  ];

  useEffect(() => {
    const totalCycleTime = breathingCycle.reduce((sum, item) => sum + item.duration, 0);

    const performCycle = () => {
      // Breathe In
      setInstruction('Breathe In');
      setIsHolding(false);
      setTimeout(() => {
        // Hold
        setInstruction('Hold');
        setIsHolding(true);
        setTimeout(() => {
          // Breathe Out
          setInstruction('Breathe Out');
          setIsHolding(false);
        }, breathingCycle[1].duration);
      }, breathingCycle[0].duration);
    };

    // Start the first cycle after a brief pause
    const initialTimeout = setTimeout(() => {
      performCycle();
      // Set up subsequent cycles
      const intervalId = setInterval(performCycle, totalCycleTime);

      // Cleanup interval on component unmount
      return () => clearInterval(intervalId);
    }, 2000);

    // Cleanup initial timeout on unmount
    return () => clearTimeout(initialTimeout);
  }, []); // Empty dependency array ensures this runs only once on mount


  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 flex flex-col items-center justify-center transition-colors duration-1000">
      <Button
        onClick={() => router.back()}
        className="absolute top-8 left-8 rounded-full"
        variant="secondary"
        size="lg"
      >
        <ArrowLeft className="mr-2 h-5 w-5" /> Back to Safety
      </Button>

      <div className="relative flex items-center justify-center w-64 h-64">
        <div
          className={cn(
            'absolute bg-white/50 rounded-full transition-transform duration-[4000ms] ease-in-out',
            { 'scale-100': instruction === 'Breathe In' || isHolding },
            { 'scale-50': instruction === 'Breathe Out' || instruction === 'Get Ready...' }
          )}
          style={{ width: '100%', height: '100%', transitionDuration: instruction === 'Breathe Out' ? '8000ms' : '4000ms' }}
        />
        <div className="z-10 text-center">
          <p className="text-4xl font-bold text-gray-700 font-headline">{instruction}</p>
        </div>
      </div>
       <p className="absolute bottom-10 text-center text-muted-foreground max-w-md">
        This is a 4-7-8 breathing technique. Follow the prompts to help calm your mind and body. You can leave this page any time you feel ready.
      </p>
    </div>
  );
}
