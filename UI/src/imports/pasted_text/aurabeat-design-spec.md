Role & Objective: Act as an expert UI/UX Designer to create a high-fidelity web application design for Aurabeat, a SaaS AI-powered music and speech generation platform
. The design must strictly adhere to WCAG 2.1 AA accessibility standards, utilizing progressive disclosure, visibility of system status, and error prevention
.
1. Global Design System & Theming:
Theme: Default to a Dark Theme. The primary background should be a deep navy/black (Hex: #0D0D1A)
.
Primary Accent Color: Vibrant Purple/Violet (Hex: #7C3AED) used strictly for interactive elements, primary CTAs, and active states
.
Surfaces/Containers: Form inputs, modals, and content sections should use a "dark card" or elevated surface style with subtle, low-opacity borders to establish hierarchy without clutter
.
Responsiveness: Design for a fluid layout adapting to Desktop (>1024px), Tablet (768–1024px), and Mobile (<768px)
. All transitions/animations should use a smooth 300ms easing
.
2. Global Layout Architecture (The "3-Panel + Bars" Structure): The primary interface must be divided into a persistent app shell consisting of
:
Top Bar: A global search bar (supporting autocomplete) for songs, users, and genres, along with an unread badge icon for Notifications
.
Left Sidebar (Navigation): Fixed on desktop (min 250px), collapsible on mobile
. It must contain:
User Profile snippet (Avatar, Display Name, Subscription Tier)
.
"Gold" Balance display (the platform's credit currency)
.
Navigation Links: Home, Create Music, Create Speech, Music Edit, Library, API Platform, Notifications, Admin Dashboard
.
A prominent "Go Premier" gradient upgrade banner/CTA for free users
.
Bottom Bar (Audio Player): A persistent audio player anchored to the bottom containing a waveform visualizer, play/pause, volume controls, and download/share actions
.
Center Panel (Creation/Input): The main workspace for configuring inputs and parameters
.
Right Panel (Results/Preview): A dedicated contextual panel showing real-time generated outputs and historical variations
.
3. Key Screens & Component Specifications:
A. Core Feature: "Create Music" Workspace (Center & Right Panels)
Center Panel (Input):
Mode Toggle: Switch between "Easy" (simple prompt) and "Custom" (advanced controls)
.
Lyrics Input Area: Multi-line text box (supporting up to 3,000 characters) with a prominent "Instrumental" toggle switch. If instrumental is toggled on, show a placeholder: "Enter lyrics here or leave blank for instrumental." Include a small "Optimize with AI" magic-wand button
.
Style & Genre Control: A text area for descriptive prompts accompanied by "Quick-Select Style Chips" (e.g., Reggaeton, Lo-fi). These chips must use a rounded pill design with an accent-color border. Include a "Randomize/Refresh" icon button
.
Vocal Customization: Selectors for Vocal Gender (Male/Female) and Tone Presets (Warm, Raspy, etc.)
.
Uploads: Distinct tabs/dropzones for "+ Reference Audio" and "+ Vocal/Melody Ideas" (must include a microphone icon for direct browser recording)
.
Primary CTA Button: A large, highly prominent "Create" button featuring a gradient purple background and a music-note icon
.
Right Panel (Output/Results):
Empty State: If no tracks are generated yet, display a stylized music note illustration with muted placeholder text ("No data yet")
.
Active State: Show a loading progress indicator
. Once complete, display 2 track variations as card components. Each card needs a Title, Duration, Waveform visualization, Play button, "Save to Library" icon, Download dropdown (MP3/WAV/FLAC), and a "Regenerate" button
.
B. "Music Edit" Workspace (Center Panel)
HCI Focus: User control and freedom.
UI Components: A large, detailed waveform editor with visual zooming and audio selection brackets
.
Toolbar Operations: Clear iconography/buttons for operations like Extend, Shorten, Remix, Stem Separation (Vocals, Drums, Bass, Melody), Tempo/Key Change sliders, and Loop/Merge
.
Feedback: Must include an Undo/Redo control cluster
.
C. "Library" Page (Center Panel)
HCI Focus: Recognition rather than recall, efficiency of use.
Layout: A toggle to switch between Grid View (thumbnails/waveforms) and List View
.
Controls: Search bar, filter dropdowns (Genre, Date, Type), and Sort dropdowns
.
Interactions: Include checkboxes next to tracks for Batch Operations (Delete, Download, Add to Playlist)
. Deleted tracks should visually move to a "Trash" folder tab
.
D. "Create Speech" Page (Center Panel)
UI Components: Text input area (up to 5,000 characters). A dropdown grid of Voice Presets (minimum 20 avatar options). Include smooth sliders for control over Speed (0.5x–2.0x), Pitch, and Emphasis
.
E. Subscription & Pricing Modal/Page
Layout: A comparison table or distinct pricing cards side-by-side for Free, Basic, Pro, Premier, and Enterprise tiers
.
Visuals: Clearly highlight the Gold/Month allowance and features (Downloads, API access)
. Include a toggle for Monthly vs. Annual billing (highlighting a 20% discount)
.
4. Crucial HCI Standards & Micro-interactions:
Error Prevention: Ensure inline validation errors appear below inputs before a user clicks the "Create" button
.
System Status: Whenever the "Create" button is clicked, trigger a visual confirmation showing the deduction of "Gold" credits from the user's balance to ensure transparency
.
Accessibility: Ensure all text-to-background contrast ratios strictly meet WCAG 2.1 AA. Form borders should be visible but subtle
.

--------------------------------------------------------------------------------
Rationale Based on Notebook Content
This prompt is constructed to guarantee nothing is left behind from the provided documentation:
The 3-Panel Architecture: Explicitly mandated in the software external interface requirements and UWE presentation model tables
.
Color & Aesthetics: Extracted directly from Design Requirements (UI-1 through UI-10), ensuring the exact hex codes and shapes (pill designs, gradients) match the engineering spec
.
Feature Completeness: Covers standard features (Text to Music, Editing, Library, Speech) alongside complex parameters (Stem separation, Vocal modeling, Reference Audio) while allocating proper screen real estate
.
Credit & Subscription Awareness: Integrates the "Gold" system continuously into the UI, ensuring the user is always aware of their resources as requested by the Functional Requirements
.