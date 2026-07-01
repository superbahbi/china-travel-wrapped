# China Travel Wrapped — Design Brainstorm

## Three Stylistic Approaches

### 1. Neon Noir China
A dark, moody dashboard inspired by Spotify Wrapped's bold gradients, but filtered through the neon glow of Chinese city nightlife — Shenzhen's tech towers, Guilin's lantern-lit rivers.
**Probability:** 0.07

### 2. Ink & Electric
Traditional Chinese ink-wash aesthetics collide with electric Spotify-style data cards. Brush-stroke dividers, bold vermilion and jade accents on deep charcoal, with glowing stat numbers.
**Probability:** 0.04

### 3. Gradient Feast (CHOSEN)
Full-bleed Spotify Wrapped energy: rich gradient backgrounds per card (coral→tangerine, indigo→violet, jade→teal), bold white typography, animated number counters, and swipeable "story" cards stacked vertically. Each section feels like a separate chapter of a travel story.
**Probability:** 0.09

---

## Chosen Approach: Gradient Feast

### Design Movement
**Bold Data Storytelling** — inspired by Spotify Wrapped 2023/2024, Airbnb Year in Review, and Chinese social media aesthetics (小红书 / RedNote visual language).

### Core Principles
1. **Each card is a story** — every stat section has its own gradient identity, big bold number, and a punchy one-liner caption
2. **Dark canvas, bright data** — deep near-black background (#0d0d0f) lets the gradient cards pop like screens in a dark cinema
3. **Motion as narrative** — numbers count up on scroll, cards slide in from below, progress bars fill with a satisfying ease
4. **Chinese cultural color nods** — vermilion red, jade green, and gold woven into the gradient palette

### Color Philosophy
The palette draws from the cities visited:
- **Shenzhen Coral**: `#FF6B6B → #FF8E53` (urban energy, heat)
- **Guilin Jade**: `#11998e → #38ef7d` (karst mountains, rivers)
- **Kunming Violet**: `#8360c3 → #2ebf91` (spring city, altitude)
- **Night Sky**: `#0d0d0f` background — makes every card glow
- **Gold Accent**: `#FFD700` for the biggest stats

### Layout Paradigm
Vertical scroll of full-width "Wrapped cards" — each section is a tall card (min 60vh) with a centered stat and supporting context below. No traditional sidebar or grid. Pure storytelling scroll.

### Signature Elements
1. **Giant gradient numbers** — the main stat fills 30-40% of the card height
2. **Pill category badges** — colorful rounded tags for each spending category
3. **Animated progress arcs** — circular progress rings for budget tracking

### Interaction Philosophy
- Scroll-triggered entrance animations (IntersectionObserver)
- Number counters animate from 0 to final value when card enters viewport
- Hover on city cards reveals per-day breakdown

### Animation
- Cards: `translateY(40px) opacity(0)` → `translateY(0) opacity(1)`, 600ms ease-out, staggered 100ms
- Numbers: count-up animation over 1200ms with easeOutExpo
- Progress bars: width 0 → final%, 800ms ease-out, 200ms delay
- Background gradient: slow 8s shift animation on hero

### Typography System
- **Display**: `Syne` (Google Fonts) — bold, geometric, modern for big numbers
- **Body**: `DM Sans` — clean, friendly, readable for labels and descriptions
- **Mono**: `JetBrains Mono` — for amounts and transaction counts

### Brand Essence
*Your China trip, in numbers — for the traveler who tracks every yuan.*
Personality: **Bold · Playful · Precise**

### Brand Voice
Headlines feel like Spotify Wrapped copy: punchy, second-person, celebratory.
- "You've eaten your way through 7 cities 🍜"
- "That's ¥X spent — and worth every fen"
Ban: "Welcome to your dashboard", "Total Expenses"

### Wordmark & Logo
A stylized 元 (yuan symbol) inside a gradient circle — the brand mark for the header.

### Signature Brand Color
**Vermilion Coral** `#FF6B6B` — unmistakably this brand's energy color.
