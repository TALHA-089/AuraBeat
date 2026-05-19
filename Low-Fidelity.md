# Low-Fidelity Prototype Prompt

## Purpose

Use this file as the prompt/specification for Figma AI to generate the low-fidelity prototype required for the HCI assignment.

Assignment requirement covered:

- Part A: Build a Low-Fidelity Prototype.
- The prototype must represent the ongoing FYP.
- It must cover major screens/pages and major functionality.
- It may be a basic digital wireframe.

FYP selected for the assignment:

**AuraBeat - AI-Powered Music Generation Platform**

AuraBeat is a web application where users can register, generate AI music from prompts, upload reference audio, manage tracks in a library, play audio through a persistent player, edit track metadata, access a basic editor, manage their profile, and create API keys for developer use.

## Figma AI Prompt

Copy this full prompt into Figma AI:

```text
Create a complete low-fidelity digital wireframe prototype for an HCI assignment.

Project name: AuraBeat
Project type: AI-powered music generation web application.
Prototype fidelity: Low-fidelity only.
Style: grayscale digital wireframes, simple rectangles, placeholder icons, placeholder images, simple typography, no polished colors, no gradients, no final branding, no decorative visuals. Use wireframe labels and annotations.

Primary users:
1. Music creators who want to generate quick song ideas.
2. Students/content creators who need background music.
3. Developers who may want API access to generated tracks.

Main user goal:
Allow a user to sign in, create an AI music track from a prompt, optionally upload reference audio, save the track, find it in the library, play it, edit metadata, and manage basic account/API settings.

Create the following frames in a clear left-to-right navigation flow. Use desktop web frames at 1440 x 900. Also include a small mobile navigation concept frame at 390 x 844 for the main app shell.

Frame 1: Cover and Prototype Map
- Title: AuraBeat Low-Fidelity Prototype
- Subtitle: AI music generation platform
- Include a simple sitemap/navigation flow diagram.
- Show arrows between: Login/Register -> Dashboard -> Create Music -> Generation Result -> Library -> Player/Edit -> Editor/Profile/API Platform.
- Add note: "Low-fidelity prototype used for usability survey."

Frame 2: Login Screen
- Centered login form.
- Fields: Email, Password.
- Buttons: Login, Create Account.
- Links: Forgot Password.
- Annotation: "Test whether authentication options are clear."

Frame 3: Register Screen
- Registration form with Display Name, Email, Password, Confirm Password, Terms checkbox.
- Primary button: Create Account.
- Secondary link: Already have an account? Login.
- Annotation: "Registration must feel simple and not overloaded."

Frame 4: Dashboard
- App shell with left sidebar navigation.
- Sidebar items: Dashboard, Create, Library, Editor, Profile, API Platform.
- Top area: Welcome message, Gold balance/credits, plan status.
- Main cards: Recent Tracks, Quick Create button, Usage summary.
- Persistent mini audio player placeholder at the bottom.
- Annotation: "Dashboard should help users know what to do next."

Frame 5: Create Music - Basic Mode
- Prompt input area: "Describe the music you want."
- Style selector chips: Lo-fi, Pop, Jazz, Rock, Electronic, Cinematic.
- Toggle: Instrumental / With Vocals.
- Button: Generate Track.
- Sidebar/card showing cost: "10 Gold."
- Empty result panel on the right.
- Annotation: "Main creation action must be obvious."

Frame 6: Create Music - Advanced Options
- Same Create page with expanded Advanced Parameters section.
- Inputs: Lyrics, Vocal Gender, Vocal Tone, Reference Audio Upload, Melody Audio Upload.
- Upload drop zone with clear label.
- Button: Generate Track.
- Annotation: "Test whether advanced controls are understandable or overwhelming."

Frame 7: Generation Loading and Result
- Show progress state: "Generating track..."
- Progress indicator placeholder.
- Result card with generated track title, status, tags, play button, save button, regenerate button.
- Toast placeholder: "Track generated successfully."
- Annotation: "Users need feedback while AI generation is running."

Frame 8: Library - Grid View
- Search bar.
- Filter button.
- Sort dropdown.
- Grid of track cards.
- Each card has title, tags, date, play button, edit button, delete button.
- Persistent bottom audio player placeholder.
- Annotation: "Test whether users can locate and play tracks."

Frame 9: Library - List View
- Table/list version of library.
- Columns: Track, Tags, Date, Actions.
- Actions: Play, Edit, Delete.
- Include selected checkbox for batch delete.
- Annotation: "List view supports scanning and batch management."

Frame 10: Edit Track Modal
- Modal over Library.
- Fields: Track Title, Tags.
- Buttons: Save Changes, Cancel.
- Annotation: "Track metadata update should be simple and reversible."

Frame 11: Delete Confirmation
- Confirmation modal: "Delete this track?"
- Buttons: Cancel, Delete.
- Warning text: "This removes the track from your library."
- Annotation: "Prevent accidental destructive action."

Frame 12: Audio Player Expanded State
- Bottom player expanded into a larger panel.
- Controls: Play/Pause, Previous, Next, Volume, Timeline, Repeat, Shuffle.
- Current track info and queue placeholder.
- Annotation: "Persistent playback should remain available while navigating."

Frame 13: Music Editor
- Editor layout with waveform placeholder.
- Toolbar controls: Tempo, Key, Split, Loop, Remix, Stems.
- Side panel: Track info and effects.
- Annotation: "Editor is an MVP but must show main editing concepts."

Frame 14: Profile
- Profile info card with display name, email placeholder, plan, gold balance.
- Controls: Edit Display Name, Sign Out.
- Annotation: "Users should understand account status and credits."

Frame 15: API Platform
- API key list.
- Button: Create API Key.
- Modal placeholder: new key shown once.
- Endpoint examples placeholder: GET /v1/tracks, PATCH /v1/tracks/:id, DELETE /v1/tracks/:id, POST /v1/generate.
- Annotation: "Developer users need a clear path to API access."

Frame 16: Admin Dashboard Optional
- Admin summary cards: Total Users, Total Tracks, Total Gold, Active API Keys.
- Recent users table.
- Recent tracks table with delete action.
- Annotation: "Admin view is secondary and only visible to admin users."

Frame 17: Mobile App Shell Concept
- Mobile frame at 390 x 844.
- Bottom navigation: Dashboard, Create, Library, Editor, Profile.
- Compact dashboard or library preview.
- Persistent mini audio player stacked above bottom nav.
- Annotation: "Mobile navigation should not overflow."

Prototype connections:
- Login button -> Dashboard.
- Create Account link -> Register.
- Register submit -> Dashboard.
- Dashboard Quick Create -> Create Music.
- Create Music Generate -> Generation Loading and Result.
- Save/Library link -> Library Grid.
- Library grid/list toggle connects between grid and list frames.
- Edit action -> Edit Track Modal.
- Delete action -> Delete Confirmation.
- Play action -> Audio Player Expanded State.
- Sidebar navigation links to Dashboard, Create, Library, Editor, Profile, API Platform.
- API Platform Create Key -> API key modal state.

Low-fidelity requirements:
- Use grayscale only.
- Use wireframe boxes for images/waveforms/icons.
- Keep all labels readable.
- Add small annotation notes explaining design decisions.
- Do not use final polished visual design.
- Do not add marketing content beyond what is needed for app flow.
- Show enough detail for usability survey participants to understand navigation and tasks.

Deliverable should include:
1. A complete low-fidelity prototype map.
2. Major screens/pages.
3. Navigation flow arrows or clickable prototype connections.
4. Simple annotations for usability testing.
```

## Manual Checks After Figma AI Generates It

Use this checklist before showing the low-fidelity prototype to participants:

- All major screens are present.
- Navigation flow is visible or clickable.
- Create Music flow is understandable without explanation.
- Library has both grid and list concepts.
- Track edit and delete actions are represented.
- Audio player persistence is visible.
- Text labels are readable.
- Wireframes are intentionally low-fidelity and grayscale.
- No polished visual design has been introduced too early.

## Survey Tasks To Test With This Prototype

Ask participants to perform these tasks while viewing the low-fidelity prototype:

1. Register or log in and reach the dashboard.
2. Start creating a new AI music track.
3. Find where to upload reference audio.
4. Save or locate the generated track in the Library.
5. Play a track from the Library.
6. Edit a track title or tags.
7. Delete a track safely.
8. Find account/profile information.
9. Find where an API key can be created.

## Key Design Decisions To Mention In Report

- A persistent sidebar is used on desktop to make navigation predictable.
- A mobile bottom navigation concept is included because mobile width is limited.
- Create Music is separated into basic and advanced controls to reduce cognitive load.
- Generation feedback is represented because AI actions can take time.
- Library supports both grid and list views for different scanning preferences.
- Delete confirmation is included to reduce accidental destructive actions.
- Audio player remains persistent so playback can continue across pages.
