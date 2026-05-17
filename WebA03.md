<!--
Instructions for Claude:
Convert this Markdown into a formal academic Word document(.docx). Keep the title page, headings, tables, code blocks, and appendix structure. Use professional formatting, page numbers, table borders, and consistent heading styles. If student name, enrollment number, instructor name, or section are not provided, keep the bracketed placeholders so they can be filled before submission.
-->

# Bahria University

## Assignment 3 (CLO-2)

## Web Application Design & Testing Task

**Project Title:** AuraBeat - AI-Powered Music Generation Platform  
**Course:** Web Application Development  
**Student Names:** Talha Naveed & Abdul Wahab  
**Enrollments:** 01-131232-089 & 01-131232-007  
**Section:** BSE-6A  
**Instructor:** Engr. Subas Bilal 
**Submission Date:** 17 May 2026  

---

# Table of Contents

1. Introduction  
2. Task 1: Application Architecture  
3. Selected Framework and Justification  
4. AuraBeat Web Application Design  
5. Task 2: Testing and Usability  
6. Selenium Testing Strategy  
7. CRUD Test Plan  
8. Selenium Test Implementation  
9. Test Execution Summary  
10. Conclusion  
11. Appendix: Commands and File References  

---

# 1. Introduction

AuraBeat is a full-stack web application designed for AI-powered music generation. The application allows users to register, sign in, generate AI music tracks, upload reference audio, manage a personal music library, play tracks through a persistent audio player, edit tracks in a browser-based music editor, and access selected features through public API endpoints.

This report documents the design and testing work required for Assignment 3. The assignment requires two major deliverables:

1. Determine an application architecture and framework for the web application.
2. Use Selenium to test the web application and create a plan to test CRUD operations.

The selected application for this assignment is AuraBeat, developed using Next.js, React, TypeScript, Supabase, Tailwind CSS, Selenium WebDriver, and ChromeDriver.

---

# 2. Task 1: Application Architecture

## 2.1 Requirement

The assignment requires determining a framework for the application. For AuraBeat, the selected framework is:

**Next.js 14 with the App Router architecture.**

Next.js is used as the main full-stack framework because it supports server-side rendering, client-side React components, API routes, middleware, authentication flows, protected pages, and production deployment through platforms such as Vercel.

## 2.2 Selected Architecture

AuraBeat follows a modern full-stack web application architecture:

| Layer | Technology Used | Responsibility |
|---|---|---|
| Frontend Framework | Next.js 14 and React 18 | User interface, routing, interactive pages, client components |
| Language | TypeScript | Type-safe application logic |
| Styling | Tailwind CSS | Responsive dark-themed user interface |
| Authentication | Supabase Auth | User registration, login, session handling, protected pages |
| Database | Supabase PostgreSQL | Stores profiles, tracks, and API keys |
| File Storage | Supabase Storage | Stores generated music and uploaded audio files |
| API Layer | Next.js Route Handlers | Handles generation, API keys, tracks, and admin operations |
| State Management | Zustand | Persistent audio player and toast notifications |
| AI Backend | Gradio server with MusicGen | Generates audio from optimized prompts |
| Test Automation | Selenium WebDriver with ChromeDriver | Browser-based end-to-end testing |

## 2.3 High-Level Architecture

The architecture can be understood as a layered design:

```text
User Browser
    |
    |  React UI, forms, audio player, editor
    v
Next.js 14 Application
    |
    |  Server Components, Client Components, Middleware, API Routes
    v
Supabase Backend
    |
    |  Auth, PostgreSQL database, Storage bucket
    v
Persistent User Data and Audio Files

Next.js API Routes
    |
    |  Optimized prompt request
    v
Gradio / MusicGen AI Backend
    |
    |  Generated MP3 output
    v
Supabase Storage and Track Metadata
```

## 2.4 Main Application Modules

| Module | Route / File Area | Purpose |
|---|---|---|
| Authentication | `/login`, `/register`, `/forgot-password`, `/reset-password` | Allows users to create accounts, sign in, and reset passwords |
| Dashboard | `/dashboard` | Displays profile summary, gold balance, plan, and recent tracks |
| Create Music | `/create` | Allows users to create AI-generated tracks using prompt, style, lyrics, and reference audio |
| Library | `/library` | Displays saved tracks, supports searching, filtering, playback, and deletion |
| Editor | `/editor` | Provides browser-based audio editing controls such as tempo, key, split, loop, remix, and stem controls |
| Profile | `/profile` | Allows profile management and account-related actions |
| API Platform | `/api-platform` | Allows authenticated users to create and manage API keys |
| Public API | `/v1/tracks`, `/v1/tracks/[id]`, `/v1/generate` | Provides API-key-based access for track listing, detail, deletion, and generation |

---

# 3. Selected Framework and Justification

## 3.1 Why Next.js Was Selected

Next.js was selected because AuraBeat requires both frontend and backend functionality in one project. A traditional frontend-only framework would require a separate backend service, while Next.js provides:

- Page routing using the App Router.
- Server Components for secure server-side data fetching.
- Client Components for interactive UI features.
- API route handlers for backend logic.
- Middleware for route protection.
- Easy environment variable handling.
- Production build support.
- Good integration with Supabase and React.

## 3.2 Why React Was Selected

React is used inside Next.js to build reusable user interface components. AuraBeat includes many interactive UI elements such as:

- Login and registration forms.
- Password visibility toggles.
- Music creation form.
- Style and genre selectors.
- File upload controls.
- Persistent audio player.
- Library grid/list toggle.
- Editor sliders and playback buttons.
- Toast notifications.

React is suitable for this because it provides component-based development and efficient state updates.

## 3.3 Why Supabase Was Selected

Supabase is used because it provides a complete backend platform with:

- Authentication.
- PostgreSQL database.
- File storage.
- Row Level Security support.
- REST API access.
- Client and server SDKs.

This reduced development time and allowed the project to focus on application features and testing rather than building custom authentication and database infrastructure from scratch.

## 3.4 Why Selenium Was Selected

Selenium was selected for testing because the assignment specifically requires Selenium and because it tests the application in a real browser environment. Selenium can verify complete user flows such as:

- Opening pages.
- Filling forms.
- Clicking buttons.
- Uploading files.
- Waiting for page updates.
- Reading visible UI text.
- Calling browser-side API requests in an authenticated session.
- Confirming CRUD behavior through UI and API responses.

---

# 4. AuraBeat Web Application Design

## 4.1 Design Goals

AuraBeat was designed with the following goals:

1. Provide a clear and modern music-generation interface.
2. Keep authentication simple and secure.
3. Give users a persistent audio playback experience.
4. Allow users to manage generated tracks in a library.
5. Provide an editor interface for basic audio manipulation.
6. Expose an API platform for developers.
7. Support automated testing of important workflows.

## 4.2 User Roles

| User Role | Description |
|---|---|
| Visitor | Can access public pages such as login and register |
| Authenticated User | Can access dashboard, create music, library, editor, profile, and API platform |
| API User | Can use generated API keys to access `/v1` endpoints |
| Admin / Demo Admin | Can update user credits and delete tracks through internal admin routes |

## 4.3 Database Design

The main database tables used by AuraBeat are:

| Table | Important Fields | Purpose |
|---|---|---|
| `profiles` | `id`, `display_name`, `gold_balance`, `plan`, `created_at` | Stores user profile and credit balance |
| `tracks` | `id`, `user_id`, `title`, `prompt`, `style_tags`, `audio_url`, `status`, `created_at` | Stores generated or uploaded track metadata |
| `api_keys` | `id`, `user_id`, `name`, `key_hash`, `prefix`, `is_active`, `last_used_at` | Stores hashed API keys for public API access |

## 4.4 Authentication Design

AuraBeat uses Supabase Auth. The authentication flow is:

1. User enters registration details on `/register`.
2. Supabase creates a new account.
3. The browser receives a secure Supabase auth session.
4. Middleware checks the session for protected routes.
5. If no session exists, the user is redirected to `/login`.
6. Authenticated pages fetch user-specific data from Supabase.

Protected pages include:

- `/dashboard`
- `/create`
- `/library`
- `/editor`
- `/profile`
- `/api-platform`

## 4.5 Music Generation Design

The music generation workflow is:

1. The user enters a prompt on `/create`.
2. The user selects a style tag such as Lo-fi, Pop, Jazz, Rock, or Electronic.
3. The user optionally uploads reference audio or melody ideas.
4. The application validates that the user is signed in and has enough Gold credits.
5. The prompt engineering layer improves the raw user prompt.
6. The backend sends the optimized prompt to a Gradio server running MusicGen.
7. The generated audio file is uploaded to Supabase Storage.
8. Track metadata is inserted into the `tracks` table.
9. The track is loaded into the persistent audio player.

## 4.6 Library and Audio Player Design

The Library page allows users to:

- View generated tracks.
- Search tracks by title, prompt, or tag.
- Switch between grid view and list view.
- Play a selected track.
- Delete tracks.
- Select multiple tracks for batch actions.

The audio player is persistent across the application and uses Zustand state management. It supports:

- Play and pause.
- Previous and next track.
- Shuffle.
- Repeat modes.
- Volume control.
- Progress tracking.
- Download and share actions.

## 4.7 Editor Design

The Editor page provides an audio-editing interface with:

- Track selector.
- Load in editor button.
- Tempo control.
- Key shift control.
- Split operation.
- Remix operation.
- Loop operation.
- Merge operation.
- Stem-style visual waveform controls.
- Playback transport controls.

This editor is designed as a browser-based editing workspace for generated music.

## 4.8 API Design

AuraBeat also includes public API endpoints protected by API keys:

| Endpoint | Method | Purpose |
|---|---|---|
| `/api/keys` | `POST` | Create an API key for the logged-in user |
| `/api/keys?id=...` | `DELETE` | Deactivate an API key |
| `/v1/tracks` | `GET` | List tracks belonging to the API-key owner |
| `/v1/tracks/[id]` | `GET` | Get details of a single track |
| `/v1/tracks/[id]` | `DELETE` | Delete a track |
| `/v1/generate` | `POST` | Generate a track using an API key |

The API key is sent using the `Authorization` header:

```http
Authorization: Bearer sk_aura_...
```

For security, AuraBeat stores only the SHA-256 hash of the API key in the database, not the raw key.

---

# 5. Task 2: Testing and Usability

## 5.1 Requirement

The assignment requires:

1. Use Selenium to test the web application.
2. Create a plan to test a CRUD operation of the application.

AuraBeat was tested using Selenium WebDriver and ChromeDriver. The automated Selenium test is located at:

```text
tests/selenium/aurabeatCrud.spec.js
```

The test can be executed using:

```bash
npm run test:selenium
```

## 5.2 Selenium Tools Used

| Tool | Purpose |
|---|---|
| Selenium WebDriver | Automates browser actions |
| ChromeDriver | Allows Selenium to control Google Chrome |
| Node.js | Runs the Selenium test script |
| Next.js Dev Server | Hosts the local web application during testing |
| Supabase REST API | Creates and verifies test fixtures |

## 5.3 Usability Testing Focus

The Selenium test focuses on important user-facing workflows:

- Can a new user register successfully?
- Can protected pages be accessed after authentication?
- Can a track be created as a test fixture?
- Can a user upload reference audio from the Create page?
- Can the track be found in the Library?
- Can the user start playback from the Library?
- Does the Editor page render important controls?
- Can an API key be created?
- Can the public API read and delete the track?

These checks verify both functionality and usability because they confirm that the user can complete real tasks through the browser interface.

---

# 6. Selenium Testing Strategy

## 6.1 Type of Testing

The Selenium test is an end-to-end test. It checks the complete flow from browser interaction to backend data persistence.

The test covers:

- UI testing.
- Authentication testing.
- File upload testing.
- API testing.
- Database-backed CRUD validation.
- Protected route testing.
- Regression testing for major user journeys.

## 6.2 Test Environment

| Environment Item | Value |
|---|---|
| Application URL | `http://127.0.0.1:3001` during test execution |
| Framework | Next.js 14 |
| Browser | Google Chrome in headless mode |
| WebDriver | Selenium WebDriver |
| Driver | ChromeDriver |
| Database | Supabase PostgreSQL |
| Storage | Supabase Storage `tracks` bucket |
| Test Script | `tests/selenium/aurabeatCrud.spec.js` |

## 6.3 Environment Variables Required

The Selenium test reads environment variables from `.env.local` and `process.env`.

Required variables:

```env
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
GRADIO_SERVER_URL=...
```

Notes:

- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are required for authentication and data operations.
- `SUPABASE_SERVICE_ROLE_KEY` is used for cleanup of test users after execution.
- `GRADIO_SERVER_URL` is required only when live generation testing is enabled.
- Sensitive values must not be included in the report.

## 6.4 Selenium Test Flow

The Selenium script performs the following actions:

1. Starts by resolving the local base URL.
2. Creates a one-second silent `.wav` file for upload testing.
3. Opens Chrome in headless mode.
4. Registers a new test user through the `/register` page.
5. Extracts the Supabase session from the browser cookie.
6. Updates the test user's credits for generation-related operations.
7. Creates a track fixture through Supabase REST API.
8. Opens the `/create` page and uploads the silent audio file as reference audio.
9. Opens the `/library` page.
10. Switches to list view.
11. Finds the created test track.
12. Clicks the track play button.
13. Confirms that the player shows "Now playing".
14. Opens the `/editor` page.
15. Confirms editor controls are visible.
16. Creates an API key through `/api/keys`.
17. Calls `/v1/tracks` to verify the track appears in the API list.
18. Calls `/v1/tracks/[id]` to verify track details.
19. Optionally calls `/v1/generate` if live AI testing is enabled.
20. Deletes the test track through `/v1/tracks/[id]`.
21. Confirms that the deleted track returns `404`.
22. Cleans up the temporary file and test user.

---

# 7. CRUD Test Plan

## 7.1 CRUD Scope

The selected CRUD resource for this assignment is the **Track** resource. Tracks are the main data entity in AuraBeat because users generate, store, read, play, and delete music tracks.

The CRUD operations are mapped as follows:

| CRUD Operation | AuraBeat Feature | How It Is Tested |
|---|---|---|
| Create | Create a track record and upload reference audio | Selenium registers user, creates a track fixture, and uploads audio through `/create` |
| Read | View track in Library and public API | Selenium checks `/library`, `/v1/tracks`, and `/v1/tracks/[id]` |
| Update | Update user profile/credits and track-related state | Selenium updates the test user's profile credits before track/API testing; planned track status update can be verified through Save to Library |
| Delete | Delete a track | Selenium calls `/v1/tracks/[id]` with `DELETE` and verifies `404` afterward |

Because the current public track API supports `GET` and `DELETE` for tracks, the automated test verifies track Create, Read, and Delete directly. The Update part is represented by profile/credit update in the automated setup and by the planned Save-to-Library track status update for future complete track update coverage.

## 7.2 CRUD Test Case Table

| Test Case ID | Operation | Test Objective | Test Steps | Expected Result | Status |
|---|---|---|---|---|---|
| TC-01 | Create User | Verify that a new user can register | Open `/register`, enter display name, email, password, confirm password, accept terms, submit | User is redirected to `/dashboard` | Passed |
| TC-02 | Update Profile Credits | Verify backend update route works for test setup | Call `/api/admin/users` with test user ID and credit balance | User profile receives Pro plan and 100 Gold credits | Passed |
| TC-03 | Create Track | Verify a track can be created for the authenticated user | Insert a track fixture into Supabase `tracks` table using authenticated REST request | Track row is created and an ID is returned | Passed |
| TC-04 | Create / Upload Audio | Verify reference audio upload usability | Open `/create`, select Custom mode, open Advanced Parameters, upload silent `.wav` file | Upload completes and UI shows Ready | Passed |
| TC-05 | Read Track in Library | Verify the Library displays created track | Open `/library`, switch to list view, locate the test track title | Track is visible in the Library table | Passed |
| TC-06 | Read / Playback | Verify user can play a track from Library | Click Play button beside the test track | Audio player displays Now playing feedback | Passed |
| TC-07 | Read Editor Page | Verify editor loads important controls | Open `/editor`, wait for tempo input and page heading | Editor controls render successfully | Passed |
| TC-08 | Create API Key | Verify user can create an API key | Call `/api/keys` in authenticated browser context | API key is returned | Passed |
| TC-09 | Read Tracks API | Verify public track list endpoint | Call `GET /v1/tracks?limit=50` using API key | Response status is `200` and includes test track | Passed |
| TC-10 | Read Track Detail API | Verify public track detail endpoint | Call `GET /v1/tracks/[id]` using API key | Response status is `200` and correct track ID is returned | Passed |
| TC-11 | Generate Track API | Verify live AI generation through API | Call `POST /v1/generate` using API key | Track is generated and returned; this is optional because it depends on live Gradio server | Optional |
| TC-12 | Delete Track API | Verify track deletion | Call `DELETE /v1/tracks/[id]` using API key | Response returns `{ success: true }` | Passed |
| TC-13 | Confirm Delete | Verify deleted track is no longer readable | Call `GET /v1/tracks/[id]` after deletion | Response status is `404` | Passed |

## 7.3 Detailed CRUD Plan

### Create Operation Plan

**Objective:** Verify that AuraBeat can create user and track data successfully.

**Preconditions:**

- Application is running locally.
- Supabase environment variables are configured.
- Email confirmation is disabled for local testing or test users can be immediately signed in.

**Steps:**

1. Open `/register`.
2. Fill in display name, email, password, and confirm password.
3. Accept responsible-use checkbox.
4. Submit registration form.
5. Confirm redirection to `/dashboard`.
6. Insert a test track record for the authenticated user.
7. Open `/create`.
8. Upload a reference audio file.

**Expected Result:**

- User account is created.
- Track fixture is created.
- Reference audio upload is accepted and displayed as Ready.

### Read Operation Plan

**Objective:** Verify that created data can be viewed in the UI and through API endpoints.

**Steps:**

1. Open `/library`.
2. Switch to list view.
3. Locate the test track title.
4. Click the Play button.
5. Confirm "Now playing" feedback.
6. Create an API key.
7. Call `GET /v1/tracks`.
8. Call `GET /v1/tracks/[id]`.

**Expected Result:**

- Track is visible in the Library.
- Playback begins through the global audio player.
- API list returns the track.
- API detail endpoint returns the correct track.

### Update Operation Plan

**Objective:** Verify that application data can be updated.

**Current Automated Coverage:**

The Selenium test updates the test user's profile state by calling `/api/admin/users` and setting:

- `gold_balance` to `100`
- `plan` to `Pro`

This verifies update behavior for the `profiles` resource.

**Planned Track Update Coverage:**

A future test can verify track update behavior by adding a public or authenticated update endpoint for track metadata, for example:

```http
PATCH /v1/tracks/[id]
```

Possible update fields:

- `title`
- `status`
- `style_tags`

**Expected Result:**

- Profile update returns success.
- Future track update endpoint should return updated track metadata.

### Delete Operation Plan

**Objective:** Verify that a track can be deleted and is no longer accessible.

**Steps:**

1. Call `DELETE /v1/tracks/[id]` using the generated API key.
2. Confirm response returns success.
3. Call `GET /v1/tracks/[id]` again.

**Expected Result:**

- Delete response returns status `200`.
- Deleted track returns status `404`.

---

# 8. Selenium Test Implementation

## 8.1 Test File

The Selenium test file is:

```text
tests/selenium/aurabeatCrud.spec.js
```

## 8.2 Package Script

The package script is:

```json
{
  "test:selenium": "node tests/selenium/aurabeatCrud.spec.js"
}
```

## 8.3 Important Selenium Techniques Used

| Technique | Purpose |
|---|---|
| `Builder().forBrowser("chrome")` | Opens Chrome through Selenium |
| Chrome headless mode | Runs tests without manually opening browser UI |
| `driver.get(url)` | Navigates to pages |
| `By.id(...)` | Finds form fields |
| `By.css(...)` | Finds buttons and inputs |
| `By.xpath(...)` | Finds nested UI elements and track rows |
| `until.elementLocated(...)` | Waits for elements to appear |
| `driver.executeAsyncScript(...)` | Executes authenticated browser-side API calls |
| Temporary `.wav` generation | Tests audio file upload without relying on external local files |
| API key authentication | Tests `/v1` endpoints as a developer user |

## 8.4 Simplified Test Code Example

The following simplified excerpt shows the main idea of the Selenium test:

```javascript
await driver.get(`${baseUrl}/register`);
await driver.findElement(By.id("displayName")).sendKeys("Selenium Test");
await driver.findElement(By.id("email")).sendKeys(testEmail);
await driver.findElement(By.css('input[name="new-password"]')).sendKeys(testPassword);
await driver.findElement(By.css('input[name="confirm-password"]')).sendKeys(testPassword);
await driver.findElement(By.css('input[type="checkbox"]')).click();
await driver.findElement(By.css('button[type="submit"]')).click();
await driver.wait(until.urlContains("/dashboard"), TIMEOUT);
```

This verifies that the registration form works and the user reaches the dashboard.

Another simplified excerpt shows public API verification:

```javascript
const tracksList = await fetchJson(`${baseUrl}/v1/tracks?limit=50`, {
  headers: { Authorization: `Bearer ${apiKey}` },
});

if (tracksList.status !== 200 || !Array.isArray(tracksList.body.tracks)) {
  throw new Error("Unexpected /v1/tracks response");
}
```

This verifies that the API returns a valid track list for the authenticated API key owner.

---

# 9. Test Execution Summary

## 9.1 Commands Used

The following commands were used to verify the application and Selenium test:

```bash
node --check tests/selenium/aurabeatCrud.spec.js
npm run lint
npm run build
npm run dev -- -p 3001
SELENIUM_BASE_URL=http://127.0.0.1:3001 npm run test:selenium
```

## 9.2 Execution Result

| Check | Result |
|---|---|
| JavaScript syntax check | Passed |
| ESLint check | Passed |
| Next.js production build | Passed |
| Selenium CRUD test | Passed |

## 9.3 Selenium Console Summary

The Selenium test completed the following sequence successfully:

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

## 9.4 Notes About Optional Generation Test

The `/v1/generate` endpoint depends on a live Gradio server running the MusicGen backend. Since the Gradio URL can expire when the Colab runtime stops, the generation test is optional by default.

To enable live generation testing, run:

```bash
SELENIUM_RUN_GENERATE=1 SELENIUM_BASE_URL=http://127.0.0.1:3001 npm run test:selenium
```

This will call the real `/v1/generate` endpoint and verify that a generated track is returned.

---

# 10. Usability Observations

## 10.1 Positive Usability Points

AuraBeat provides a clear and usable interface:

- The registration page has clear form fields and validation.
- Protected pages redirect unauthenticated users to login.
- The Create page separates basic and advanced options.
- The Library page supports both grid and list views.
- The persistent audio player improves navigation because playback continues across pages.
- Toast notifications provide feedback for upload, playback, success, and error events.
- API Platform allows users to create developer API keys without database access.

## 10.2 Usability Risks

Some usability risks were also identified:

- Live AI generation depends on the Gradio server being online.
- If Supabase email confirmation is enabled, automated registration requires additional setup.
- Deleting a track removes the database record, but storage cleanup may require a future background job.
- Track metadata update is not exposed as a full public CRUD endpoint yet.

## 10.3 Suggested Improvements

Recommended improvements:

1. Add a public or authenticated `PATCH /v1/tracks/[id]` endpoint for track metadata updates.
2. Add storage cleanup when a track is deleted.
3. Add screenshots to the final Word document for each major Selenium test stage.
4. Add CI support so Selenium tests can run automatically.
5. Add test data seeding and cleanup scripts for repeatable academic demonstration.

---

# 11. Conclusion

AuraBeat uses a modern full-stack web architecture based on Next.js 14, React, TypeScript, Supabase, Tailwind CSS, Zustand, and Gradio/MusicGen. This architecture is appropriate because the application needs interactive pages, protected routes, server-side data access, API endpoints, file storage, authentication, and AI integration.

Selenium WebDriver was used to test the most important browser workflows and CRUD-related operations. The automated test verifies registration, authentication, track creation setup, reference audio upload, track reading in the Library, playback, editor rendering, API key creation, public API read operations, and track deletion. The Selenium CRUD test passed successfully, demonstrating that the main AuraBeat workflows are functioning correctly.

This satisfies the assignment requirements for application architecture selection, Selenium-based web application testing, and CRUD test planning.

---

# 12. Appendix: Commands and File References

## 12.1 Important Files

| File | Purpose |
|---|---|
| `src/app/create/page.tsx` | Create Music page |
| `src/app/library/LibraryClient.tsx` | Library UI and track actions |
| `src/app/editor/EditorClient.tsx` | Music Editor UI |
| `src/app/api/keys/route.ts` | API key creation and deletion |
| `src/app/api/v1/tracks/route.ts` | Public track list endpoint |
| `src/app/api/v1/tracks/[id]/route.ts` | Public track detail and delete endpoint |
| `src/app/api/v1/generate/route.ts` | Public generation endpoint |
| `src/lib/auth/apiKey.ts` | API key authentication helper |
| `tests/selenium/aurabeatCrud.spec.js` | Selenium CRUD test |
| `package.json` | Project scripts and dependencies |

## 12.2 Test Commands

Start the local application:

```bash
npm run dev -- -p 3001
```

Run Selenium test:

```bash
SELENIUM_BASE_URL=http://127.0.0.1:3001 npm run test:selenium
```

Run syntax check:

```bash
node --check tests/selenium/aurabeatCrud.spec.js
```

Run lint:

```bash
npm run lint
```

Run production build:

```bash
npm run build
```

## 12.3 Selenium Tutorial References From Assignment

The assignment image included these Selenium tutorial references:

1. `https://wiki.saucelabs.com/display/DOCS/Getting+Started+with+Selenium+for+Automated+Website+Testing`
2. `https://www.guru99.com/selenium-tutorial.html`

The implemented Selenium test follows the same general approach: open a real browser, locate page elements, perform user actions, wait for expected UI changes, and verify the final result.

