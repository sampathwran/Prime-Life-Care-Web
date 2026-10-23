'use client';

import { useEffect } from 'react';
import { trackSiteVisit } from '@/lib/firestoreService';

export function VisitorTracker() {
  useEffect(() => {
    trackSiteVisit();
  }, []);

  return null;
}
