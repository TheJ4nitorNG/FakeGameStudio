# Design Guidelines: Fake Game Studio Creator Platform

## Design Approach

**Reference-Based Approach** drawing inspiration from:
- **Discord/Slack**: Community-focused layouts with sidebar navigation
- **GitHub/Linear**: Clean developer aesthetics, project organization
- **Steam/itch.io**: Game showcasing, browsing experiences
- **Notion**: Flexible content presentation, card-based layouts

**Design Philosophy**: Professional game dev platform aesthetic with subtle satirical personality. Balance credibility (feels like a real dev platform) with creative chaos (celebrates the absurd).

## Typography

**Font Stack**:
- **Primary**: Inter (UI, body text) - clean, developer-friendly
- **Display**: Space Grotesk (headings, studio names) - geometric, modern gaming feel
- **Mono**: JetBrains Mono (code snippets, fake patch notes) - authentic dev aesthetic

**Hierarchy**:
- Hero/Studio Names: text-5xl to text-6xl, font-bold
- Section Headers: text-3xl to text-4xl, font-semibold
- Card Titles/Project Names: text-xl to text-2xl, font-semibold
- Body Text: text-base, leading-relaxed
- Metadata/Tags: text-sm, font-medium

## Layout System

**Spacing Primitives**: Use Tailwind units of **2, 4, 8, 12, 16, 20** for consistent rhythm
- Component padding: p-4, p-6, p-8
- Section spacing: py-12, py-16, py-20
- Card gaps: gap-4, gap-6, gap-8

**Container Strategy**:
- Max width: max-w-7xl for main content areas
- Sidebar: fixed w-64 or w-72 for navigation
- Content grids: 2-3 columns on desktop (grid-cols-2 lg:grid-cols-3)

## Core Components

**Navigation**:
- Persistent sidebar (desktop) with collapsed mobile drawer
- Categories: Trending Studios, Active Projects, Cursed Engines, Patch Notes Archive
- User profile dropdown, notifications bell

**Studio/Project Cards**:
- Prominent featured image/fake game screenshot
- Studio name with verified-style badge (satirical)
- Description snippet with "Last Updated" timestamp
- Tags for engine types, genres, status (In Development, Cancelled, Cursed)
- Engagement metrics: followers, fake commit count

**Content Blocks**:
- **Patch Notes**: Terminal-style code blocks with mono font
- **Dev Logs**: Blog-style posts with rich formatting
- **Project Graveyard**: Faded styling for cancelled projects
- **Engine Showcase**: Split layout with specs on left, cursed features on right

**Forms & Inputs**:
- Rounded corners (rounded-lg)
- Clear labels above fields
- Placeholder text with dev humor ("e.g., Unity but worse")
- Create Studio/Project CTAs prominently featured

## Page Structures

**Landing Page**:
- Hero: Full-width featured studio carousel with blurred backdrop, white text, glass-morphism CTA buttons
- Trending Studios: 3-column grid of studio cards
- Recent Patch Notes: 2-column feed with terminal aesthetic
- Community Highlights: Featured cursed engines or cancelled projects
- Footer: Quick links, fake API docs link, social

**Studio Profile**:
- Cover banner image (fake game art)
- Studio info sidebar: name, fake founding date, member count
- Main content: Tabbed interface (Projects, Patch Notes, About, Cursed Commits)
- Project grid with filtering options

**Project Detail**:
- Hero image (fake screenshot/concept art)
- Breadcrumb navigation
- Left column: Project details, tech stack (satirical), status
- Right column: Latest updates, fake changelogs
- Comment section for "feedback" and roleplay

## Visual Elements

**Imagery**:
- Hero sections: Yes - full-width banners featuring user-uploaded fake game art
- Project cards: Thumbnail images (16:9 aspect ratio)
- Studio avatars: Circular, 40px-64px depending on context
- Placeholder graphics: Retro pixel art or glitch aesthetics when no image

**Iconography**:
- Use **Heroicons** for UI elements (navigation, actions)
- Custom badges/status indicators for project states

**Animations**:
- Minimal, purposeful: Card hover lift (subtle), skeleton loading states
- Page transitions: Smooth fade-ins for content
- No distracting scroll animations

## Distinctive Features

- **"Verified Fake" Badges**: Playful checkmarks for established studios
- **Commit Graph Parody**: Fake activity graphs on studio profiles
- **Status Pills**: Color-coded tags (Active, Hiatus, Gloriously Broken, Cancelled)
- **Terminal Themes**: Dark mode code blocks for patch notes with syntax highlighting
- **Brutalist Touches**: Occasional bold typography, raw borders to contrast with polish

## Accessibility

- High contrast ratios for text readability
- Keyboard navigation throughout
- ARIA labels for interactive elements
- Focus indicators on all interactive components
- Semantic HTML structure for screen readers

---

**Design Personality**: Think Linear meets Discord meets itch.io — clean, organized developer interface with room for creative chaos and satirical flair. Professional enough to feel "real," playful enough to celebrate the absurd.