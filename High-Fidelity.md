# High-Fidelity Prototype Prompt

## Purpose

Use this file as the prompt/specification for Figma AI to generate the high-fidelity prototype required for the HCI assignment.

Assignment requirement covered:

- Part C: Build a High-Fidelity Prototype.
- The high-fidelity version must be digital, interactive, polished, and based on usability survey feedback.
- It must address major usability concerns discovered during survey analysis.

FYP selected for the assignment:

**AuraBeat - AI-Powered Music Generation Platform**

## Survey Feedback To Address

Replace or refine these after collecting actual survey responses. Until then, use these as expected feedback themes from low-fidelity testing:

| Usability Concern | High-Fidelity Improvement |
|---|---|
| Users may not know where to start from dashboard | Add a clear "Create Track" primary action and recent activity summary |
| Create Music may feel overloaded | Use a step-based or sectioned layout with Basic and Advanced controls |
| Users may not understand generation status | Add progress state, status copy, loading indicator, and success toast |
| Reference audio upload may be unclear | Use a labeled drag-and-drop upload zone with accepted formats |
| Gold/credit cost may be missed | Show credit balance and generation cost near the Generate button |
| Library actions may be hard to identify | Use clear Play, Edit, Delete, Download icons with tooltips |
| Delete action may feel risky | Add confirmation dialog and warning copy |
| Audio player may be overlooked | Use a persistent, visually distinct bottom audio player |
| Mobile navigation may overflow | Use bottom navigation and compact player on mobile |
| API Platform may be confusing | Add endpoint cards, copy buttons, and plain language labels |

## Figma AI Prompt

Copy this full prompt into Figma AI:

```text
Create a high-fidelity interactive Figma prototype for an HCI assignment.

Project name: AuraBeat
Project type: AI-powered music generation platform.
Audience: music creators, students, content creators, beginner AI users, and developer users.

Goal:
Create a polished, interactive web app prototype that improves the low-fidelity wireframe after usability survey feedback. The design should address navigation clarity, create-flow complexity, generation feedback, library management, error prevention, and mobile usability.

Brand direction:
- Product name: AuraBeat.
- Tone: modern, creative, focused, trustworthy.
- Visual style: premium dark music studio interface, but still readable and professional.
- Avoid clutter and purely decorative screens.
- The app should feel like an actual usable product, not a marketing landing page.

Design system:
- Use a dark base background similar to #0D0D1A.
- Use deep panel backgrounds similar to #111122 and #1A1A2E.
- Primary accent: violet/purple similar to #7C3AED.
- Secondary accents: cyan/teal for audio/progress, emerald for success, red for destructive actions.
- Use high contrast text.
- Use a clean modern sans-serif font such as Inter, Geist, or similar.
- Use consistent spacing, 8px radius or less for cards/buttons unless required by component style.
- Use recognizable icons for navigation and actions.
- Use accessible tap targets and readable text.

Create the following high-fidelity frames. Use desktop frames at 1440 x 900 unless otherwise specified. Include mobile frames at 390 x 844 for the most important flows.

Frame 1: Prototype Cover
- Title: AuraBeat High-Fidelity Prototype.
- Subtitle: AI music generation platform.
- Include student/project placeholder and HCI assignment label.
- Include a small preview of the main app interface.

Frame 2: Design System / Component Board
- Color palette swatches.
- Typography scale.
- Buttons: primary, secondary, danger, disabled.
- Inputs, textarea, dropdown, segmented control, toggle, chips/tags.
- Cards, modals, toasts, progress states.
- Icons used for Dashboard, Create, Library, Editor, Profile, API, Play, Edit, Delete, Download.

Frame 3: Login
- Polished login form.
- Email and password fields.
- Password visibility icon.
- Login button.
- Create Account link.
- Forgot Password link.
- Add clear validation/error message state.

Frame 4: Register
- Display Name, Email, Password, Confirm Password, Terms checkbox.
- Password helper/requirements area.
- Create Account button.
- Link back to Login.
- Keep form clear and not visually crowded.

Frame 5: Dashboard
- Main app shell with left sidebar.
- Sidebar items: Dashboard, Create, Library, Editor, Profile, API Platform.
- Show Admin only as optional/admin-only item.
- Top bar with user avatar/profile menu and gold balance.
- Main content:
  - Welcome message.
  - Primary "Create Track" button.
  - Gold balance card.
  - Recent tracks list.
  - Quick stats: tracks created, credits, API keys.
- Persistent bottom audio player in compact inactive state.
- Usability improvement: make next action obvious.

Frame 6: Create Music - Step 1 Prompt and Style
- Use a clean two-column layout on desktop.
- Left/main: prompt textarea with examples.
- Style chips: Lo-fi, Pop, Jazz, Rock, Electronic, Cinematic.
- Toggle/segmented control: Instrumental / With Vocals.
- Credit cost badge near Generate/Next button.
- Right side: Preview/summary panel.
- Primary button: Continue or Generate.
- Usability improvement: reduce clutter by focusing on essential inputs first.

Frame 7: Create Music - Advanced Options
- Advanced section with Lyrics, Vocal Gender, Vocal Tone, Reference Audio Upload, Melody Upload.
- Drag-and-drop upload zone with accepted file types and "Ready" uploaded state.
- Helpful hint text.
- Back/Generate buttons.
- Usability improvement: label advanced controls clearly and make them optional.

Frame 8: Generation Progress
- Status screen or panel: "Generating your track..."
- Animated/progress visual placeholder.
- Show current prompt summary and selected style.
- Message: "This may take up to a few minutes."
- Disable duplicate generate action.
- Usability improvement: users receive feedback during long AI operation.

Frame 9: Generation Result
- Track result card with title, style tags, prompt summary, duration placeholder.
- Actions: Play, Save to Library, Regenerate, Download.
- Success toast: "Track generated and saved."
- Bottom player active with generated track loaded.
- Usability improvement: clear next steps after generation.

Frame 10: Library Grid
- Search input.
- Filter chips.
- Sort dropdown.
- Grid/list toggle.
- Track cards with waveform/thumbnail placeholder, title, tags, date, duration.
- Actions: Play, Edit, Delete, Download.
- Active/playing state on one card.
- Persistent bottom audio player.
- Usability improvement: make track management actions visible.

Frame 11: Library List
- Table layout optimized for scanning.
- Columns: Track, Tags, Date, Duration, Actions.
- Row actions with icons and tooltips.
- Batch selection checkboxes.
- Batch delete button appears when rows selected.
- Usability improvement: support power users and many tracks.

Frame 12: Edit Track Modal
- Modal over Library.
- Fields: Title, Tags.
- Save Changes and Cancel buttons.
- Validation state for empty title.
- Success toast after save.
- Usability improvement: simple metadata editing without leaving Library.

Frame 13: Delete Confirmation Modal
- Modal: "Delete this track?"
- Body: "This removes the track from your library."
- Buttons: Cancel and Delete.
- Delete button is red/danger style.
- Usability improvement: prevent accidental deletion.

Frame 14: Expanded Audio Player
- Expanded bottom player or drawer.
- Track title, style tags, timeline, current time, duration.
- Controls: previous, play/pause, next, repeat, shuffle, volume.
- Queue preview.
- Usability improvement: playback remains persistent and controllable.

Frame 15: Music Editor
- Polished studio-like editor screen.
- Waveform area with horizontal scroll if needed.
- Toolbar controls: Tempo, Key, Split, Loop, Remix, Stems.
- Sliders/inputs where appropriate.
- Side panel for selected track details and effects.
- Usability improvement: organize complex tools into clear groups.

Frame 16: Profile
- User profile card.
- Display name edit field.
- Email/account info placeholder.
- Plan and Gold balance.
- Sign Out button.
- Usability improvement: account and credit status are easy to find.

Frame 17: API Platform
- API key management screen.
- Create API Key button.
- Active keys list with prefix, name, status, created date.
- Endpoint cards:
  - GET /v1/tracks
  - GET /v1/tracks/:id
  - PATCH /v1/tracks/:id
  - DELETE /v1/tracks/:id
  - POST /v1/generate
- Include copy buttons and simple code sample area.
- Usability improvement: developer features are organized and understandable.

Frame 18: API Key Created Modal
- Modal showing generated key once.
- Copy key button.
- Warning: "Copy this key now. You will not see it again."
- Usability improvement: clear security behavior.

Frame 19: Admin Dashboard Optional
- Admin-only management page.
- Stats cards: users, tracks, gold, API keys.
- Recent users table with edit action.
- Recent tracks table with delete action.
- System health area: AI server status.
- Usability improvement: admin controls are separated from normal user flows.

Mobile frames:
Frame 20: Mobile Dashboard
- 390 x 844.
- Bottom navigation: Dashboard, Create, Library, Editor, Profile.
- Compact cards and gold balance.
- Mini player above bottom nav.

Frame 21: Mobile Create Music
- Prompt, style chips, Generate button.
- Advanced options collapsed.
- Credit cost visible.

Frame 22: Mobile Library
- Search, track list cards, play/edit/delete actions.
- Mini player above bottom nav.

Interactive prototype connections:
- Login -> Dashboard.
- Register -> Dashboard.
- Dashboard Create Track -> Create Music.
- Create Music basic -> Advanced Options or Generation Progress.
- Generation Progress -> Generation Result.
- Save to Library -> Library Grid.
- Grid/list toggle -> Library List.
- Play action -> Active bottom player / Expanded Audio Player.
- Edit action -> Edit Track Modal.
- Delete action -> Delete Confirmation Modal.
- Profile sidebar -> Profile.
- API Platform sidebar -> API Platform.
- Create API Key -> API Key Created Modal.
- Mobile bottom nav connects between mobile frames.

States to include:
- Empty Library state.
- Upload ready state.
- Generation loading state.
- Generation success state.
- Delete confirmation state.
- Validation error state for empty title.
- API key created state.

Accessibility and usability requirements:
- Use high contrast.
- Keep text readable.
- Make primary actions visually clear.
- Use familiar icons and labels.
- Do not hide destructive actions without confirmation.
- Keep mobile tap targets large enough.
- Avoid overcrowding advanced options.
- Make credit cost visible before generation.

Do not create:
- A marketing-only landing page.
- Decorative screens that do not support app tasks.
- Random unrelated music app features.
- Overly abstract illustrations instead of actual app interface.
```

## Manual Checks After Figma AI Generates It

- The prototype looks polished and high-fidelity.
- It includes all major app screens.
- It has clickable navigation between main flows.
- It shows improvements based on survey feedback.
- It includes both desktop and mobile concepts.
- Generation progress and success states are clear.
- Delete confirmation is present.
- Library actions are visible.
- The create flow is not overloaded.
- The audio player is persistent.
- Text contrast and spacing are acceptable.

## Improvements To Mention In The Report

Use this table in the HCI report and replace values with actual survey findings:

| Survey Finding | Implemented Improvement |
|---|---|
| Users wanted clearer starting point | Dashboard now has a prominent Create Track button |
| Users found Create page too dense | Basic and Advanced sections are separated |
| Users wanted generation feedback | Added progress state and time expectation copy |
| Users missed reference audio upload | Added labeled upload drop zone and ready state |
| Users were unsure about delete action | Added confirmation modal |
| Users wanted easier track discovery | Added search, filters, sort, grid/list views |
| Users wanted visible playback controls | Added persistent player and expanded player state |
| Users found mobile navigation important | Added bottom navigation and compact player |
| Developers needed clearer API flow | Added endpoint cards, copy buttons, and key modal |

## Export Checklist

After the prototype is ready:

- Export screenshots for the final report.
- Copy the Figma prototype link.
- Capture at least these images:
  - Prototype map or cover.
  - Dashboard.
  - Create Music.
  - Generation Result.
  - Library.
  - Edit/Delete modal.
  - Audio Player.
  - Mobile screen.
  - API Platform.
- Save the link for the report placeholder.
