## 2024-06-25 - Prerender Canvas Gradients
**Learning:** In the StarField component, we create a new radial gradient for every large star on every frame. Creating gradients and rendering them dynamically is CPU intensive. By pre-rendering the star glow to an offscreen canvas once, we can just use `drawImage`, which is about 10x faster (tested 226ms vs 20ms for 600 frames).
**Action:** Always pre-render complex canvas operations like gradients or drop shadows into offscreen canvases if they are drawn many times per frame without changing shape.
