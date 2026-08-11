'use client';

import { useEffect } from 'react';

export const useUTMTracker = () => {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const urlParams = new URLSearchParams(window.location.search);
    const utmParams = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'];

    const utmData: Record<string, string> = {};
    let fromGoogle = false;

    utmParams.forEach((param) => {
      const value = urlParams.get(param);
      if (value) {
        localStorage.setItem(param, value);
        utmData[param] = value;

        if (param === 'utm_source' && value.toLowerCase() === 'google') {
          fromGoogle = true;
        }
      }
    });

    const alreadyTracked = localStorage.getItem('utm-logged');

    if (fromGoogle && !alreadyTracked) {
      const visitorInfo = {
        ...utmData,
        userAgent: navigator.userAgent,
        referrer: document.referrer || null,
      };

      fetch('/api/log-utm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(visitorInfo),
      })
        .then((res) => {
          if (res.ok) {
            localStorage.setItem('utm-logged', 'true');
          }
        })
        .catch((err) => {
          console.error('Failed to log UTM visitor:', err);
        });
    }
  }, []);
};
