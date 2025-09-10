
'use client';

import { useState, useEffect, useCallback } from 'react';
import { db } from '@/lib/firebase';
import {
  collection,
  query,
  where,
  doc,
  getDoc,
  setDoc,
  onSnapshot,
} from 'firebase/firestore';
import { format } from 'date-fns';

export interface Availability {
  [day: string]: string[]; // e.g., { 'Monday': ['09:00 AM', '10:00 AM'], 'Tuesday': [] }
}

export function useAvailability(counsellorId: string, selectedDate: Date | undefined) {
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchAvailableSlots = useCallback(async () => {
    if (!counsellorId || !selectedDate) {
      setAvailableSlots([]);
      return;
    }

    setIsLoading(true);
    let unsubscribeAppointments: (() => void) | null = null;
    try {
      const dayOfWeek = format(selectedDate, 'EEEE'); // e.g., "Monday"
      
      // 1. Get counsellor's general availability for that day of the week
      const availDocRef = doc(db, 'availabilities', counsellorId);
      const availDoc = await getDoc(availDocRef);
      const allAvailabilities: Availability = availDoc.exists() ? (availDoc.data() as Availability) : {};
      const counsellorDaySlots = allAvailabilities[dayOfWeek] || [];

      if (counsellorDaySlots.length === 0) {
        setAvailableSlots([]);
        setIsLoading(false);
        return;
      }
      
      // 2. Get appointments already booked for that specific date and counsellor
      const dateString = selectedDate.toISOString().split('T')[0];
      const appointmentsQuery = query(
        collection(db, 'appointments'),
        where('counsellorId', '==', counsellorId),
        where('date', '==', dateString)
      );
      
      // Use a variable to hold the unsubscribe function from onSnapshot
      unsubscribeAppointments = onSnapshot(appointmentsQuery, (snapshot) => {
        const bookedTimes = new Set<string>();
        snapshot.forEach((doc) => {
          bookedTimes.add(doc.data().time);
        });

        // 3. Filter out booked slots from the counsellor's general availability
        const freeSlots = counsellorDaySlots.filter(
          (slot) => !bookedTimes.has(slot)
        );

        setAvailableSlots(freeSlots);
        setIsLoading(false);
      }, (error) => {
        console.error("Error fetching booked appointments: ", error);
        setAvailableSlots(counsellorDaySlots); // Fallback to showing all slots on error
        setIsLoading(false);
      });

    } catch (error) {
      console.error('Error fetching availability:', error);
      setAvailableSlots([]);
      setIsLoading(false);
    }
    
    // Return a cleanup function that can be called
    return () => {
        if (unsubscribeAppointments) {
            unsubscribeAppointments();
        }
    };
  }, [counsellorId, selectedDate]);

  useEffect(() => {
    // To handle the async nature of fetchAvailableSlots and its returned cleanup function
    let cleanup: (() => void) | undefined;
    
    const run = async () => {
        cleanup = await fetchAvailableSlots();
    };

    run();

    return () => {
      if (cleanup) {
        cleanup();
      }
    };
  }, [fetchAvailableSlots]);

  return { availableSlots, isLoading };
}

export const useCounsellorAvailability = (counsellorId: string) => {
    const [availability, setAvailability] = useState<Availability>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!counsellorId) {
            setIsLoading(false);
            return;
        };

        const availDocRef = doc(db, 'availabilities', counsellorId);
        const unsubscribe = onSnapshot(availDocRef, (doc) => {
            if (doc.exists()) {
                setAvailability(doc.data() as Availability);
            } else {
                setAvailability({}); // Set to empty object if no doc exists
            }
            setIsLoading(false);
        }, (error) => {
            console.error("Error fetching counsellor availability:", error);
            setIsLoading(false);
        });

        return () => unsubscribe();
    }, [counsellorId]);

    const saveAvailability = async (newAvailability: Availability) => {
        if (!counsellorId) return;
        const availDocRef = doc(db, 'availabilities', counsellorId);
        await setDoc(availDocRef, newAvailability);
        setAvailability(newAvailability); // Optimistically update state
    };

    return { availability, saveAvailability, isLoading };
}
