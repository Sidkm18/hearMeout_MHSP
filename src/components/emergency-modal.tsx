
'use client';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Heart, Phone, MessageSquare, ShieldAlert } from 'lucide-react';
import Link from 'next/link';

interface EmergencyModalProps {
  isOpen: boolean;
  onOpenChange: (isOpen: boolean) => void;
}

export function EmergencyModal({ isOpen, onOpenChange }: EmergencyModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
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
           <Button asChild size="lg" className="w-full bg-green-100 text-green-800 hover:bg-green-200">
            <Link href="/breathing-exercise">
                <Heart className="mr-2 h-5 w-5" /> Start Calming Exercise
            </Link>
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
      </DialogContent>
    </Dialog>
  );
}
