# AuraBeat

**AI-Powered Music Generation Platform — Academic MVP**

---

## Overview

AuraBeat is a full-stack web application that allows users to generate original music tracks using artificial intelligence. Users describe what they want to hear in natural language, select a musical style, and the system produces a complete audio track — all within a browser.

This project was built as an academic capstone to demonstrate end-to-end AI application development: from user authentication and prompt engineering through cloud GPU inference to audio storage and persistent playback.

---

## Live Demo

> **Deployed on Vercel**
>
> The live URL is provided separately. The AI generation feature requires an active Google Colab GPU runtime with the Gradio server running.

---

## Key Features

- **AI Music Generation** — Describe a track in plain English; receive a generated MP3
- **Prompt Engineering Layer** — Raw user input is automatically transformed into structured, model-optimized prompts
- **Cloud GPU Inference** — Meta MusicGen-small runs on a Google Colab T4 GPU, exposed via Gradio public URL
- **Persistent Audio Player** — Global bottom player (Zustand-powered) persists across all pages
- **Track Library** — Browse, search, play, and delete saved tracks with grid/list views
- **Gold Credit System** — Each generation costs 10 Gold; balance tracked per user
- **User Authentication** — Full auth flow: login, register, forgot password, reset password
- **Profile Management** — Editable display name, plan display, gold balance, sign-out
- **Toast Notifications** — Non-blocking feedback for all user actions
- **Dark Professional UI** — Consistent design system with purple accent throughout

---

## Tech Stack

| Layer            | Technology                                           |
| ---------------- | ---------------------------------------------------- |
| Framework        | Next.js 14 (App Router)                              |
| Language         | TypeScript                                           |
| Styling          | Tailwind CSS 3.4                                     |
| Authentication   | Supabase Auth (`@supabase/ssr`, cookie-based)        |
| Database         | Supabase PostgreSQL                                  |
| File Storage     | Supabase Storage (tracks bucket)                     |
| State Management | Zustand (audio player, toast notifications)          |
| AI Model         | Meta MusicGen-small (pre-trained, no fine-tuning)    |
| GPU Runtime      | Google Colab (T4 GPU, free tier)                     |
| Model Serving    | Gradio 5.x (public URL tunnel from Colab)            |
| Deployment       | Vercel                                               |
| Icons            | Lucide React                                         |

---

## Architecture

```
┌──────────────┐     ┌──────────────────┐     ┌─────────────────────┐
│   Browser    │────▶│  Next.js 14 App  │────▶│  Supabase Backend   │
│   (Client)   │◀────│  (Vercel Edge)   │◀────│  Auth / DB / Storage│
└──────────────┘     └────────┬─────────┘     └─────────────────────┘
                              │
                    POST /api/generate
                              │
                     ┌────────▼─────────┐
                     │  Prompt Engineer  │
                     │  (server-side)    │
                     └────────┬─────────┘
                              │ optimized prompt
                     ┌────────▼─────────┐
                     │  Google Colab    │
                     │  Gradio Server   │
                     │  (MusicGen T4)   │
                     └──────────────────┘
```

**Request Flow:**

1. User submits a prompt + style tag on `/create`
2. Server validates credits via Supabase
3. Prompt engineering layer transforms raw input into a structured MusicGen prompt
4. Optimized prompt is sent to the Gradio server (Colab T4 GPU) via two-step SSE API
5. Generated audio is downloaded, uploaded to Supabase Storage as MP3
6. Gold balance is deducted, track metadata is inserted into the database
7. Track is loaded into the global audio player automatically

---

## AI Contribution

> **Academic Honesty Disclosure**

This project uses **Meta's MusicGen-small** as the pre-trained base model. The model was **not trained from scratch** and **no custom fine-tuning was performed** due to GPU and time constraints.

**The original AI contributions in this project are:**

1. **Prompt Engineering Layer** (`src/lib/ai/prompt-engineer.ts`) — A custom transformation system that converts raw user descriptions into structured, model-optimized prompts. This includes style mapping, instrumentation descriptors, tempo inference, and texture enrichment to significantly improve generation quality.

2. **Cloud Inference Integration** — A complete pipeline connecting a Next.js API route to a self-hosted Gradio server running on Google Colab with T4 GPU. This includes the two-step SSE communication pattern required by Gradio 5.x.

3. **Full Application Workflow** — The end-to-end flow from natural language prompt → prompt optimization → GPU inference → audio download → cloud storage upload → credit deduction → database insertion → persistent playback. This represents the software engineering contribution of making AI accessible through a production web application.

---

## MVP Scope Reduction

The original Software Requirements Specification (SRS) included features that were descoped for the MVP due to budget, time, and infrastructure constraints:

| Original SRS Feature       | MVP Status     | Reason                                       |
| -------------------------- | -------------- | -------------------------------------------- |
| Kafka event streaming      | Not implemented | Zero-budget constraint; unnecessary for MVP  |
| Microservices architecture | Not implemented | Monolithic Next.js is sufficient at MVP scale |
| Stripe payments            | Display-only   | No revenue model needed for academic demo    |
| Model fine-tuning          | Not implemented | Insufficient GPU hours on free Colab tier    |
| OAuth social login         | Not implemented | Supabase email auth is sufficient for MVP    |
| Mobile responsive layout   | Partial        | Desktop-first; basic mobile support          |

All descoping decisions were made deliberately to ship a working, demonstrable product within the academic deadline.

---

## Features Implemented

### Authentication
- [x] Email/password registration with display name
- [x] Login with remember-me (localStorage)
- [x] Forgot password (Supabase reset email)
- [x] Reset password with strength checklist
- [x] Password visibility toggle
- [x] Middleware route protection
- [x] Sign out

### Music Generation
- [x] Natural language prompt input (500 char limit)
- [x] Style tag selection (9 genres)
- [x] Instrumental/vocal toggle
- [x] Prompt engineering optimization
- [x] Gradio 5.x SSE integration
- [x] Audio upload to Supabase Storage
- [x] Gold credit deduction (10 per track)
- [x] Track metadata insertion

### Library
- [x] Server-rendered track list
- [x] Client-side search (title, prompt, tags)
- [x] Grid/list view toggle
- [x] Play via global audio player
- [x] Delete with confirmation

### Profile
- [x] Editable display name
- [x] Gold balance display
- [x] Current plan display
- [x] Display-only plan comparison cards
- [x] Sign out

### UI/UX
- [x] Global persistent audio player (Zustand)
- [x] Toast notification system (Zustand)
- [x] Reusable Spinner component
- [x] Dark theme design system
- [x] Fixed sidebar navigation

---

## Environment Variables

Create a `.env.local` file in the project root with:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# AI Backend (Gradio server from Google Colab)
GRADIO_SERVER_URL=your_gradio_public_url
```

> **Note:** `GRADIO_SERVER_URL` changes each time the Colab notebook is restarted. Update this value accordingly.

> **Warning:** Never commit `.env.local` to version control. It is already included in `.gitignore`.

---

## Local Setup

```bash
# 1. Clone the repository
git clone https://github.com/TALHA-089/AuraBeat.git
cd AuraBeat

# 2. Install dependencies
npm install

# 3. Create environment file
cp .env.local.example .env.local
# Edit .env.local with your Supabase and Gradio values

# 4. Run development server
npm run dev

# 5. Open in browser
# http://localhost:3000
```

### Prerequisites
- Node.js 18+
- npm 9+
- Supabase project with Auth, PostgreSQL, and Storage configured
- Google Colab notebook running MusicGen-small with Gradio (for AI generation)

### Supabase Setup
- **Tables:** `profiles` (id, display_name, gold_balance, plan, created_at, is_admin), `tracks` (id, user_id, title, prompt, style_tags, audio_url, duration_seconds, status, created_at), `api_keys` (id, user_id, name, key_hash, prefix, is_active)
- **Storage bucket:** `tracks` (public access)
- **Auth:** Email provider enabled; add `http://localhost:3000` to allowed redirect URLs

### Security & Storage (Cloud Standards)
- **Row Level Security (RLS):** All tables must have RLS enabled to prevent cross-account data leakage. Example policy for `api_keys`: `CREATE POLICY "Users can manage own keys" ON api_keys FOR ALL USING (auth.uid() = user_id);`
- **Admin Access:** The Admin Dashboard requires an `is_admin` boolean flag on the `profiles` table. Admins can bypass standard RLS via specific `FOR UPDATE` and `FOR DELETE` policies.
- **Storage Cleanup:** Currently, deleting a track removes the DB row but leaves the MP3 in Supabase Storage. A production implementation should use a Supabase Edge Function triggered by a `DELETE` webhook to perform a `storage.remove()` operation for orphaned audio files.

---

## Deployment Notes

### Vercel
- Connect the GitHub repository to Vercel
- Add all environment variables in Vercel project settings
- The app deploys automatically on push to `main`

### Google Colab (AI Backend)
- Open the MusicGen Colab notebook
- Run all cells to start the Gradio server
- Copy the public Gradio URL (e.g., `https://xxxx.gradio.live`)
- Update `GRADIO_SERVER_URL` in Vercel environment variables
- The Gradio URL **expires when the Colab session ends** and must be refreshed

---

## Known Limitations

1. **Gradio URL is ephemeral** — The public URL changes every time the Colab notebook restarts. This requires manual environment variable updates.

2. **Colab free tier disconnects** — Google Colab free tier sessions can disconnect after inactivity or GPU time limits, interrupting the AI backend.

3. **No model fine-tuning** — MusicGen-small is used as-is. Fine-tuning was not feasible within the free Colab GPU quota and project timeline.

4. **No real payments** — Plan cards (Free, Basic, Pro, Premier) are display-only. No Stripe integration was implemented as this is an academic MVP.

5. **No microservices** — The original SRS proposed Kafka and microservices, but the MVP uses a monolithic Next.js architecture, which is appropriate for this scale.

6. **userId from client body** — The `/api/generate` route currently trusts the `userId` passed from the client. A production system should verify identity from the server-side Supabase session.

7. **No storage cleanup on delete** — Deleting a track removes the database row but does not delete the audio file from Supabase Storage, because the DB stores only the public URL, not the storage object path.

8. **Desktop-first design** — The sidebar and layout are optimized for desktop. Mobile responsiveness is partial.

---

## Future Work

- [ ] Persistent Gradio server (dedicated GPU or Hugging Face Inference Endpoint)
- [ ] Server-side user verification in `/api/generate`
- [ ] Storage cleanup on track deletion
- [ ] Model fine-tuning on curated music datasets
- [ ] Real payment integration (Stripe)
- [ ] Mobile-responsive layout with collapsible sidebar
- [ ] Track sharing and public profiles
- [ ] Waveform visualization in the audio player
- [ ] Batch generation and queue system
- [ ] Usage analytics dashboard

---

## Viva Explanation

This section provides concise answers for common viva defense questions.

**Q: Did you train the AI model yourself?**
No. AuraBeat uses Meta's MusicGen-small, a pre-trained text-to-music model. The original contribution is the prompt engineering layer, the cloud inference pipeline, and the full-stack application that makes AI music generation accessible through a web interface.

**Q: What is the prompt engineering layer?**
It is a custom function (`buildMusicGenPrompt`) that transforms a user's natural language description into a structured prompt optimized for MusicGen. It maps style tags to musical descriptors, adds instrumentation details, tempo hints, and texture attributes to improve output quality.

**Q: Why didn't you fine-tune the model?**
Fine-tuning MusicGen requires significant GPU compute hours and curated training data. The free Google Colab T4 tier does not provide sufficient resources for this. The prompt engineering approach was chosen as a practical alternative that still demonstrably improves generation quality.

**Q: Why is the Gradio URL temporary?**
Google Colab provides free GPU access but does not offer persistent server hosting. Gradio creates a temporary public tunnel that expires when the Colab session ends. A production system would use a dedicated GPU server or a managed inference API.

**Q: Why no Kafka or microservices?**
The original SRS included these for academic completeness, but they are not necessary at MVP scale. The monolithic Next.js architecture handles all current requirements. Adding unnecessary infrastructure would increase complexity without user-facing benefit.

**Q: How does the credit system work?**
Each user starts with a Gold balance (stored in the `profiles` table). Every track generation costs 10 Gold. The API route checks the balance before generating, and deducts credits after successful audio upload.

---

## License

This project was developed as an academic capstone. All rights reserved by the author.

Meta MusicGen is licensed under [CC-BY-NC 4.0](https://creativecommons.org/licenses/by-nc/4.0/).
