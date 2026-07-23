# TRINETRA · त्रिनेत्र

> When the third eye opens, an age ends.

Cinematic scroll-told promo site for a fictional Indian mythological epic — built on [scroll-engine](https://github.com/ashwaniarya/scroll-engine), consumed as a GitHub npm dependency.

```bash
npm install     # engine builds itself on install via its prepare script
npm run dev     # http://localhost:5174/?dev=1
```

Seven screens, one scroll: ember field → title reveal → mandala prophecy → the trishul → the last temple → the cast → the third eye opens. Six composited WebGL layers (each with its own scene and camera) + six HTML layers, all scrubbing GSAP timelines from a single ScrollTrigger progress.

`?dev=1` (or backtick) opens the engine's Tweakpane dev panel — every layer's visibility, opacity, z-order, and scroll range is live-tweakable.

All 3D is lit primitives; every asset is generated in code. The film, its cast, and its release date are fictional.
