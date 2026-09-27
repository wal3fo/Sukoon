# TEA HOUSE SINGLE-PAGE LAYOUT — QUICK REFERENCE

## Visual Page Structure

```
┌─────────────────────────────────────────────────────┐
│ STICKY HEADER                                       │
│ Logo | Home | Collection | Story | Benefits |       │
│       Journal | Contact | [Shop CTA]               │
└─────────────────────────────────────────────────────┘
                        ↓
┌─────────────────────────────────────────────────────┐
│ 1. HERO SECTION (60vh)                              │
│ "Organic tea, picked by hand and roasted..."        │
│ [CTA: Shop Collection] [CTA: How We Source]         │
│ ↓ Scroll indicator                                  │
└─────────────────────────────────────────────────────┘
          ↓ (30px gap)
┌─────────────────────────────────────────────────────┐
│ 2. FEATURED PRODUCT (micro-section, 8vh)            │
│ "Our most loved tea" + single product card          │
│ "Explore all →" [anchor link]                       │
└─────────────────────────────────────────────────────┘
          ↓ (60px gap)
┌─────────────────────────────────────────────────────┐
│ 3. PRODUCTS COLLECTION                              │
│ [Filter Tabs] [Green] [Black] [White] [Herbal]      │
│                                                      │
│ ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐ │
│ │Product 1│  │Product 2│  │Product 3│  │Product 4│ │
│ │[image]  │  │[image]  │  │[image]  │  │[image]  │ │
│ │Name     │  │Name     │  │Name     │  │Name     │ │
│ │Desc     │  │Desc     │  │Desc     │  │Desc     │ │
│ │FROM $XX │  │FROM $XX │  │FROM $XX │  │FROM $XX │ │
│ └─────────┘  └─────────┘  └─────────┘  └─────────┘ │
│                                                      │
│ (grid continues 8-12 items, scrollable)             │
│                                                      │
│ [CLICK PRODUCT → MODAL OPENS]                       │
│                                                      │
│ MODAL:                                               │
│ ┌────────────────────────────────────────────────┐  │
│ │ Product Name                            [X]    │  │
│ ├────────────────────────────────────────────────┤  │
│ │ [← Gallery Carousel →]   │  Price: $XX        │  │
│ │  (4-5 images)            │  Rating: ★★★★☆    │  │
│ │                          │  Description       │  │
│ │                          │  (full copy)       │  │
│ │                          │                    │  │
│ │                          │  Qty: [1]  [+] [-]│  │
│ │                          │  [ADD TO CART]     │  │
│ │                          │  [Details ▼]      │  │
│ │                          │  • Ingredients    │  │
│ │                          │  • Brewing        │  │
│ │                          │  • Origin         │  │
│ └────────────────────────────────────────────────┘  │
│                                                      │
└─────────────────────────────────────────────────────┘
          ↓ (80px gap — reset)
┌─────────────────────────────────────────────────────┐
│ 4. OUR STORY (60vh)                                 │
│ "Twenty-five years of buying tea the slow way"      │
│                                                      │
│ TIMELINE (vertical, alternating):                   │
│ ●─── Year 1: Founded with passion                   │
│     [image] Short story                             │
│                                                      │
│      Year 5: First harvest from direct estate       │
│     [image] Short story ───●                        │
│                                                      │
│ ●─── Year 10: Small kiln built                      │
│     [image] Short story                             │
│      (continues to Year 25, present day)            │
│                                                      │
└─────────────────────────────────────────────────────┘
          ↓ (60px gap)
┌─────────────────────────────────────────────────────┐
│ 5. HOW WE WORK (Sourcing) (25vh)                    │
│                                                      │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐ │
│ │  Sourced │  │ Roasted  │  │  Packed  │  │ Shipped  │ │
│ │   icon   │  │   icon   │  │   icon   │  │   icon   │ │
│ │ We work  │  │ Small lot│  │ By hand, │  │ Arrives  │ │
│ │ with...  │  │ roasting │  │ fresh... │  │ 3-5 days │ │
│ └──────────┘  └──────────┘  └──────────┘  └──────────┘ │
│                                                      │
└─────────────────────────────────────────────────────┘
          ↓ (80px gap)
┌─────────────────────────────────────────────────────┐
│ 6. HEALTH BENEFITS (40vh, dark background)          │
│ "A drink that does a small number of things..."     │
│                                                      │
│ ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐     │
│ │ ♦ icon │  │ ♦ icon │  │ ♦ icon │  │ ♦ icon │     │
│ │Digestion│  │Caffeine│  │Fluoride│  │Hydration│    │
│ │ copy...│  │ copy...│  │ copy...│  │ copy... │     │
│ └────────┘  └────────┘  └────────┘  └────────┘     │
│                                                      │
│ ┌────────┐  ┌────────┐  ┌────────┐  ┌────────┐     │
│ │ ♦ icon │  │ ♦ icon │  │ ♦ icon │  │ ♦ icon │     │
│ │ (5-8 total benefits shown)                       │
│                                                      │
└─────────────────────────────────────────────────────┘
          ↓ (80px gap)
┌─────────────────────────────────────────────────────┐
│ 7. TEA JOURNAL (60vh + expanded articles)            │
│ Featured Articles:                                   │
│                                                      │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│ │ [image]  │  │ [image]  │  │ [image]  │            │
│ │Title     │  │Title     │  │Title     │            │
│ │Excerpt   │  │Excerpt   │  │Excerpt   │            │
│ │Read time │  │Read time │  │Read time │            │
│ │[Read →]  │  │[Read →]  │  │[Read →]  │            │
│ └──────────┘  └──────────┘  └──────────┘            │
│                                                      │
│ EXPANDED ARTICLE (full):                            │
│ [Hero image]                                        │
│ Article Title                                       │
│ By Author | Date | 8 min read                       │
│ ─────────────────────────────────────────           │
│ Full article body (~1000 words)                      │
│ Lorem ipsum dolor sit amet...                       │
│ (continues, scrollable)                             │
│                                                      │
│ RELATED ARTICLES:                                   │
│ ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│ │[thumb]   │  │[thumb]   │  │[thumb]   │            │
│ │Title     │  │Title     │  │Title     │            │
│ └──────────┘  └──────────┘  └──────────┘            │
│                                                      │
└─────────────────────────────────────────────────────┘
          ↓ (80px gap)
┌─────────────────────────────────────────────────────┐
│ 8. TESTIMONIALS (40vh)                              │
│ "What our community says"                           │
│                                                      │
│ [Scroll-snap carousel — each snaps into view]       │
│                                                      │
│ ┌─────────────────────────────────┐                 │
│ │ "This tea changed my mornings." │ <-- visible     │
│ │ - Sarah Chen, Designer          │                 │
│ │ ★★★★★                           │                 │
│ └─────────────────────────────────┘                 │
│        [← | dots | →]                               │
│                                                      │
│ (more testimonials snap into view on scroll)        │
│                                                      │
└─────────────────────────────────────────────────────┘
          ↓ (80px gap)
┌─────────────────────────────────────────────────────┐
│ 9. CONTACT / STAY CONNECTED (50vh)                  │
│                                                      │
│ Newsletter Signup:                                  │
│ "Get weekly tea wisdom"                             │
│ [Email input] [Subscribe button]                    │
│                                                      │
│ Contact Info:                                       │
│ Hours: Mon-Fri 9am-6pm | Sat 10am-4pm | Sun Closed │
│ Email: hello@teahouse.com | +1 (555) 123-4567      │
│ Address: [address]                                  │
│ Socials: [icons]                                    │
│                                                      │
│ FAQ ACCORDION:                                      │
│ ┌──────────────────────────────────────────┐        │
│ │ ▼ How long does tea stay fresh?          │        │
│ │   Tea stays fresh for 6-12 months in ... │        │
│ └──────────────────────────────────────────┘        │
│ ┌──────────────────────────────────────────┐        │
│ │ ► Do you ship internationally?            │        │
│ └──────────────────────────────────────────┘        │
│ ┌──────────────────────────────────────────┐        │
│ │ ► What is your return policy?             │        │
│ └──────────────────────────────────────────┘        │
│ (5-8 Q&As total)                                    │
│                                                      │
└─────────────────────────────────────────────────────┘
          ↓ (30px gap)
┌─────────────────────────────────────────────────────┐
│ FOOTER (15vh)                                       │
│                                                      │
│ [Logo] Quick Links | Socials | Copyright            │
│ © 2024 Tea House. All rights reserved.              │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## Key Metrics

| Section | Height | Content | Spacing Below |
|---------|--------|---------|---|
| Hero | 60vh | Main headline, CTAs | 30px |
| Featured Product | 8vh | 1 product card | 60px |
| Products Grid | 50vh + | 8–12 cards, filters | 80px |
| Story | 60vh | Narrative, timeline | 60px |
| Sourcing | 25vh | 4 info cards | 80px |
| Benefits | 40vh | 6–8 benefit cards (dark bg) | 80px |
| Journal | 60vh + | 3 featured + full article | 80px |
| Testimonials | 40vh | 5–8 testimonial cards | 80px |
| Contact | 50vh | Newsletter, info, FAQ | 30px |
| Footer | 15vh | Logo, links, copyright | — |
| **TOTAL** | **~500vh+** | **11 sections** | **responsive** |

---

## Navigation & Scrolling

### Header Navigation (Sticky)
```
Tea House Logo | Home | Collection | Story | Benefits | Journal | Contact | [SHOP CTA]
```

### Smooth Scroll Behavior
- Click nav link → page scrolls smoothly to section
- Active link highlights as user scrolls
- Mobile: hamburger menu → drawer → anchor links → close on click

### Scroll Events
- **Scroll reveal**: sections fade in + rise 12px on entry
- **Product modal**: scroll locks on body when open
- **Testimonial carousel**: scroll-snap active on each card

---

## Interactive Elements

### Product Modal
- Trigger: click any product card in grid
- Content: image carousel + info + add-to-cart
- Close: Esc key, outside click, close button
- Mobile: full-screen drawer (slides up)
- Behavior: scroll-lock on body, focus-trap in modal

### FAQ Accordion
- Click Q → answer expands
- Click another Q → first closes
- Keyboard: Tab to navigate, Enter to toggle
- Multiple can't be open simultaneously (classic accordion)

### Testimonial Carousel
- CSS scroll-snap: each testimonial snaps into view
- Optional: prev/next buttons (if enhanced with JS)
- Mobile: swipe or scroll to next
- Indicators: dots showing current position

### Image Carousel (in Product Modal)
- Gallery: 1 main image + 3–5 thumbnails below
- Click thumbnail → main image updates
- Prev/next arrows for large screen
- Keyboard: arrow keys navigate

---

## Mobile Responsive Breakpoints

### 390px (Mobile)
```
Header: sticky, hamburger menu
Hero: full width, 70vh (slightly smaller)
Featured: stack
Products: 1 column, modal full-screen
Story: 1 column, timeline vertical
Sourcing: 1 column (cards stack)
Benefits: 2 columns or stack
Journal: 1 column, article full width
Testimonials: 1 column, scroll-snap
Contact: 1 column
Footer: 1 column
```

### 768px (Tablet)
```
Products: 2 columns
Benefits: 2 columns
Journal: 2 columns (first 3 cards)
Testimonials: 2 columns (snap every 2)
```

### 1024px+ (Desktop)
```
Products: 4 columns
Benefits: 4 columns
Journal: 3 columns (cards)
Testimonials: 1 column, scroll-snap carousel
All sections: max-width 1200px, centered
```

---

## Scroll Depth & Engagement

### Above Fold (Hero)
- Immediate engagement
- Clear CTA: "Shop the collection"
- Scroll indicator: "↓ Scroll to explore"

### First Scroll (Featured + Products)
- 30% reach page → Featured product
- 40% reach page → Products grid with filters
- Entry point for browsing

### Mid-Scroll (Story + Sourcing)
- 50% reach page → Story section (narrative)
- Build trust, establish heritage
- Show production process

### Deep Scroll (Benefits + Journal)
- 70% reach page → Health benefits (proof)
- 75% reach page → Journal/blog (thought leadership)
- Educational content

### Bottom of Page (Testimonials + Contact)
- 90% reach page → Testimonials (social proof)
- 95% reach page → Contact + FAQ
- Conversion point: newsletter signup

---

## Performance Targets

| Metric | Target | How |
|--------|--------|-----|
| LCP | < 2.5s | Hero image optimized, preload critical |
| FID | < 100ms | Minimize JS, defer non-critical |
| CLS | < 0.1 | Reserve space for images, lazy-load below-fold |
| Total Size | < 180 KB | Single HTML + CSS + JS gzipped |
| Images | 50% of weight | Lazy-load with intersection observer |
| Lighthouse | > 90 | Optimize performance, accessibility, SEO |

---

## Single-Page Advantages

✅ **No page reloads** = seamless experience  
✅ **Shared header/footer** = DRY code  
✅ **Smooth scroll** = premium feel  
✅ **All content crawlable** = SEO friendly  
✅ **Single URL** = easier bookmarking & sharing  
✅ **Lazy loading** = fast initial load  

---

## What Changes from v0

| Element | v0 (Current) | Single-Page |
|---------|---|---|
| Home page | Complete | Becomes "Hero" section |
| Navigation | Header only | Header + anchor links to sections |
| Products | Would be separate page | Section 3 with modal detail |
| About | Would be separate page | Section 4 (Story) |
| Blog | Would be separate page | Section 7 (Featured articles) |
| Contact | Would be separate page | Section 9 (Email + FAQ) |
| Footer | Global | Stays at bottom |
| Modal | For future pages | Product detail modal |
| Accordion | Not present | FAQ accordion |

---

## Implementation Priority

### Week 1 (Foundation)
1. Convert v0 to single-page structure
2. Add all section IDs + anchor nav
3. Build product modal
4. Test responsive at 390/1440

### Week 2 (Content)
5. Build story + sourcing + benefits + journal sections
6. Extend content (copy, images, timeline)
7. Build FAQ accordion
8. Test scroll performance

### Week 3 (Polish)
9. Build testimonials carousel
10. Optimize images, lazy loading
11. Final responsive test
12. Documentation

---

**Ready to build single-page. Reference this for layout + scroll flow.**

