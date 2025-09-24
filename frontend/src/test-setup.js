class MockIntersectionObserver {
  constructor() {}
  observe() {}
  unobserve() {}
  disconnect() {}
  takeRecords() { return []; }
}

if (typeof window !== 'undefined') {
  if (!('IntersectionObserver' in window)) {
    window.IntersectionObserver = MockIntersectionObserver;
  }
  if (!('IntersectionObserverEntry' in window)) {
    window.IntersectionObserverEntry = class {};
  }
}

if (!('IntersectionObserver' in globalThis)) {
  globalThis.IntersectionObserver = MockIntersectionObserver;
}
if (!('IntersectionObserverEntry' in globalThis)) {
  globalThis.IntersectionObserverEntry = class {};
}
