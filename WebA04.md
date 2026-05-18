<!--
Instructions for Claude:
Convert this Markdown into a formal academic Word document (.docx). Keep the title page, headings, tables, figure captions, code blocks, and appendix structure. Use professional formatting, page numbers, table borders, consistent heading styles, and a clean academic layout.

Important screenshot instruction:
Wherever this file contains [SCREENSHOT PLACEHOLDER: ...], keep a visible placeholder box in the Word document with the caption text below it. Do not remove these placeholders. The student will manually insert screenshots later.

Important diagram instruction:
Wherever this file contains [DIAGRAM PLACEHOLDER: ...], either convert the provided text/ASCII model into a neat diagram or leave a clear placeholder box with the caption. The student may replace these with manually prepared diagrams.

If any student name, enrollment number, instructor name, or section needs correction, keep it editable in the Word file.
-->

# Bahria University

## Assignment 4: Project Architecture / Frameworks / Responsive Design

## CLO-1 & CLO-2

**Project Title:** AuraBeat - AI-Powered Music Generation Platform  
**Course:** Web Application Development  
**Student Names:** Talha Naveed and Abdul Wahab  
**Enrollment Numbers:** 01-131232-089 and 01-131232-007  
**Section:** BSE-6A  
**Instructor:** Engr. Subas Bilal  
**Submission Date:** 17 May 2026  
**Hard Copy / Viva Date:** 18 May 2026  

---

# Table of Contents

1. Executive Summary  
2. Project Introduction  
3. Project Scope and Objectives  
4. Current Implementation Status  
5. Project Models  
6. Domain Model  
7. Hypertext / Navigation Model  
8. Presentation Model  
9. Application Architecture  
10. Framework Selection and Justification  
11. Responsive Design  
12. Testing  
13. Test Cases  
14. Incomplete Items and Completion Plan Before Viva  
15. Conclusion  
16. Appendix A: File and Route References  
17. Appendix B: Commands Used  
18. Appendix C: Screenshot Checklist  
19. Appendix D: Assignment Requirement Mapping  

---

# 1. Executive Summary

AuraBeat is a full-stack web application for AI-powered music generation, track management, browser-based audio editing, and API-based music workflow access. The application allows users to register, sign in, generate music from prompts, upload reference audio, save and manage tracks in a library, play tracks through a persistent audio player, use basic editing tools, manage profile information, and create API keys for developer access.

This report is prepared for Assignment 4, which requires a project design report covering project models, application architecture, selected framework, responsive design, and testing. The report documents the current implementation of AuraBeat and also clearly mentions partially completed or planned items that will be completed before the final project presentation.

The project is built using Next.js 14, React 18, TypeScript, Tailwind CSS, Supabase Auth, Supabase PostgreSQL, Supabase Storage, Zustand, Selenium WebDriver, ChromeDriver, and a Gradio/MusicGen AI backend.

---

# 2. Project Introduction

## 2.1 Project Overview

AuraBeat is an academic MVP of an AI music studio. Its main goal is to make AI music generation accessible through a browser-based interface. A user can describe the type of music they want, select a musical style, optionally provide lyrics or reference audio, and generate a track. The generated track is stored in the user's library and can be played through a persistent audio player.

In addition to music generation, AuraBeat includes supporting modules such as:

- Authentication and account management.
- Dashboard with recent tracks and profile summary.
- Music creation page.
- Speech generation page using browser speech synthesis.
- Track library.
- Music editor.
- Profile page.
- API platform for API keys.
- Admin dashboard for demo management.
- Public API endpoints for tracks and generation.
- Selenium-based CRUD test automation.

## 2.2 Problem Statement

Music generation tools are often complex, expensive, or difficult for non-technical users to operate. Many AI music tools also hide the technical process and do not demonstrate the full software engineering workflow behind AI integration. AuraBeat solves this academic problem by combining:

- A user-friendly interface for prompt-based music generation.
- Secure authentication and persistent storage.
- A clear architecture using modern web frameworks.
- A working AI integration pipeline.
- Automated testing with Selenium.
- A documented design model for presentation and assessment.

## 2.3 Project Purpose

The purpose of AuraBeat is to demonstrate a complete modern web application that includes:

1. A professional frontend interface.
2. User authentication.
3. Database-backed CRUD operations.
4. Cloud file storage.
5. AI service integration.
6. Responsive design approach.
7. Automated test cases.
8. A public API layer for developer use.

---

# 3. Project Scope and Objectives

## 3.1 Project Scope

The project scope includes:

- User registration and login.
- Protected application routes.
- Dashboard view.
- AI music creation workflow.
- Reference audio upload.
- Generated track metadata storage.
- Library listing, search, playback, and delete.
- Persistent audio player.
- Browser-based music editor.
- Profile management.
- API key management.
- Public track API.
- Selenium test automation for CRUD and main user flows.
- Responsive layout design for major pages.

## 3.2 Project Objectives

| Objective ID | Objective | Status |
|---|---|---|
| OBJ-01 | Build a full-stack AI music web application | Implemented |
| OBJ-02 | Provide authentication and route protection | Implemented |
| OBJ-03 | Store user profiles, tracks, and API keys | Implemented |
| OBJ-04 | Upload and play audio files | Implemented |
| OBJ-05 | Integrate AI music generation through Gradio/MusicGen | Implemented but dependent on live Gradio URL |
| OBJ-06 | Provide library CRUD operations | Create, Read, Delete implemented; Update partially planned |
| OBJ-07 | Provide responsive design | Implemented for many views; desktop-first areas still being improved |
| OBJ-08 | Add Selenium automated tests | Implemented |
| OBJ-09 | Add API platform and public endpoints | Implemented |
| OBJ-10 | Prepare final report and screenshots | Report prepared; screenshots to be inserted manually |

---

# 4. Current Implementation Status

The project is mostly implemented as a functional academic MVP. Some items are intentionally marked as partial because they will be polished before the final viva/presentation.

## 4.1 Implemented Features

| Feature | Description | Status |
|---|---|---|
| Registration | User can create an account with email and password | Implemented |
| Login | User can sign in with email and password | Implemented |
| Forgot Password | User can request reset email | Implemented |
| Reset Password | User can reset password with validation | Implemented |
| Dashboard | Shows profile summary, gold balance, plan, and recent tracks | Implemented |
| Create Music | Prompt, style, lyrics, reference audio, and generation flow | Implemented |
| Reference Audio Upload | Uploads audio file to Supabase Storage | Implemented |
| Library | Shows tracks, search, filter, grid/list view, playback, delete | Implemented |
| Audio Player | Persistent player with play, pause, progress, repeat, shuffle, volume | Implemented |
| Music Editor | UI and browser-based audio editing interactions | Implemented as MVP |
| Create Speech | Browser Web Speech API synthesis | Implemented as supporting feature |
| Profile | Display name, plan, gold balance, sign out | Implemented |
| API Platform | API key creation, display, deactivation | Implemented |
| Public API | Track list, detail, delete, and generate endpoints | Implemented |
| Admin Dashboard | Demo overview, stats, user update, track delete | Implemented for demo visibility |
| Selenium CRUD Test | Automated browser test for major CRUD flow | Implemented and passed |

## 4.2 Partially Implemented or Planned Improvements

| Item | Current Status | Planned Completion Before Presentation |
|---|---|---|
| Full track update endpoint | Track update is not exposed as public `PATCH` endpoint yet | Add `PATCH /v1/tracks/[id]` or authenticated update action |
| Mobile polish for editor | Editor is desktop-first due to complex waveform interface | Improve mobile overflow and screenshots |
| Storage cleanup on delete | Track database row is deleted, but storage object cleanup is not fully automated | Add cleanup plan or storage path tracking |
| AI backend reliability | Gradio URL is ephemeral and depends on Colab runtime | Start fresh Gradio URL before demo |
| Admin authorization | Admin access is visible for demo; strict admin check is commented | Re-enable role-based check if required |
| Screenshot collection | Screenshots are not embedded in this Markdown | Insert screenshots manually in Word document |

---

# 5. Project Models

Assignment 4 requires the following project models:

1. Domain Model.
2. Hypertext / Navigation Model.
3. Presentation Model.

These models are documented in the following sections. The models describe the main data objects, user navigation paths, and user interface structure of AuraBeat.

---

# 6. Domain Model

## 6.1 Domain Model Overview

The domain model describes the main concepts and entities in AuraBeat. The system is centered around authenticated users who generate, manage, play, and delete music tracks. Users also have profiles, gold credit balances, API keys, and optional admin capabilities.

## 6.2 Main Domain Entities

| Entity | Description |
|---|---|
| User | Represents an authenticated Supabase user |
| Profile | Stores display name, gold balance, plan, and created date |
| Track | Stores generated or uploaded music metadata |
| Audio File | Represents stored audio in Supabase Storage |
| Prompt | User's text input used for generation |
| Style Tag | Genre or style selected by the user |
| API Key | Developer key for accessing public API endpoints |
| Generation Request | Request sent to the AI backend |
| Audio Player State | Current track, playback status, queue, volume, repeat, shuffle |
| Admin User | User with platform management privileges |

## 6.3 Entity Details

### User

The User entity is managed by Supabase Auth. It contains identity information such as user ID and email. A user can own one profile, many tracks, and many API keys.

### Profile

The Profile entity stores application-specific user information:

- `id`
- `display_name`
- `gold_balance`
- `plan`
- `created_at`
- `is_admin` where available

The profile is used by the dashboard, sidebar, admin dashboard, and generation-credit system.

### Track

The Track entity is the main CRUD resource of AuraBeat. It contains:

- `id`
- `user_id`
- `title`
- `prompt`
- `style_tags`
- `audio_url`
- `duration_seconds`
- `status`
- `created_at`

Tracks are created during music generation or testing, read in the library and API, played through the audio player, and deleted through UI/API actions.

### API Key

The API Key entity allows a user to access public API endpoints. The raw API key is only shown once. The database stores a SHA-256 hash for security.

Important fields:

- `id`
- `user_id`
- `name`
- `key_hash`
- `prefix`
- `is_active`
- `created_at`
- `last_used_at`

### Generation Request

The Generation Request is created when the user submits a music prompt. It includes:

- Prompt text.
- Style tag.
- Instrumental/vocal setting.
- Lyrics.
- Vocal gender.
- Vocal tone.
- Reference audio URL.
- Melody audio URL.

The request is processed by the prompt engineering layer and sent to the AI backend.

## 6.4 Domain Relationships

| Relationship | Description |
|---|---|
| User 1 - 1 Profile | Each authenticated user has one profile |
| User 1 - Many Tracks | A user can generate and store many tracks |
| User 1 - Many API Keys | A user can create multiple API keys |
| Track 1 - 1 Audio File | Each completed track points to an audio file URL |
| Track Many - Many Style Tags | A track may contain multiple style tags |
| Generation Request 1 - 1 Track | A successful generation request creates one track |
| API Key Many - 1 User | Each API key belongs to a user |
| Admin User 1 - Many Management Actions | Admin can update users and delete tracks |

## 6.5 Domain Model Diagram

[DIAGRAM PLACEHOLDER: Domain Model Diagram showing User, Profile, Track, Audio File, API Key, Generation Request, Prompt, Style Tag, and Admin relationships.]

Suggested diagram content:

```text
User
  |-- has one --> Profile
  |-- owns many --> Track
  |-- owns many --> APIKey

Track
  |-- has one --> AudioFile
  |-- created from --> GenerationRequest
  |-- includes --> Prompt
  |-- includes many --> StyleTag

GenerationRequest
  |-- optimized by --> PromptEngineer
  |-- sent to --> Gradio/MusicGen
  |-- returns --> AudioFile

AdminUser
  |-- manages --> Profile
  |-- deletes --> Track
```

## 6.6 Domain Business Rules

| Rule ID | Business Rule |
|---|---|
| BR-01 | A user must be authenticated before accessing protected pages |
| BR-02 | A user can only view and manage their own tracks |
| BR-03 | Music generation requires at least 10 Gold credits |
| BR-04 | Each generation deducts 10 Gold credits |
| BR-05 | Track records must include a user ID and audio URL when completed |
| BR-06 | API requests must include a valid active API key |
| BR-07 | API keys are stored as hashes, not raw text |
| BR-08 | Deleting a track removes the database record |
| BR-09 | Admin routes can update profile credit/plan for demo management |
| BR-10 | AI generation requires a live Gradio backend URL |

---

# 7. Hypertext / Navigation Model

## 7.1 Navigation Model Overview

The hypertext model describes how users navigate between pages in AuraBeat. The application uses Next.js App Router. Public pages are available without login, while protected pages require an authenticated Supabase session.

## 7.2 Public Routes

| Route | Page | Purpose |
|---|---|---|
| `/` | Home Redirect | Redirects logged-in users to dashboard and guests to login |
| `/login` | Login | Allows existing users to sign in |
| `/register` | Register | Allows new users to create an account |
| `/forgot-password` | Forgot Password | Allows password reset email request |
| `/reset-password` | Reset Password | Allows password reset after email flow |
| `/auth/callback` | Auth Callback | Handles Supabase callback |

## 7.3 Protected Application Routes

| Route | Page | Purpose |
|---|---|---|
| `/dashboard` | Dashboard | Main authenticated landing page |
| `/create` | Create Music | Music generation workflow |
| `/speech` | Create Speech | Text-to-speech workflow |
| `/editor` | Music Editor | Browser-based editing workspace |
| `/library` | Library | Track management and playback |
| `/api-platform` | API Platform | API key management |
| `/profile` | Profile | Profile and account settings |
| `/admin` | Admin Dashboard | Demo platform management |

## 7.4 API Routes

| Route | Method | Purpose |
|---|---|---|
| `/api/generate` | `POST` | Authenticated music generation |
| `/api/keys` | `POST` | Create API key |
| `/api/keys?id=...` | `DELETE` | Deactivate API key |
| `/api/admin/users` | `PATCH` | Update user plan/gold balance |
| `/api/admin/tracks?id=...` | `DELETE` | Delete track as admin |
| `/api/v1/tracks` | `GET` | Public API track list |
| `/api/v1/tracks/[id]` | `GET` | Public API track detail |
| `/api/v1/tracks/[id]` | `DELETE` | Public API track delete |
| `/api/v1/generate` | `POST` | Public API generation |
| `/v1/tracks` | `GET` | Friendly public API proxy route |
| `/v1/tracks/[id]` | `GET`, `DELETE` | Friendly public API proxy route |
| `/v1/generate` | `POST` | Friendly public API proxy route |

## 7.5 Main User Navigation Flow

[DIAGRAM PLACEHOLDER: Hypertext Navigation Model showing public routes, protected routes, sidebar links, and API paths.]

Suggested navigation diagram:

```text
Guest User
  |
  v
/login <----> /register
  |
  v
/dashboard
  |
  |-- /create
  |-- /speech
  |-- /editor
  |-- /library
  |-- /api-platform
  |-- /profile
  |-- /admin

/create --> generated track --> /library --> /editor
/api-platform --> API key --> /v1/tracks and /v1/generate
```

## 7.6 Sidebar Navigation

The authenticated application uses a persistent left sidebar on desktop. The sidebar contains:

- Home.
- Create Music.
- Create Speech.
- Music Editor.
- Library.
- API Platform.
- Profile.
- Admin.

The sidebar also displays the current Gold balance and a "Go Premier" plan card.

## 7.7 Route Protection

Route protection is implemented with Next.js middleware and Supabase session checking. If the user is not authenticated and attempts to access a protected page, the application redirects the user to `/login`.

Public API routes are not protected by browser session middleware; instead, they are protected by API key authentication.

---

# 8. Presentation Model

## 8.1 Presentation Model Overview

The presentation model describes the user interface structure, layout system, components, visual theme, and page-level UI design of AuraBeat.

AuraBeat uses a dark professional music-studio design. The main color palette uses dark navy backgrounds with a purple accent. The interface is built with Tailwind CSS utility classes and reusable React components.

## 8.2 Visual Design System

| Design Element | Implementation |
|---|---|
| Background | Dark navy / black tones such as `#0D0D1A` and `#111128` |
| Accent Color | Purple, mainly `#7C3AED` |
| Text Color | White and muted gray (`#A1A1AA`) |
| Cards | Dark bordered containers |
| Buttons | Purple gradients, dark secondary buttons, icon buttons |
| Icons | Lucide React icons |
| Typography | Inter font and system font fallback |
| Feedback | Toast notifications |
| Scrollbars | Custom dark theme scrollbars |

## 8.3 Layout Templates

### Auth Layout

Used by:

- Login.
- Register.
- Forgot password.
- Reset password.

The auth layout provides a centered form and simplified public interface.

[SCREENSHOT PLACEHOLDER: Login page desktop view.]

[SCREENSHOT PLACEHOLDER: Register page desktop view.]

### App Layout

Used by:

- Dashboard.
- Create Music.
- Library.
- Editor.
- Profile.
- API Platform.
- Admin.
- Speech.

The app layout contains:

- Left sidebar.
- Top bar.
- Main content area.
- Persistent bottom audio player.
- Toast notification viewport.

[SCREENSHOT PLACEHOLDER: Main application layout showing sidebar, top bar, content area, and audio player.]

## 8.4 Page Presentation Models

### Dashboard Presentation

The dashboard presents:

- Welcome message.
- User display name.
- Track count.
- Gold balance.
- Plan badge.
- Recent tracks.
- Create New Track call-to-action.

[SCREENSHOT PLACEHOLDER: Dashboard desktop view.]

### Create Music Presentation

The Create Music page contains:

- Easy/Custom mode toggle.
- Lyrics and vocals section.
- Instrumental toggle.
- Prompt and genre selector.
- Advanced parameters.
- Reference audio and melody upload.
- Generate button.
- Generated result panel.

[SCREENSHOT PLACEHOLDER: Create Music desktop view with prompt and style options.]

[SCREENSHOT PLACEHOLDER: Create Music advanced parameters and upload section.]

### Library Presentation

The Library page contains:

- Search bar.
- Filter menu.
- Sort menu.
- Grid/list toggle.
- Track cards or table rows.
- Playback and delete actions.
- Batch selection controls.

[SCREENSHOT PLACEHOLDER: Library grid view desktop screenshot.]

[SCREENSHOT PLACEHOLDER: Library list view desktop screenshot.]

### Editor Presentation

The Editor page contains:

- Track selector.
- Load in Editor button.
- Editing toolbar.
- Tempo slider.
- Key shift slider.
- Selection controls.
- Waveform/stem visualization.
- Playback transport.

[SCREENSHOT PLACEHOLDER: Music Editor desktop screenshot.]

### Profile Presentation

The Profile page contains:

- Profile information.
- Email display.
- Display name editing.
- Gold balance.
- Plan details.
- Sign-out action.

[SCREENSHOT PLACEHOLDER: Profile page desktop screenshot.]

### API Platform Presentation

The API Platform page contains:

- API key statistics.
- API key table.
- Create key modal.
- Quick-start API examples.
- Endpoint reference.

[SCREENSHOT PLACEHOLDER: API Platform desktop screenshot.]

### Admin Presentation

The Admin page contains:

- Total users.
- Total tracks.
- Gold distributed.
- Active API keys.
- System health cards.
- User management table.
- Track management table.

[SCREENSHOT PLACEHOLDER: Admin dashboard desktop screenshot.]

## 8.5 Presentation Model Diagram

[DIAGRAM PLACEHOLDER: Presentation Model showing Auth Shell, App Layout, Sidebar, Top Bar, Content Pages, Audio Player, Toast Viewport, and shared UI components.]

Suggested structure:

```text
AppLayout
  |-- Sidebar
  |-- TopBar
  |-- MainContent
  |     |-- Dashboard
  |     |-- CreateMusic
  |     |-- Library
  |     |-- Editor
  |     |-- Profile
  |     |-- APIPlatform
  |     |-- Admin
  |-- AudioPlayer
  |-- ToastViewport

AuthShell
  |-- Login
  |-- Register
  |-- ForgotPassword
  |-- ResetPassword
```

---

# 9. Application Architecture

## 9.1 Selected Architecture

AuraBeat uses a **full-stack modular monolithic architecture with service integrations**.

This means the main application is kept in one Next.js project, but responsibilities are separated into clear modules:

- UI pages and components.
- Server-side route handlers.
- Authentication helpers.
- Supabase client/server utilities.
- AI prompt engineering.
- Storage and download helpers.
- Zustand stores.
- Selenium tests.

The architecture is monolithic at deployment level but modular at code level. This is appropriate for an academic MVP because it reduces infrastructure complexity while still demonstrating professional web application design.

## 9.2 Why This Architecture Was Selected

This architecture was selected for the following reasons:

1. **Fast development:** Next.js allows frontend and backend code in the same project.
2. **Academic suitability:** The architecture is easy to explain, test, and present.
3. **Full-stack features:** Authentication, APIs, UI, server rendering, and middleware are supported.
4. **Reduced deployment complexity:** The app can be deployed as a single Vercel project.
5. **Modular code organization:** Even though it is one project, it is divided into pages, components, libraries, and tests.
6. **AI integration support:** API routes can connect to external AI services such as Gradio/MusicGen.
7. **Scalability path:** If needed later, AI backend, storage cleanup, and admin services can be separated.

## 9.3 Architecture Layers

| Layer | Responsibility | Files / Modules |
|---|---|---|
| Presentation Layer | UI pages and reusable components | `src/app`, `src/components` |
| State Layer | Audio player and toast state | `src/lib/store` |
| Application Layer | Page logic and route handlers | `src/app/api`, `src/app/v1` |
| Authentication Layer | Supabase auth and middleware | `src/middleware.ts`, `src/lib/supabase` |
| Data Layer | Supabase database and storage | Supabase PostgreSQL and Storage |
| AI Integration Layer | Prompt engineering and Gradio calls | `src/lib/ai`, `/api/generate`, `/v1/generate` |
| Testing Layer | Selenium browser automation | `tests/selenium` |

## 9.4 Architecture Diagram

[DIAGRAM PLACEHOLDER: Application Architecture Diagram showing Browser, Next.js App, Supabase Auth, Supabase Database, Supabase Storage, Gradio/MusicGen AI Server, and Selenium Test Runner.]

Suggested architecture diagram:

```text
Browser / User Interface
        |
        v
Next.js 14 Application
        |
        |-- React Client Components
        |-- Server Components
        |-- Middleware
        |-- API Route Handlers
        |
        +--> Supabase Auth
        +--> Supabase PostgreSQL
        +--> Supabase Storage
        |
        +--> Prompt Engineer
                |
                v
          Gradio / MusicGen AI Server
                |
                v
          Generated Audio File
                |
                v
          Supabase Storage + Track Row

Selenium Test Runner
        |
        v
Automated Chrome Browser
        |
        v
AuraBeat UI and API endpoints
```

## 9.5 Data Flow for Music Generation

1. User opens `/create`.
2. User enters prompt, selects style, and optionally uploads reference audio.
3. Browser sends request to `/api/generate`.
4. API route validates prompt, style, user, and credit balance.
5. Prompt engineering layer improves the prompt.
6. Next.js sends request to Gradio/MusicGen backend.
7. AI backend returns generated audio.
8. Audio is uploaded to Supabase Storage.
9. Track metadata is inserted into Supabase PostgreSQL.
10. Gold credits are deducted.
11. UI receives new track and loads it in the audio player.

## 9.6 Data Flow for Public API

1. User creates an API key in `/api-platform`.
2. Raw API key is shown once to the user.
3. SHA-256 key hash is stored in `api_keys`.
4. Developer sends request to `/v1/tracks` or `/v1/generate`.
5. API key helper hashes the incoming key and checks it in database.
6. If active, endpoint returns data belonging to that key's owner.
7. `last_used_at` is updated.

---

# 10. Framework Selection and Justification

## 10.1 Main Framework

The selected framework is:

**Next.js 14 with React 18 and the App Router.**

## 10.2 Framework Explanation According to Project

AuraBeat requires both frontend and backend behavior:

- Pages for users.
- Protected routes.
- API endpoints.
- File upload.
- Database access.
- AI backend integration.
- Server-side rendering for authenticated pages.
- Client-side interactivity for audio player and editor.

Next.js supports all these requirements in one framework. The App Router also makes it easy to organize pages and route handlers using the file system.

## 10.3 Framework and Library Justification Table

| Technology | Why It Was Selected |
|---|---|
| Next.js 14 | Full-stack framework, routing, API routes, server components, middleware |
| React 18 | Component-based interactive UI |
| TypeScript | Type safety and better code maintainability |
| Tailwind CSS | Fast responsive styling with utility classes |
| Supabase Auth | Ready-made authentication and session management |
| Supabase PostgreSQL | Persistent relational database |
| Supabase Storage | Audio file storage |
| Zustand | Lightweight state management for audio player and toast notifications |
| Lucide React | Consistent icon system |
| Motion | UI animations and transitions |
| Gradio / MusicGen | AI music generation backend |
| Selenium WebDriver | Browser automation for testing |
| ChromeDriver | Selenium driver for Chrome |

## 10.4 Alternative Architectures Considered

| Alternative | Reason Not Selected |
|---|---|
| Separate React frontend and Express backend | More deployment complexity for academic MVP |
| Microservices architecture | Too large for project scope and deadline |
| Django or Laravel monolith | Less suitable for React-heavy audio UI in this project |
| Firebase-only backend | Supabase PostgreSQL better matched relational data and SQL policies |
| Manual browser testing only | Assignment requires Selenium and automated testing is more reliable |

## 10.5 Final Architecture Decision

The final decision is to use Next.js as the full-stack framework with Supabase as the backend platform. This provides the best balance of:

- Development speed.
- Maintainability.
- Presentation clarity.
- Testing capability.
- Cloud deployment readiness.
- AI integration flexibility.

---

# 11. Responsive Design

## 11.1 Responsive Design Requirement

Assignment 4 requires screenshots that show the responsiveness of the application. The final Word document should include desktop, tablet, and mobile screenshots for relevant pages.

This Markdown includes placeholders for screenshots. Screenshots will be inserted manually after the report is converted to Word.

## 11.2 Responsive Design Approach

AuraBeat uses Tailwind CSS responsive utility classes such as:

- `grid-cols-1`
- `md:grid-cols-2`
- `lg:grid-cols-3`
- `xl:grid-cols-5`
- `hidden md:flex`
- `overflow-y-auto`
- `max-w-*`
- `flex`
- `min-w-0`
- `shrink-0`

The application is desktop-first because it is a music studio interface, but many pages use responsive grids and flexible containers to support smaller screens.

## 11.3 Responsive Layout Behavior

| Component / Page | Desktop Behavior | Tablet / Mobile Behavior | Status |
|---|---|---|---|
| Auth Pages | Centered auth form | Form remains centered and narrow | Implemented |
| Sidebar | Visible fixed-width sidebar | Hidden below `md` breakpoint | Implemented |
| Top Bar | Full search and avatar row | Compresses with available width | Implemented |
| Dashboard | Wide summary layout | Content stacks due flexible layout | Implemented |
| Create Music | Two-pane creation/results interface | Needs further mobile polish due complex panels | Partial |
| Library | Responsive grid and list view | Grid columns reduce on smaller screens | Implemented |
| Editor | Full editing workspace | Desktop-first due waveform controls | Partial |
| Profile | Card-based layout | Stacks on smaller widths | Implemented |
| API Platform | Cards and tables | Tables scroll horizontally when required | Implemented |
| Admin | Responsive stats grid | Cards stack on smaller screens | Implemented |
| Audio Player | Full bottom player | Needs mobile simplification for very small screens | Partial |

## 11.4 Responsive Screenshots to Add

The following screenshot placeholders should be retained in the Word document.

### Login Page Responsiveness

[SCREENSHOT PLACEHOLDER: Login page desktop view - 1440px width.]

[SCREENSHOT PLACEHOLDER: Login page tablet view - approximately 768px width.]

[SCREENSHOT PLACEHOLDER: Login page mobile view - approximately 390px width.]

### Dashboard Responsiveness

[SCREENSHOT PLACEHOLDER: Dashboard desktop view - sidebar visible.]

[SCREENSHOT PLACEHOLDER: Dashboard tablet view - content adapted.]

[SCREENSHOT PLACEHOLDER: Dashboard mobile view - sidebar hidden or layout stacked.]

### Create Music Responsiveness

[SCREENSHOT PLACEHOLDER: Create Music desktop view showing main form and result panel.]

[SCREENSHOT PLACEHOLDER: Create Music tablet/mobile view showing stacked form layout.]

### Library Responsiveness

[SCREENSHOT PLACEHOLDER: Library desktop grid view.]

[SCREENSHOT PLACEHOLDER: Library tablet view with fewer grid columns.]

[SCREENSHOT PLACEHOLDER: Library mobile view showing stacked/scrollable content.]

### Editor Responsiveness

[SCREENSHOT PLACEHOLDER: Editor desktop view showing waveform and toolbar.]

[SCREENSHOT PLACEHOLDER: Editor tablet/mobile view showing horizontal overflow or stacked controls.]

### API Platform Responsiveness

[SCREENSHOT PLACEHOLDER: API Platform desktop view.]

[SCREENSHOT PLACEHOLDER: API Platform mobile/tablet view with responsive cards and table scrolling.]

## 11.5 Current Responsive Design Limitations

The main limitation is that the music editor and persistent audio player are naturally complex desktop-style interfaces. They are usable for larger screens but require additional polish for very small mobile screens. This is acceptable for the current MVP because the primary project use case is a desktop AI music studio. However, mobile improvements are planned before final presentation.

---

# 12. Testing

## 12.1 Testing Overview

AuraBeat includes both manual testing and automated Selenium testing. The main automated test is focused on CRUD and user flow validation.

The Selenium test file is:

```text
tests/selenium/aurabeatCrud.spec.js
```

The test script is defined in `package.json`:

```json
{
  "test:selenium": "node tests/selenium/aurabeatCrud.spec.js"
}
```

## 12.2 Testing Tools

| Tool | Purpose |
|---|---|
| Selenium WebDriver | Automates browser interactions |
| ChromeDriver | Allows Selenium to control Chrome |
| Node.js | Executes test script |
| Next.js Build | Checks production build validity |
| ESLint | Checks code quality |
| Supabase REST API | Supports authenticated fixture creation |

## 12.3 Automated Selenium Flow

The Selenium test performs the following flow:

1. Resolves the local base URL.
2. Generates a temporary silent `.wav` file.
3. Opens Chrome in headless mode.
4. Registers a test user.
5. Extracts Supabase session from browser cookies.
6. Updates test user's profile credits.
7. Creates a track fixture.
8. Opens Create Music page.
9. Uploads reference audio.
10. Opens Library page.
11. Switches to list view.
12. Finds the created track.
13. Starts playback.
14. Opens Editor page.
15. Verifies editor controls.
16. Creates an API key.
17. Calls `/v1/tracks`.
18. Calls `/v1/tracks/[id]`.
19. Optionally calls `/v1/generate`.
20. Deletes the track.
21. Confirms the deleted track returns `404`.
22. Cleans up test data.

## 12.4 Commands Used for Verification

```bash
node --check tests/selenium/aurabeatCrud.spec.js
npm run lint
npm run build
npm run dev -- -p 3001
SELENIUM_BASE_URL=http://127.0.0.1:3001 npm run test:selenium
```

## 12.5 Test Execution Status

| Check | Status |
|---|---|
| JavaScript syntax check | Passed |
| ESLint check | Passed |
| Next.js build | Passed |
| Selenium CRUD test | Passed |

## 12.6 Selenium Test Output Summary

```text
Running Selenium CRUD flow against http://127.0.0.1:3001
Registering a test user
Updating test profile credits
Creating a track fixture through Supabase REST
Uploading reference audio through the create page
Reading the track in the library and starting playback
Confirming editor controls render
Creating an API key
Verifying /v1/tracks list and detail
Skipping /v1/generate. Set SELENIUM_RUN_GENERATE=1 to include the live AI backend.
Deleting the track through /v1/tracks/:id
Selenium CRUD flow completed successfully
```

---

# 13. Test Cases

## 13.1 Functional Test Cases

| Test Case ID | Feature | Test Description | Expected Result | Status |
|---|---|---|---|---|
| TC-F-01 | Registration | Register a new user with valid details | User account is created and redirected to dashboard | Passed |
| TC-F-02 | Login | Login with valid email and password | User reaches dashboard | Passed |
| TC-F-03 | Route Protection | Open protected route without login | User is redirected to login | Passed |
| TC-F-04 | Dashboard | Open dashboard after login | Profile summary and recent tracks appear | Passed |
| TC-F-05 | Create Music | Enter prompt, select style, submit generation | Track generation request is processed | Implemented; depends on live AI backend |
| TC-F-06 | Reference Upload | Upload `.wav` file in advanced create mode | Upload completes and UI shows Ready | Passed |
| TC-F-07 | Library Read | Open Library and find created track | Track appears in library | Passed |
| TC-F-08 | Playback | Click Play on track | Audio player shows Now playing | Passed |
| TC-F-09 | Editor | Open Editor page | Tempo and editor controls render | Passed |
| TC-F-10 | Profile | Open Profile page | Profile data displays correctly | Passed manually |
| TC-F-11 | API Key | Create API key | Raw key is returned once | Passed |
| TC-F-12 | Public Track API | Call `/v1/tracks` with API key | Track list returned | Passed |
| TC-F-13 | Track Detail API | Call `/v1/tracks/[id]` | Correct track returned | Passed |
| TC-F-14 | Delete Track API | Delete track using API key | Delete succeeds and future read returns 404 | Passed |
| TC-F-15 | Admin Dashboard | Open Admin page | Stats and management tables render | Passed manually |

## 13.2 CRUD Test Cases

| CRUD Operation | Resource | Test Method | Expected Result | Status |
|---|---|---|---|---|
| Create | User | Selenium registration form | User created | Passed |
| Create | Track | Authenticated Supabase REST fixture and generation flow | Track row created | Passed |
| Create | API Key | Authenticated `/api/keys` call | API key returned | Passed |
| Read | Track | Library UI and `/v1/tracks` | Track visible | Passed |
| Read | Track Detail | `/v1/tracks/[id]` | Track detail returned | Passed |
| Update | Profile | `/api/admin/users` | Credits and plan updated | Passed |
| Update | Track | Planned `PATCH /v1/tracks/[id]` or save status update | Track metadata updated | Planned |
| Delete | Track | `/v1/tracks/[id]` DELETE | Track deleted | Passed |

## 13.3 Responsive Design Test Cases

| Test Case ID | Page | Viewport | Expected Result | Status |
|---|---|---|---|---|
| TC-R-01 | Login | Mobile | Form remains centered and usable | Passed manually |
| TC-R-02 | Register | Mobile | Form fields remain readable | Passed manually |
| TC-R-03 | Dashboard | Desktop | Sidebar, topbar, content, player visible | Passed |
| TC-R-04 | Dashboard | Tablet | Content adapts without major overlap | Passed manually |
| TC-R-05 | Library | Desktop | Grid/list views work correctly | Passed |
| TC-R-06 | Library | Tablet | Grid reduces columns | Passed manually |
| TC-R-07 | API Platform | Tablet | Cards stack and table scrolls | Passed manually |
| TC-R-08 | Create Music | Mobile | Layout needs final polish | Partial |
| TC-R-09 | Editor | Mobile | Editor remains desktop-first | Partial |
| TC-R-10 | Audio Player | Mobile | Needs simplified mobile layout | Partial |

## 13.4 Usability Test Cases

| Test Case ID | Scenario | Expected Result | Status |
|---|---|---|---|
| TC-U-01 | User understands registration form | Labels and validation are clear | Passed |
| TC-U-02 | User can identify Create Music action | Sidebar and dashboard CTA are visible | Passed |
| TC-U-03 | User can upload audio | Advanced Parameters section exposes upload | Passed |
| TC-U-04 | User can find generated tracks | Library search/list/grid available | Passed |
| TC-U-05 | User receives feedback | Toasts show success/error/info states | Passed |
| TC-U-06 | Developer can create API key | API Platform provides create key flow | Passed |
| TC-U-07 | User can navigate between major pages | Sidebar supports all major modules | Passed |

---

# 14. Incomplete Items and Completion Plan Before Viva

The project report is being submitted before midnight on 17 May 2026. The team has additional time before the viva on 18 May 2026 to polish incomplete or partially implemented areas.

## 14.1 Completion Plan

| Priority | Task | Reason | Planned Completion |
|---|---|---|---|
| High | Capture and insert screenshots | Required by Assignment 4 responsive design section | Before Word submission finalization / hard copy |
| High | Verify live Gradio URL | Needed for AI generation demo | Before presentation |
| High | Polish mobile Create page | Responsive design demonstration | Before presentation |
| Medium | Polish mobile Editor layout | Better presentation quality | Before presentation if time allows |
| Medium | Add track update endpoint | Complete CRUD coverage | Before presentation if time allows |
| Medium | Re-enable strict admin authorization | Security improvement | Before presentation if required |
| Low | Add storage cleanup on delete | Production quality improvement | After viva if not required |

## 14.2 Current Risk Management

| Risk | Impact | Mitigation |
|---|---|---|
| Gradio URL expires | Generation demo may fail | Start new Colab/Gradio session before viva |
| Mobile editor is complex | Responsive screenshots may show overflow | Use desktop/tablet screenshots and note editor is desktop-first |
| Track update endpoint missing | CRUD update for track is partial | Demonstrate profile update and plan track PATCH endpoint |
| Supabase email confirmation | Selenium registration may require confirmation | Keep email confirmation disabled for local test/demo |
| Storage cleanup incomplete | Deleted DB rows may leave files | Mention as known limitation and future improvement |

---

# 15. Conclusion

AuraBeat is a modern full-stack AI music generation web application built with Next.js 14, React, TypeScript, Tailwind CSS, Supabase, Zustand, Selenium, and Gradio/MusicGen. The selected architecture is a modular full-stack monolith with external service integrations. This architecture is appropriate because it keeps the project manageable while supporting authentication, database access, file storage, AI integration, route protection, API endpoints, and automated testing.

The project models document the domain entities, navigation structure, and presentation design of the application. The architecture section explains why Next.js and Supabase were selected and how the system is divided into presentation, application, data, AI, and testing layers. The responsive design section documents the current responsive behavior and includes placeholders for screenshots that will be inserted manually in the final Word document.

Testing was performed using Selenium WebDriver and ChromeDriver. The automated test validates registration, profile update, track creation setup, reference audio upload, library reading, playback, editor rendering, API key creation, public API reading, and track deletion. The test passed successfully.

Some features are still being polished before the final viva, especially mobile layout refinement, screenshot collection, live Gradio verification, and optional full track update support. However, the current project is functional as an academic MVP and satisfies the core requirements of Assignment 4: project models, architecture/framework explanation, responsive design documentation, and test cases.

---

# 16. Appendix A: File and Route References

## 16.1 Important Source Files

| File | Purpose |
|---|---|
| `src/app/page.tsx` | Redirects users to login or dashboard |
| `src/app/(auth)/login/page.tsx` | Login page |
| `src/app/(auth)/register/page.tsx` | Registration page |
| `src/app/(auth)/forgot-password/page.tsx` | Forgot password page |
| `src/app/(auth)/reset-password/page.tsx` | Reset password page |
| `src/app/dashboard/page.tsx` | Dashboard page |
| `src/app/create/page.tsx` | Create Music page |
| `src/app/speech/page.tsx` | Create Speech page |
| `src/app/library/page.tsx` | Library server page |
| `src/app/library/LibraryClient.tsx` | Library UI and client actions |
| `src/app/editor/page.tsx` | Editor server page |
| `src/app/editor/EditorClient.tsx` | Editor UI and audio interactions |
| `src/app/profile/page.tsx` | Profile server page |
| `src/app/profile/ProfileClient.tsx` | Profile UI |
| `src/app/api-platform/page.tsx` | API Platform server page |
| `src/app/api-platform/ApiPlatformClient.tsx` | API key management UI |
| `src/app/admin/page.tsx` | Admin server page |
| `src/app/admin/AdminClient.tsx` | Admin dashboard UI |
| `src/components/layout/AppLayout.tsx` | Main application shell |
| `src/components/layout/Sidebar.tsx` | Sidebar navigation |
| `src/components/layout/TopBar.tsx` | Top navigation bar |
| `src/components/layout/AudioPlayer.tsx` | Persistent audio player |
| `src/lib/store/audioStore.ts` | Zustand audio state |
| `src/lib/store/toastStore.ts` | Zustand toast state |
| `src/lib/ai/prompt-engineer.ts` | Prompt optimization layer |
| `src/lib/supabase/client.ts` | Browser Supabase client |
| `src/lib/supabase/server.ts` | Server Supabase client |
| `src/lib/supabase/admin.ts` | Admin/service Supabase client |
| `src/lib/auth/apiKey.ts` | API key authentication helper |
| `tests/selenium/aurabeatCrud.spec.js` | Selenium CRUD test |

## 16.2 Important API Files

| File | Purpose |
|---|---|
| `src/app/api/generate/route.ts` | Authenticated generation endpoint |
| `src/app/api/keys/route.ts` | API key create/deactivate endpoint |
| `src/app/api/admin/users/route.ts` | Admin user update endpoint |
| `src/app/api/admin/tracks/route.ts` | Admin track delete endpoint |
| `src/app/api/v1/tracks/route.ts` | Public track list endpoint |
| `src/app/api/v1/tracks/[id]/route.ts` | Public track detail/delete endpoint |
| `src/app/api/v1/generate/route.ts` | Public API generation endpoint |
| `src/app/v1/tracks/route.ts` | Friendly route re-export |
| `src/app/v1/tracks/[id]/route.ts` | Friendly route re-export |
| `src/app/v1/generate/route.ts` | Friendly route re-export |

---

# 17. Appendix B: Commands Used

## 17.1 Development Server

```bash
npm run dev
```

or on a specific port:

```bash
npm run dev -- -p 3001
```

## 17.2 Production Build

```bash
npm run build
```

## 17.3 Lint Check

```bash
npm run lint
```

## 17.4 Selenium Test

```bash
SELENIUM_BASE_URL=http://127.0.0.1:3001 npm run test:selenium
```

## 17.5 Optional Live AI Generation Test

```bash
SELENIUM_RUN_GENERATE=1 SELENIUM_BASE_URL=http://127.0.0.1:3001 npm run test:selenium
```

---

# 18. Appendix C: Screenshot Checklist

The following screenshots should be added manually to the Word document after Claude generates it:

| Screenshot No. | Screenshot Description | Required For |
|---|---|---|
| SS-01 | Login page desktop | Presentation / Responsive Design |
| SS-02 | Login page mobile | Responsive Design |
| SS-03 | Register page desktop | Presentation Model |
| SS-04 | Dashboard desktop with sidebar | Presentation / Responsive Design |
| SS-05 | Dashboard tablet or mobile | Responsive Design |
| SS-06 | Create Music desktop | Presentation Model |
| SS-07 | Create Music advanced upload section | Testing / Presentation |
| SS-08 | Create Music mobile/tablet | Responsive Design |
| SS-09 | Library grid view desktop | Presentation Model |
| SS-10 | Library list view with test track | Testing |
| SS-11 | Library mobile/tablet | Responsive Design |
| SS-12 | Audio player active / Now playing | Testing |
| SS-13 | Music Editor desktop | Presentation Model |
| SS-14 | Music Editor smaller viewport | Responsive Design |
| SS-15 | Profile page | Presentation Model |
| SS-16 | API Platform page | API / Presentation |
| SS-17 | API key creation modal | Testing |
| SS-18 | Admin dashboard | Admin / Presentation |
| SS-19 | Selenium terminal output | Testing evidence |
| SS-20 | Next.js build/lint output | Testing evidence |

---

# 19. Appendix D: Assignment Requirement Mapping

| Assignment Requirement | Report Section |
|---|---|
| Prepare project design report | Entire document |
| Domain Model | Section 6 |
| Hypertext / Navigation Model | Section 7 |
| Presentation Model | Section 8 |
| Application Architecture selected and explained | Section 9 |
| Framework selected and explained | Section 10 |
| Responsive Design screenshots | Section 11 and Appendix C |
| Testing and test cases | Sections 12 and 13 |
| Names and enrollment numbers | Title page |
