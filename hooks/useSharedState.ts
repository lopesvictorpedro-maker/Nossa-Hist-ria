import { useState, useEffect, useCallback } from 'react';
import { useLiveSync } from '../contexts/LiveSyncContext';

const channel = new BroadcastChannel('love_app_sync');

/**
 * A custom hook that works like useState but persists to localStorage
 * and syncs across other tabs/windows in real-time AND across devices via P2P.
 */
export function useSharedState<T>(key: string, initialValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Use the sync context to send updates remotely
  // Since LiveSyncProvider provides a default value with no-op functions,
  // we can safely call this hook even if the provider is missing (though our App ensures it exists).
  const { sendUpdate } = useLiveSync();

  // Initialize state from localStorage or default
  const [state, setState] = useState<T>(() => {
    try {
      if (typeof window !== 'undefined') {
        const item = window.localStorage.getItem(key);
        return item ? JSON.parse(item) : initialValue;
      }
      return initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Wrapped setter that updates state, localStorage, broadcasts change, and sends P2P
  const setSharedState = useCallback((value: T | ((val: T) => T)) => {
    setState((current) => {
      const newValue = value instanceof Function ? value(current) : value;
      
      try {
        window.localStorage.setItem(key, JSON.stringify(newValue));
        
        // Notify other tabs
        channel.postMessage({ key, value: newValue });
        
        // Notify remote partner
        if (sendUpdate) {
            sendUpdate(key, newValue);
        }

      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
      
      return newValue;
    });
  }, [key, sendUpdate]);

  // Listen for changes from other tabs AND remote updates (which come via broadcast from Context)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data && event.data.key === key) {
        setState(event.data.value);
      }
    };

    channel.addEventListener('message', handleMessage);
    return () => channel.removeEventListener('message', handleMessage);
  }, [key]);

  return [state, setSharedState];
}