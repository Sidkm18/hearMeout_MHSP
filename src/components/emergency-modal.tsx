
'use client';

import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, Phone, MessageSquare, ShieldAlert, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface EmergencyModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

function BreathingExercise({ onBack }: { onBack: () => void }) {
  const [instruction, setInstruction] = useState('Get Ready...');
  const [isHolding, setIsHolding] = useState(false);

  const breathingCycle = [
    { instruction: 'Breathe In', duration: 4000 },
    { instruction: 'Hold', duration: 7000 },
    { instruction: 'Breathe Out', duration: 8000 },
  ];

  useEffect(() => {
    const totalCycleTime = breathingCycle.reduce((sum, item) => sum + item.duration, 0);

    const performCycle = () => {
      setInstruction('Breathe In');
      setIsHolding(false);
      setTimeout(() => {
        setInstruction('Hold');
        setIsHolding(true);
        setTimeout(() => {
          setInstruction('Breathe Out');
          setIsHolding(false);
        }, breathingCycle[1].duration);
      }, breathingCycle[0].duration);
    };

    const initialTimeout = setTimeout(() => {
      performCycle();
      const intervalId = setInterval(performCycle, totalCycleTime);
      return () => clearInterval(intervalId);
    }, 2000);

    return () => clearTimeout(initialTimeout);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center py-4">
       <Button
        onClick={onBack}
        className="absolute top-4 left-4"
        variant="ghost"
        size="sm"
      >
        <ArrowLeft className="mr-2 h-4 w-4" /> Back
      </Button>
       <div className="relative flex items-center justify-center w-48 h-48 mt-8">
        <div
          className={cn(
            'absolute bg-blue-100 rounded-full transition-transform',
            { 'scale-100': instruction === 'Breathe In' || isHolding },
            { 'scale-50': instruction === 'Breathe Out' || instruction === 'Get Ready...' }
          )}
          style={{ 
              width: '100%', 
              height: '100%', 
              transitionDuration: instruction === 'Breathe Out' ? '8000ms' : '4000ms',
              transitionTimingFunction: 'ease-in-out',
           }}
        />
        <div className="z-10 text-center">
          <p className="text-3xl font-bold text-gray-700">{instruction}</p>
        </div>
      </div>
       <p className="mt-8 text-center text-muted-foreground text-sm max-w-xs">
        Follow the prompts to help calm your mind and body. You can return to the previous screen when you feel ready.
      </p>
    </div>
  );
}


export function EmergencyModal({ isOpen, onOpenChange }: EmergencyModalProps) {
  const [showBreathingExercise, setShowBreathingExercise] = useState(false);

  // Reset to the main view when the modal is closed
  useEffect(() => {
    if (!isOpen) {
      setShowBreathingExercise(false);
    }
  }, [isOpen]);


  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        {showBreathingExercise ? (
           <BreathingExercise onBack={() => setShowBreathingExercise(false)} />
        ) : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-2xl text-destructive">
                <Heart className="h-6 w-6" /> You're Not Alone
              </DialogTitle>
              <DialogDescription className="pt-2 text-base">
                If you're having thoughts of self-harm or are in crisis, please
                reach out for immediate help.
              </DialogDescription>
            </DialogHeader>

            <div className="py-4 space-y-6">
              <Button onClick={() => setShowBreathingExercise(true)} size="lg" className="w-full bg-green-100 text-green-800 hover:bg-green-200">
                <Heart className="mr-2 h-5 w-5" /> Start Calming Exercise
              </Button>

              <div>
                <h3 className="mb-4 text-lg font-semibold text-center">Emergency Contacts</h3>
                <div className="space-y-4">
                  <a href="tel:1-800-273-8255" className="block p-4 rounded-lg border border-red-200 bg-red-50/50 hover:bg-red-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <Phone className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-bold text-destructive">Crisis Helpline</p>
                        <p className="text-sm text-muted-foreground">24/7 crisis support</p>
                        <p className="text-lg font-semibold text-destructive">1-800-273-8255</p>
                      </div>
                    </div>
                  </a>
                  <a href="tel:555-123-4567" className="block p-4 rounded-lg border border-red-200 bg-red-50/50 hover:bg-red-50 transition-colors">
                    <div className="flex items-start gap-4">
                      <MessageSquare className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
                      <div>
                        <p className="font-bold text-destructive">Campus Counseling</p>
                        <p className="text-sm text-muted-foreground">Campus emergency support</p>
                        <p className="text-lg font-semibold text-destructive">(555) 123-4567</p>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </div>

            <div className="text-center text-xs text-muted-foreground">
              <p>
                If this is a life-threatening emergency, please call <span className="font-bold">911</span>. Your
                safety and well-being matter. Help is always available.
              </p>
            </div>
        </>
        )}
      </DialogContent>
    </Dialog>
  );
}
