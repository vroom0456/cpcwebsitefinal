# 📸 Chaitanya Photo Club (CPC) Web Application

A premium, modern, and high-performance gallery and club management web application built with **Next.js 15 (App Router)**, **TypeScript**, **Supabase (PostgreSQL)**, and **Google Drive API**. Designed to serve as the visual storytelling archive and administrative control center for the official photography club of Chaitanya Bharathi Institute of Technology (CBIT).

---

## 🏗️ Architecture & Technology Stack

The application splits into a high-fidelity **Public Gallery** and a secure **Admin Dashboard**, sharing a unified data sync engine.

### 🌟 Core Technologies
1. **Framework:** Next.js 15 (React 19, App Router) with Server Components (RSC) and server actions for optimal loading speeds and SEO.
2. **Database & Auth:** Supabase (PostgreSQL) hosting metadata, Row Level Security (RLS) policies, and custom RPC functions.
3. **Storage & Media Sync:** Google Drive API integration via Google Service Account authentication (serves as the primary content storage for high-resolution images).
4. **Styling:** Tailwind CSS with custom design tokens for brand consistency.
5. **Animations:** GSAP (GreenSock Animation Platform) and Framer Motion orchestrating micro-animations and scroll-driven effects.
6. **Icons:** Lucide React icons.
7. **Components:** Styled with a premium dark-mode transition aesthetic centered on white, black, muted sage green (`#8A9A86`), and muted dark mauve (`#5C4D54`).
8. **Typography:** Custom brand fonts `Amiamie` (sans-serif) and `Amiamie-Round` (display-serif).

---

## ⚡ Key Features

### 1. Unified Dynamic Styling & Layouts
* **Theme-Transition Layout:** A custom `PublicLayout` that wraps all client-side pages and handles smooth theme switching (light/dark modes) with coordinated color transitions (`white`, `black`, `sageGreen`, `darkMauve`).
* **Interactive UI Animations:** Fluid typography, text-masking slide-ups, custom scroll progress indicators, and staggered cards.
* **Mobile Responsiveness:** A collapsable sidebar navigation drawer utilizing viewport heights and scroll overflow management to ensure compatibility on smaller screens.

### 2. Auto-Synchronized Media Archive
* **Google Drive Sync Engine:** Administrators can bind Google Drive folders to events. Clicking "Sync" processes Google Drive photos recursively, extracting width, height, size, and EXIF metadata (camera make, model, lens details).
* **Cover Photo Auto-Assignment:** Sync scripts automatically set the event cover photo to the first file sorted by date/name, backfilling any null values in the database.
* **Subfolder Breadcrumb Navigation:** The public gallery supports recursive subfolders, allowing users to navigate complex nested folder hierarchies directly from the browser using dynamic breadcrumbs.

### 3. High-Fidelity Gallery Viewer
* **Masonry Photo Album:** Implements fluid, responsive masonry grid structures (`react-photo-album`) mapping same-origin endpoints.
* **Native Single Photo Downloads:** Leverages direct same-origin streaming endpoints (`/api/photos/[fileId]/download`) to resolve files natively, preventing memory bloating and ensuring correct filename extensions.
* **Batch ZIP Archiving:** Download selected images or entire event galleries as a single ZIP archive. Deduplicates filenames and retains subfolder directories within the ZIP.
* **Interactive Lightbox:** Displays high-resolution overlays (`yet-another-react-lightbox`) with zoom, slideshow, fullscreen, download triggers, and EXIF meta summaries.

---

## 🗄️ Database Schema (PostgreSQL)

The database schema enforces strict relational boundaries and Row Level Security (RLS) policies to keep draft logs and team workflows secure.

### 1. Core Tables
* **`members`**: Stores club student rosters (name, position, core status, profile photo). Core committee members have access to the dashboard.
* **`events`**: Houses metadata for campus events (title, slug, date, category, status like `draft`/`published`/`archived`).
* **`photos`**: Stores metadata synced from Google Drive (Google Drive file IDs, sizes, width, height, camera/lens parameters, views, downloads).
* **`tags` & `event_tags`**: Facilitates categorical tagging and cross-referencing.
* **`activity_logs`**: Tracks admin panel operations (`photos_synced`, `core_committee_updated`, etc.).

### 2. Event Assignment Junctions
Four distinct junction tables separate core organizers from general coverage contributors:
* `event_photography_team`
* `event_post_processing_team`
* `event_photography_core_committee`
* `event_post_processing_core_committee`

---

## 📁 Codebase Directory Structure

```
cpc-app/
├── db/                       # Supabase database migration scripts
│   └── migrations/           # PostgreSQL migration logs (0001 - 0008)
├── public/                   # Static assets (fonts, logo, fallback images)
├── src/
│   ├── app/                  # Next.js App Router (pages and api routes)
│   │   ├── (admin)/          # Admin-only dashboard pages (analytics, sync, logs)
│   │   ├── (public)/         # Public-facing pages (gallery, events, timeline)
│   │   └── api/              # Backend endpoints (drive sync, proxy download)
│   ├── components/           # Reusable UI parts
│   │   ├── admin/            # Dashboard widgets and sync controllers
│   │   ├── public/           # Gallery grid, lightbox, footer, nav drawer
│   │   └── ui/               # Base components (buttons, dialogs, badges)
│   ├── config/               # Site configuration and whitelists
│   ├── lib/                  # Services & API connectors
│   │   ├── actions/          # Next.js Server Actions
│   │   ├── drive/            # Google Drive Client & Sync services
│   │   └── supabase/         # Supabase Client server/client wrapper
│   ├── store/                # Zustand stores (selection state, favorites)
│   └── types/                # TypeScript database interfaces
├── tailwind.config.ts        # Brand theme utility overrides
└── next.config.js            # Image hostname domain whitelisting
```
