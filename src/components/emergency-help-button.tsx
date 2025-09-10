'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ShieldAlert } from 'lucide-react';
import { EmergencyModal } from '@/components/emergency-modal';
import { useAuth } from '@/hooks/use-auth';

export function EmergencyHelpButton() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { user } = useAuth();

  if (user?.role !== 'Student') {
    return null;
  }

  return (
    <>
      <Button
        onClick={() => setIsModalOpen(true)}
        variant="destructive"
        className="fixed bottom-6 right-6 h-16 w-16 rounded-full shadow-2xl z-50 flex items-center justify-center"
        aria-label="Emergency Help"
      >
        <ShieldAlert className="h-8 w-8" />
      </Button>
      <EmergencyModal isOpen={isModalOpen} onOpenChange={setIsModalOpen} />
    </>
  );
}
