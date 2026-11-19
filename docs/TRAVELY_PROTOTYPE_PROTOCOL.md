# Travely Prototype Protocol

## 1. Product concept

Travely is a collaborative trip-planning app that makes organizing group travel feel as easy and fun as creating a Partiful event.

A host creates a trip, gives it personality, and shares an invite link. Friends can join without navigating a complicated planning tool. Once inside, everyone can propose activities, vote **Yes**, **Maybe**, or **No**, see who is joining, track costs, and coordinate around a shared itinerary.

The product should feel social first and logistical second.

### Core promise

> Create the trip, invite your friends, and figure out the plan together.

### Why people would use it

Existing travel planners often feel like spreadsheets, booking engines, or personal itinerary tools. Travely's distinction is the combination of:

- Partiful-style invitations and visual identity
- Lightweight group decision-making
- A shared, evolving itinerary
- Individual RSVPs for each activity
- Transparent costs and logistics
- Flight and calendar coordination
- Personalized trip and activity suggestions

## 2. Target users

### Primary user

A person aged roughly 18–35 organizing a trip with friends:

- Weekend trips
- Group vacations
- Bachelor or bachelorette trips
- Festivals and concerts
- Ski trips
- Spring break
- Destination birthdays
- Local day trips and staycations

### Main pain points

- Plans are scattered across group chats, spreadsheets, notes, and booking confirmations.
- Nobody knows which activities are actually confirmed.
- Friends have different budgets and schedules.
- Organizers repeatedly answer the same questions.
- Flight arrival and departure times are difficult to coordinate.
- Planning tools feel like work rather than part of the experience.

## 3. Product principles

1. **Social before administrative:** Every interaction should feel inviting, expressive, and lightweight.
2. **One trip, one source of truth:** The itinerary, guests, costs, locations, and decisions live together.
3. **Commitment can be gradual:** Users can respond Yes, Maybe, or No instead of being forced into an immediate decision.
4. **Useful before everyone downloads it:** Invite links should open directly into a useful mobile web experience.
5. **Structured without feeling rigid:** Travely provides organization while allowing the itinerary to evolve collaboratively.
6. **AI assists instead of taking over:** Suggestions should help the group decide, not silently change its plans.

## 4. Prototype objective

Demonstrate this loop convincingly:

1. A host creates a visually expressive trip.
2. The host shares an invitation.
3. Friends join the trip.
4. Members propose activities.
5. Everyone responds Yes, Maybe, or No.
6. The group understands the evolving itinerary, costs, and logistics.
7. Travely recommends an activity based on the group's preferences.

The prototype should look polished enough for user testing or an investor demo, but it does not need production authentication, payments, live travel integrations, or a real multi-user backend.

## 5. Zero-cost feasibility verification

### Conclusion

The complete prototype described in this document is feasible with **$0 in additional app, API, database, or hosting costs** when run locally. The existing Claude Code subscription is treated as already covered.

The prototype must use local mock data, client-side state, and `localStorage`. Calendar imports, flight searches, AI recommendations, maps, invitations, and payments are simulations—not live integrations.

### What can be implemented for free

| Capability | Prototype implementation | Cost |
|---|---|---:|
| Responsive web application | Next.js, React, TypeScript, and Tailwind CSS | $0 |
| UI components | shadcn/ui or custom components | $0 |
| Icons | Lucide | $0 |
| Motion | Motion with reduced-motion support | $0 |
| Dates and validation | date-fns and Zod | $0 |
| Demo data | Typed local seed files | $0 |
| State persistence | Browser `localStorage` | $0 |
| Trip creation | Client-side forms and state | $0 |
| RSVPs | Client-side interactions | $0 |
| Cost calculations | Client-side calculations | $0 |
| Flight coordination | Seeded flight data and simulated search | $0 |
| Calendar import | Simulated connect/import state | $0 |
| AI recommendations | Seeded recommendations and deterministic rules | $0 |
| Maps | Styled static placeholder—not a live map service | $0 |
| Images | Locally bundled, properly licensed assets or original placeholders | $0 |
| Local demo | `npm run dev` or a static production build | $0 |

### Important prototype limitations

- A copied invite link is demonstrative. It does not create a real shared session across devices.
- Changes are stored only in the current browser.
- Clearing browser storage resets user-created changes unless a reset mechanism reseeds the demo.
- The Google Calendar connection does not perform OAuth or read calendar data.
- Flight results are not live, bookable, or guaranteed prices.
- Recommendations are not generated by a paid AI service.
- Payment statuses are visual only; no money is moved.
- The map is not interactive and does not call Google Maps or another metered provider.
- A truly collaborative multi-device version would later need authentication, a database, authorization rules, and real-time or server-backed updates.

### Static-build constraints

To preserve a zero-cost deployment option, build the prototype so it can be statically exported:

- Use fixed routes such as `/`, `/create`, `/invite`, `/trip`, `/trip/itinerary`, `/trip/guests`, `/trip/costs`, and `/trip/travel`.
- Keep mutations client-side; do not use Server Actions for prototype data.
- Access `localStorage`, `window`, and `navigator` only inside client components and browser-safe lifecycle code.
- Use bundled local images instead of requiring an image-transformation service.
- Do not require cookies, server sessions, runtime API routes, or dynamic server rendering.
- Provide a clipboard fallback if the browser blocks `navigator.clipboard`.

Local execution is the guaranteed no-cost path. Optional public deployment should only be added after checking the host's current limits and commercial-use terms.

## 6. Core features

### A. Trip creation

The host enters:

- Trip name
- Destination
- Start and end dates
- Cover image or theme
- Short description
- Trip vibe
- Estimated budget
- Visibility and invite settings

Example:

> Chicago Birthday Weekend  
> March 14–16  
> Food, dancing, and recovering by the lake.

Suggested vibe tags:

- Foodie
- Nightlife
- Outdoors
- Relaxed
- Luxury
- Budget-friendly
- Adventure
- Culture

### B. Partiful-inspired invitation page

The invitation should include:

- Large visual cover
- Trip title and destination
- Date range
- Host information
- Short description
- Existing attendees and avatars
- Join Trip call to action
- Animated or playful visual details
- Shareable invite-link treatment

The page should feel like an exciting invitation—not a project-management dashboard. It may draw inspiration from Partiful's ease and energy, but must not copy its branding, assets, copy, or exact interface.

### C. Trip home

After joining, users see:

- Countdown to the trip
- Destination and dates
- Attendee avatars
- Upcoming activity
- Decisions that need their response
- Estimated personal cost
- Recent group activity
- Quick action to propose an activity

### D. Shared itinerary

Organize activities by day and time.

Each activity card includes:

- Name
- Image or category icon
- Date and start time
- Optional end time
- Address
- Map placeholder
- Estimated cost per person
- Booking status
- Description
- Creator
- Attendee count
- Yes, Maybe, and No controls

Support activities that do not yet have a final time by placing them in an **Ideas** section.

### E. Activity creation

Members can propose an activity with:

- Name
- Category
- Date
- Time or Time TBD
- Address
- Estimated cost
- Link
- Reservation deadline
- Capacity
- Notes
- Optional cover image

After submission, the activity appears in the itinerary and the group is prompted to respond.

### F. Activity-level RSVPs

Every member can select:

- Yes
- Maybe
- No

Show:

- Response totals
- Attendee avatars
- Who has not responded
- Capacity warnings
- Whether the activity has enough interest to book

Changing a response should update the interface immediately.

### G. Group members

Include a members page or panel showing:

- Avatar and name
- Organizer or member role
- Overall trip RSVP
- Arrival and departure information
- Number of confirmed activities
- Estimated personal cost

### H. Cost summary

Calculate costs from selected activities.

Show:

- Estimated total group cost
- User's estimated personal cost
- Cost by activity
- Confirmed versus tentative spending
- Paid, Not Paid, or Payment TBD visual states

Do not build real payment processing.

### I. Flight coordination concept

Create a convincing mocked flight-coordination screen.

For each traveler, show:

- Departure city
- Arrival flight
- Arrival time
- Departure flight
- Departure time
- Airline and flight number
- Import status

Include simulated actions:

- Connect Google Calendar
- Import flight confirmation
- Add flight manually
- Find coordinated flights

The Find Coordinated Flights experience should use mock flight options and explain why an option is recommended:

> Best match for the group: arrives within 35 minutes of Maya and costs $42 less than the next option.

Do not integrate a live airfare API in the prototype.

### J. AI-style trip suggestions

Add a **For Your Group** section containing mock personalized recommendations.

Each recommendation should explain itself using signals such as:

- Selected trip vibe
- Group budget
- Open itinerary windows
- Popularity among similar fictional groups
- Members' stated interests
- Previously accepted activities

Example:

> We think your group would like a sunset architecture cruise because five members selected Outdoors, Saturday evening is open, and it fits the $75 activity budget.

Users can:

- Add to ideas
- Propose to group
- Dismiss
- Save

For this prototype, use seeded suggestions and deterministic matching rules. Do not call an AI API or claim that a real model produced the results.

## 7. Screens

Build these primary screens:

1. Landing page
2. Create-trip flow
3. Public trip invitation
4. Join-trip flow
5. Trip home
6. Itinerary
7. Activity detail
8. Create or edit activity
9. Guests
10. Costs
11. Travel and flights
12. Recommendations
13. Lightweight profile and preferences
14. Share-trip modal

### Suggested navigation

On mobile:

- Home
- Itinerary
- Add
- Guests
- More

On desktop:

- Overview
- Itinerary
- Guests
- Costs
- Travel

Recommendations can appear within Overview and More.

## 8. User flows

### Host flow

1. Open the landing page.
2. Select Plan a Trip.
3. Enter basic trip information.
4. Pick a visual theme.
5. Add one or two starter activities.
6. Arrive at the trip page.
7. Open the share modal.
8. Copy the mock invite link.

### Guest flow

1. Open the invitation page.
2. View the invitation without an account.
3. Select Join the Trip.
4. Enter a name and choose an avatar.
5. Optionally provide a departure city and interests.
6. Enter the trip.
7. Respond to pending activities.

### Collaborative planning flow

1. A member selects Add Activity.
2. The member supplies activity details.
3. The activity appears under Ideas or the selected day.
4. Other simulated members already have seeded responses.
5. The current user responds.
6. The organizer can confirm or edit the activity.
7. A confirmed activity moves into the scheduled itinerary.

### Flight flow

1. A member opens Travel.
2. The member selects manual entry or a mocked import option.
3. The member adds flight details.
4. The group sees arrivals on a shared timeline.
5. Travely identifies overlapping arrivals or pickup opportunities from seeded data.

## 9. Visual direction

Travely should feel youthful, expressive, and premium without copying Partiful's exact design.

Use:

- Large editorial trip photography or locally bundled visual placeholders
- Bold typography
- Bright accent colors
- Rounded cards
- Sticker-like labels
- Layered avatars
- Subtle motion
- Friendly, conversational copy
- Strong mobile-first layouts

Avoid:

- Corporate travel-software aesthetics
- Dense tables
- Tiny text
- Excessive form fields
- Generic purple-gradient startup styling
- Looking like a calendar clone

### Suggested design system

- Background: warm off-white
- Primary text: near-black
- Accent: vivid coral, lime, sky blue, or electric orange
- Headings: expressive display typeface or a bundled open-license font
- Body: clean sans-serif
- Card radius: 20–28px
- Buttons: large pills or rounded rectangles
- Shadows: soft and minimal

Use motion for:

- Joining a trip
- Changing an RSVP
- Adding an activity
- Opening the invitation
- Celebrating full-group agreement

Respect reduced-motion settings.

## 10. Prototype data model

```ts
type User = {
  id: string;
  name: string;
  avatarUrl: string;
  homeAirport?: string;
  interests: string[];
  budgetPreference?: "budget" | "moderate" | "premium";
};

type Trip = {
  id: string;
  slug: string;
  title: string;
  destination: string;
  description: string;
  startDate: string;
  endDate: string;
  coverImageUrl: string;
  themeColor: string;
  vibeTags: string[];
  estimatedBudget?: number;
  hostId: string;
  memberIds: string[];
};

type Activity = {
  id: string;
  tripId: string;
  createdBy: string;
  title: string;
  description?: string;
  category: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  timeStatus: "scheduled" | "tbd";
  address?: string;
  imageUrl?: string;
  externalUrl?: string;
  estimatedCostPerPerson?: number;
  capacity?: number;
  reservationDeadline?: string;
  status: "idea" | "proposed" | "confirmed" | "cancelled";
};

type ActivityResponse = {
  activityId: string;
  userId: string;
  response: "yes" | "maybe" | "no";
  updatedAt: string;
};

type TripMembership = {
  tripId: string;
  userId: string;
  role: "host" | "member";
  tripResponse: "going" | "maybe" | "not_going";
};

type Flight = {
  id: string;
  tripId: string;
  userId: string;
  direction: "arrival" | "departure";
  departureAirport: string;
  arrivalAirport: string;
  departureTime: string;
  arrivalTime: string;
  airline: string;
  flightNumber: string;
  source: "manual" | "calendar" | "email" | "mock_search";
};

type Recommendation = {
  id: string;
  tripId: string;
  title: string;
  description: string;
  imageUrl?: string;
  estimatedCostPerPerson?: number;
  suggestedDate?: string;
  suggestedTime?: string;
  explanation: string;
  status: "new" | "saved" | "proposed" | "dismissed";
};
```

## 11. Prototype implementation approach

Recommended stack:

- Next.js with App Router
- TypeScript
- Tailwind CSS
- shadcn/ui as a component foundation
- Lucide icons
- Motion for restrained animation
- Local mock data and `localStorage` persistence
- date-fns for date formatting
- Zod for form validation

For the initial version:

- Use a predefined logged-in user.
- Simulate multiple trip members.
- Persist RSVP and activity changes in `localStorage`.
- Use seeded demo data.
- Use bundled local visual assets or original placeholders.
- Treat integrations as interactive demos.
- Do not require API keys.
- Do not build a backend.
- Add a Reset Demo control that restores the seed data.

## 12. Seeded demo trip

### Trip

**Chicago Birthday Weekend**

March 14–16, 2027  
Hosted by Maya  
Six invited friends

### Members

- Maya — host, New York
- Jordan — Los Angeles
- Priya — Boston
- Eli — Austin
- Sofia — Miami
- Noah — New York

### Activities

- Hotel check-in — confirmed
- Dinner at Aba — confirmed, $65
- Drinks in West Loop — proposed, $40
- Architecture boat tour — proposed, $52
- Beach picnic — idea, $20
- Birthday dinner — confirmed, $95
- Sunday brunch — time TBD, $35

Make RSVP states varied so users can understand the feature immediately.

## 13. Out of scope for this prototype

Do not implement:

- Live airline inventory
- Live flight purchasing
- Production Google Calendar OAuth
- Email inbox scanning
- Real payment processing
- Expense settlement
- Production authentication or account recovery
- Production notifications
- Real multi-user synchronization
- Machine-learning model training
- Paid AI API calls
- Live maps or geocoding
- Native mobile apps
- Full drag-and-drop itinerary editing

These can be represented with polished UI and simulated responses.

## 14. Success criteria

The prototype succeeds if a new tester can:

- Understand the product within 10 seconds.
- Create a trip without instructions.
- Join from the simulated invite page.
- Find the itinerary quickly.
- Propose an activity.
- Respond to activities individually.
- Understand expected personal costs.
- See when friends arrive.
- Understand how recommendations could reduce planning work.
- Describe Travely as more social and fun than a spreadsheet or group chat.

## 15. Ready-to-paste Claude Code implementation prompt

```text
You are building a polished, mobile-first prototype called Travely.

Travely is a collaborative group-travel planner inspired by the ease, energy, and social invitation experience of Partiful. Do not copy Partiful's branding, assets, copy, or exact interface. The central idea is to make planning a trip with friends feel expressive, fun, and effortless rather than administrative.

PRODUCT PROMISE

"Create the trip, invite your friends, and figure out the plan together."

A host creates a visually expressive trip and shares an invitation link. Friends join, propose activities, and respond Yes, Maybe, or No to each activity. The app organizes the evolving itinerary, costs, locations, guests, and travel details in one place.

OBJECTIVE

Build a high-fidelity responsive web prototype suitable for user testing and an investor demo. Prioritize a convincing product experience over production infrastructure.

The prototype must require $0 in app, API, database, or hosting spend when run locally. Do not add any service requiring an API key, credit card, paid account, metered API, or hosted backend. Claude Code access is already covered by the user.

First inspect the existing repository, package configuration, and coding conventions. Preserve the working project structure where sensible. If no application exists, create one using Next.js, TypeScript, Tailwind CSS, and the App Router.

ZERO-COST ARCHITECTURE

- Keep all demo data in typed local files.
- Persist user changes in browser localStorage.
- Use a predefined current user and seeded simulated group members.
- Do not build a backend, authentication service, database, or server mutations.
- Do not use external AI, flight, calendar, payment, map, image-transformation, email, or notification APIs.
- Build calendar, flight, AI, payment, and invitation integrations as clearly simulated interactions.
- Use fixed routes compatible with a static export.
- Access localStorage and other browser APIs only from client components and browser-safe lifecycle code.
- Bundle visual assets locally. Do not rely on paid image sources or remote image optimization.
- Add a Reset Demo action that clears prototype changes and restores seed data.
- The production build should support Next.js output: "export" if compatible with the repository.

CORE EXPERIENCE

Implement:

1. A polished landing page.
2. A multi-step create-trip flow.
3. A public, Partiful-inspired trip invitation page.
4. A lightweight join flow.
5. A trip overview with a countdown, attendee avatars, pending decisions, upcoming activity, estimated cost, and recent activity.
6. A day-by-day shared itinerary.
7. An Ideas section for activities without confirmed times.
8. Activity creation and editing.
9. Activity details with Yes, Maybe, and No responses.
10. Guest information and trip roles.
11. Per-person cost estimates.
12. A mocked flight-coordination screen.
13. Explainable AI-style activity recommendations using seeded data and deterministic rules.
14. A share-trip modal with a mock invite link.

DESIGN

The interface should feel youthful, expressive, editorial, and premium.

Use:
- Large travel imagery or locally bundled visual placeholders
- Bold typography
- Warm off-white backgrounds
- Near-black text
- Bright accent colors
- Large rounded cards
- Sticker-like tags
- Layered avatars
- Conversational microcopy
- Subtle animations
- Excellent mobile layouts

Avoid:
- Corporate travel-software styling
- Dense tables
- Generic dashboard layouts
- Excessive gradients
- Tiny controls
- An interface that looks like a calendar clone
- Copying Partiful's protected design, branding, text, or assets

The invitation should feel exciting and emotionally engaging. The trip workspace should remain playful but become more organized after joining.

NAVIGATION

Mobile:
- Home
- Itinerary
- Add
- Guests
- More

Desktop:
- Overview
- Itinerary
- Guests
- Costs
- Travel

Use fixed routes such as:
- /
- /create
- /invite
- /trip
- /trip/itinerary
- /trip/guests
- /trip/costs
- /trip/travel
- /trip/recommendations

DEMO DATA

Seed the app with this trip:

Chicago Birthday Weekend
March 14–16, 2027
Hosted by Maya
Description: "Food, dancing, and recovering by the lake."

Members:
- Maya — host, New York
- Jordan — Los Angeles
- Priya — Boston
- Eli — Austin
- Sofia — Miami
- Noah — New York

Activities:
- Hotel check-in — confirmed
- Dinner at Aba — confirmed, $65
- Drinks in West Loop — proposed, $40
- Architecture boat tour — proposed, $52
- Beach picnic — idea, $20
- Birthday dinner — confirmed, $95
- Sunday brunch — time TBD, $35

Give members varied Yes, Maybe, and No responses.

ACTIVITY BEHAVIOR

Each activity supports:
- Title
- Category
- Date
- Start and optional end time
- Time TBD
- Address
- Description
- External link
- Cost per person
- Capacity
- Reservation deadline
- Creator
- Status: idea, proposed, confirmed, or cancelled
- Yes, Maybe, and No responses

RSVP changes must update counts, avatars, attendance, and personal cost totals immediately.

FLIGHT COORDINATION

Create a mocked but interactive Travel screen.

Show each member's:
- Origin
- Arrival flight and time
- Departure flight and time
- Airline
- Flight number
- Import state

Include simulated actions:
- Connect Google Calendar
- Import confirmation
- Add manually
- Find coordinated flights

Use mock search results. Provide clear recommendation explanations, such as:
"Best match for the group: arrives within 35 minutes of Maya and costs $42 less than the next option."

Label flight prices and results as demo data. Do not use real flight or calendar APIs.

RECOMMENDATIONS

Create a For Your Group area with personalized-looking recommendations.

Each suggestion should explain why it was selected using:
- Trip vibe
- Member interests
- Budget
- An open itinerary window
- Seeded similar-group behavior
- Previously accepted activities

Actions:
- Add to ideas
- Propose to group
- Save
- Dismiss

Do not call an actual AI service. Use realistic seeded recommendation data and deterministic matching rules. Do not claim that a real AI model generated a result.

TECHNICAL EXPECTATIONS

Prefer:
- Next.js App Router
- TypeScript in strict mode
- Tailwind CSS
- Existing component library if the repository already has one
- shadcn/ui where useful
- Lucide icons
- Motion
- date-fns
- Zod

Build reusable components, including:
- TripCover
- AvatarStack
- ActivityCard
- RSVPControl
- DaySection
- CostSummary
- FlightTimeline
- RecommendationCard
- InviteModal
- BottomNavigation
- EmptyState
- StatusBadge

ACCESSIBILITY AND QUALITY

- Use semantic HTML.
- Support keyboard navigation.
- Include visible focus styles.
- Use sufficient contrast.
- Label icon-only controls.
- Respect reduced-motion preferences.
- Provide useful empty states.
- Make all primary flows usable at 390px mobile width.
- Avoid horizontal overflow.
- Keep TypeScript strict.
- Do not leave broken buttons or obvious placeholders.
- Provide feedback for all simulated actions.
- Ensure the demo remains usable after a page refresh.

IMPLEMENTATION ORDER

1. Inspect the repository.
2. Establish the theme and shared layout.
3. Add typed demo data and state management.
4. Build the invitation and join experience.
5. Build the trip overview and navigation.
6. Build the itinerary and activity RSVP interactions.
7. Build activity creation and editing.
8. Add costs and guests.
9. Add mocked travel coordination.
10. Add deterministic recommendations.
11. Add localStorage persistence and Reset Demo.
12. Verify static-export compatibility.
13. Test responsive layouts and major interactions.
14. Run lint, type checking, and available tests.
15. Fix all errors before stopping.

ACCEPTANCE CRITERIA

A tester must be able to:
- View an exciting trip invitation.
- Join the simulated trip.
- Browse the trip by day.
- Respond Yes, Maybe, or No to an activity.
- See RSVP counts change immediately.
- Propose a new activity.
- See personal cost estimates update.
- View everyone's arrival information.
- Explore mocked coordinated-flight suggestions.
- Add a recommendation to the trip.
- Copy a mock invite link.
- Refresh the page without losing local changes.
- Reset the demo to its original state.

Before stopping, verify:
- No feature requires an API key.
- No feature requires a paid or metered service.
- No real user data is sent anywhere.
- The app builds successfully.
- Lint and type checks pass.
- The primary flows work at mobile and desktop sizes.

When finished, report:
- What you built
- Main routes
- Important interaction details
- Tests and checks run
- All intentionally mocked functionality
- Whether static export succeeded
- Any future feature that would require a backend or paid service

Start by inspecting the repository. Then implement the complete prototype rather than stopping after a plan.
```

## 16. Future production phases

These are deliberately excluded from the zero-cost prototype and should only be considered after the core social-planning loop is validated.

### Phase 2: Real collaboration

- Authentication
- Persistent database
- Real invitation links
- Roles and authorization
- Multi-device synchronization
- Notifications

### Phase 3: Travel integrations

- Calendar OAuth and event imports
- Email or booking-confirmation parsing
- Flight-status provider
- Flight shopping or affiliate integration
- Maps, search, and geocoding

### Phase 4: Financial coordination

- Deposits
- Shared expenses
- Payment collection
- Refund and cancellation states

### Phase 5: Real personalization

- Consent-based preference history
- Recommendation service
- Privacy and retention controls
- Explanation and feedback mechanisms
- Measurement of recommendation quality

## Final scope decision

The activity RSVP loop and social invitation should be exceptional. Flights, calendars, maps, payments, and AI should be polished simulations. This produces a compelling, feasible prototype without adding infrastructure risk or incremental service costs before the central product behavior has been validated.
