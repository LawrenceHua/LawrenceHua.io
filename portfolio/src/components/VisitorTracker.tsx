"use client";

import { useEffect } from 'react';
import { usePathname } from 'next/navigation';

export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    const trackVisitorLocation = async () => {
      try {
        // Get or create session ID
        let sessionId = sessionStorage.getItem('sessionId');
        if (!sessionId) {
          sessionId = 'visitor-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
          sessionStorage.setItem('sessionId', sessionId);
        }

        // Track visitor location
        await fetch('/api/track-visitor-location', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            sessionId,
            userAgent: navigator.userAgent,
            referrer: document.referrer || null,
            pathname: pathname || '/',
          }),
        });

        console.log('🌍 Visitor location tracked for:', pathname);
      } catch (error) {
        console.error('Failed to track visitor location:', error);
      }
    };

    // Track on initial load and route changes
    trackVisitorLocation();
  }, [pathname]);

  return null; // This component renders nothing
} 