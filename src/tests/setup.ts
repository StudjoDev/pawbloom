import '@testing-library/jest-dom';

// Mock IndexedDB for Dexie
import 'fake-indexeddb/auto';

// Mock navigator.vibrate
Object.defineProperty(navigator, 'vibrate', {
  value: () => true,
  writable: true
});

// Mock matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: (query: string) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: () => {},
    removeListener: () => {},
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => false,
  }),
});
