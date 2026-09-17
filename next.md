Astrology App: Implementation Requirements

Implement the following changes across the application without introducing regressions or breaking existing functionality.

1. Balanced AI Reports

Update the AI-generated person report so it presents a balanced view.

* Show positive traits, strengths, and favorable aspects.
* Show negative traits, weaknesses, challenges, or concerns only when they genuinely exist.
* Do not force negative points when there are none.
* Keep the language factual, balanced, and easy to understand.
* Avoid overly generic, exaggerated, or repetitive statements.

2. Remove Local Storage

Do not use browser localStorage for report persistence.

Supabase should be the source of truth for persisted users and reports.

When a user/report is created:

* Save the required structured data to Supabase.
* Retrieve reports from Supabase when needed.
* Do not duplicate report persistence in localStorage.
* Do not rely on localStorage for browser Back/Forward navigation.

3. Human-Friendly Language

Review the entire application’s copy and make it:

* Simple
* Human-friendly
* Clear
* Concise
* Easy to scan
* Easy for a non-technical user to understand

Avoid robotic, overly formal, or AI-generated sounding language.

Use simple astrology terminology with short explanations where needed.

4. Supabase Database

Use Supabase as the persistent backend database.

Store the structured information required to reconstruct reports, rather than the complete AI-generated summary.

Store only relevant structured data, such as:

* Person information
* Birth details
* Positive insights
* Negative insights, when applicable
* Focus/pillar information
* Kundli-related data
* Matching factors
* Report metadata
* Unique report UID

Avoid storing unnecessary AI-generated prose or large unstructured blobs.

Database as the Source of Truth

The application should follow this general flow:

User Input → AI/Report Generation → Structured Report → Supabase → UI

When an existing report is opened:

Route/UID → Supabase → Structured Report → UI

Do not regenerate an existing report unless explicitly required.

5. Astrology-Focused Database Loaders

Add beautiful, astrology-focused loading states whenever information is being fetched from Supabase or another backend source.

The loaders should feel like part of the product experience rather than generic skeleton screens.

Examples of visual direction:

* Subtle celestial/star animations
* Constellation-inspired patterns
* Moon/orbit animations
* Zodiac-inspired visual elements
* Gentle shimmer effects
* Animated astrology symbols
* Subtle cosmic gradients
* Elegant progress indicators

Keep the animations:

* Professional
* Smooth
* Minimal
* Fast
* Non-distracting

Avoid excessive visual effects or making the app look like a game.

Loading Experience

Instead of showing a generic:

Loading…

Use contextual messaging such as:

Reading the stars…

Aligning the details…

Preparing your astro profile…

Mapping your cosmic insights…

Preparing your compatibility report…

The loading message should match the operation being performed.

For example:

Fetching an existing report

✦ Reading your astro profile…

Kundli matching

✦ Comparing your charts…

Generating a new report

✦ Mapping your cosmic insights…

Also provide proper loading states for:

* Initial page loading
* Supabase requests
* Report fetching
* Kundli matching
* Public shared reports
* PDF generation where applicable

6. Redesign Kundli Matching

Redesign the Kundli matching experience to be comparison-focused and intuitive.

The report should help users quickly understand compatibility rather than presenting a large amount of disconnected information.

Include the relevant factors that someone evaluating Kundli compatibility would typically want to understand.

For each important factor:

* Show the result clearly.
* Explain what it means in simple language.
* Highlight positive aspects.
* Highlight negative aspects or concerns when they exist.
* Make differences between the two people easy to understand.
* Clearly distinguish strengths, concerns, and neutral observations.

The final experience should feel like an intuitive compatibility report rather than raw Kundli data.

7. Complete Application UI Redesign

Redesign the complete application UI.

The current interface should be replaced with a more polished and professional design.

Design Direction

The visual language should be:

* Astrology-focused
* Professional
* Clean
* Modern
* Trustworthy
* Elegant
* Calm
* Visually distinctive

Avoid making it look like a generic AI/vibe-coded application.

Use astrology-inspired elements tastefully:

* Celestial motifs
* Constellations
* Zodiac references
* Moon/planet imagery
* Subtle cosmic backgrounds
* Refined typography
* Carefully chosen gradients
* Clean cards and layouts

Do not overdo the visual effects.

The application should feel like a real production astrology product, not an experimental AI interface.

Maintain strong:

* Visual hierarchy
* Spacing
* Typography
* Accessibility
* Responsive behavior
* Component consistency

8. Astrology Landing Page

Create a dedicated, polished landing page for the application.

The landing page should be:

* Beautiful
* Astrology-focused
* Professional
* Modern
* Eye-catching
* Clear
* Trustworthy

Include sections such as:

* Hero section
* Clear product value proposition
* How it works
* Astro/person reports
* Kundli matching
* Example insights
* Key features
* Clear CTAs
* Trust/reassurance section
* Footer

The hero section should immediately communicate what the application does.

The design should be visually memorable without becoming overly flashy.

9. Separate Person Report Route

Move the Astro Report to a dedicated route based on the person’s name.

For example:

/Rahul

Instead of rendering the report on the existing/shared route.

The route should fetch the corresponding report from Supabase.

Handle:

* Spaces
* Special characters
* URL encoding
* Duplicate names

Do not rely on the person’s name as the database’s unique identifier.

10. Fix Focus Pillar Filtering

Fix the existing bug where selecting a single focus pillar still displays the complete report.

Expected behavior:

* One pillar selected → show only that pillar.
* Multiple pillars selected → show only those selected pillars.
* All selected → show the complete report.

This filtering must remain consistent across:

* AI generation
* Report rendering
* Supabase persistence
* Person routes
* Shared reports
* PDF exports

Do not regress existing multi-pillar functionality.

11. Route-Based Report Navigation

The URL should determine which report is displayed.

For example:

/Rahul

should fetch Rahul’s report from Supabase.

When navigating between reports:

* Browser Back should return to the previous report.
* Browser Forward should return to the next report.
* The correct report should automatically be fetched based on the current route.
* Do not regenerate reports unnecessarily.
* Show the astrology-focused DB loader while fetching.

The URL should be the navigation state, while Supabase remains the persistence source of truth.

12. Unique Report UID

Every saved person/report should have a unique UID.

Do not use:

/PersonName

as the database identifier.

Instead, use a unique UID internally.

For example:

8f3a2c91-...

The person’s name can still be used for the human-friendly route where appropriate, but the underlying database record must use the UID.

Ensure the UID is:

* Unique
* Stable
* Safe to expose publicly
* Not based on sensitive information

13. Public Shareable Reports

Allow users to generate a public shareable URL.

For example:

/report/8f3a2c91

When someone opens the URL:

1. Extract the UID.
2. Fetch the corresponding structured report from Supabase.
3. Display the complete report.
4. Do not regenerate the AI report.
5. Do not require authentication for public reports.
6. Show an astrology-focused loader while the report is being fetched.
7. Handle invalid or deleted UIDs gracefully.

Do not expose internal database fields or unnecessary metadata.

14. PDF Report

Allow users to download the complete report as a PDF.

The PDF should be professionally formatted and include:

* Person information
* Relevant positive insights
* Relevant negative insights
* Selected focus pillars
* Kundli matching information where applicable
* Important conclusions/observations

The PDF should be readable, well-structured, and suitable for sharing.

15. Consistent Report Architecture

Keep a clear separation between:

Input Data → AI Generation → Structured Report → Supabase → Report UI

The AI output should be converted into a predictable structured format before being consumed by the UI.

The same structured report should be usable for:

* Web rendering
* Supabase persistence
* Public sharing
* PDF generation

Avoid tightly coupling UI components to raw AI-generated text.

16. Loading, Empty, and Error States

Every asynchronous flow should have a proper state.

Loading

Use the astrology-focused loaders described above.

Empty State

If no report exists, show a clear and helpful message with an appropriate CTA.

Error State

If Supabase or another service fails:

* Explain the problem in simple language.
* Provide a retry action.
* Do not expose technical errors to the user.
* Do not leave the user stuck on an infinite loader.

Not Found

For an invalid person/report UID:

We couldn’t find this astro report.

Provide a clear way to return to the main application.

17. Overall UX Requirements

Across the application:

* Keep interactions intuitive.
* Minimize unnecessary steps.
* Make important insights visually prominent.
* Avoid duplicate information.
* Use consistent terminology.
* Make positive and negative insights equally easy to discover.
* Provide clear loading, empty, error, and not-found states.
* Ensure the experience works well on desktop and mobile.
* Maintain accessibility.
* Keep animations subtle and performant.

18. Implementation Principles

Before making changes, understand the existing architecture.

Reuse existing components, utilities, APIs, and data structures where appropriate.

Do not rewrite working functionality unnecessarily.

Prioritize:

1. No regressions
2. Correct Supabase data flow
3. Correct routing
4. Correct pillar filtering
5. Reliable report persistence
6. Professional UI/UX
7. Astrology-focused visual identity
8. Fast and polished loading states
9. Responsive design
10. Accessibility

Important Constraint

Remove all localStorage-based report persistence. Supabase should be the single source of truth for persisted reports.