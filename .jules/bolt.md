## 2024-05-30 - Optimize Scroll Listener
**Learning:** Found a layout thrashing issue in the scroll listener of `ScrollDots.tsx`. Calling `getBoundingClientRect()` inside a raw `scroll` event handler caused synchronous reflows multiple times per frame, blocking the main thread and slowing down the UI.
**Action:** Always throttle or debounce DOM read/write operations (like `getBoundingClientRect()`) triggered by high-frequency events (`scroll`, `mousemove`) using `requestAnimationFrame` or `IntersectionObserver` to prevent layout thrashing and maintain smooth 60fps scrolling.
