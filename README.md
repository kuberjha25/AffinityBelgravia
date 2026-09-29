# Affinity Belgravia — React Native (Expo)

A channel-partner app for the Affinity Belgravia residential project, built from the
Figma file **Affinity New** (`H3vwojcWTcXMIgmPhhnQe6`). Every screen on the
`02 Screens` page is implemented, the design tokens come from `00 Foundations`,
and the shared components mirror `01 Components`.

There is no backend. All content lives in `src/data.js`; anything the user
creates or edits during a session is held in `src/store.js`, so every flow
completes end to end.

## Running it

```bash
npm install
npx expo start          # then press i / a, or scan the QR with Expo Go
```

Other targets:

```bash
npx expo start --android
npx expo start --ios
npx expo start --web
```

Requires Node 20+. The project is on **Expo SDK 54 / React Native 0.81** with the
new architecture enabled.

## Where things are

```
assets/
  fonts/        Electrolux Sans (Thin, Light, Regular, Semibold, Bold, Italic)
  images/       photography, avatars and the brand monogram exported from Figma
  icon.png, adaptive-icon.png, splash-icon.png   generated from the monogram

src/
  theme.js      colours, type ramp, spacing, radii, shadows — 1:1 with Figma variables
  data.js       all dummy content (user, leads, visits, projects, inventory, news, …)
  store.js      in-memory app state; stands in for the API
  components/
    icons.js        59 icons exported from Figma as path data
    iconPatches.js  restores two icons Figma's SVG export flattened
    Icon.js         renders an icon at any size/tint
    ui.js           the component library (buttons, fields, chips, cards, sheets, …)
    DateField.js    self-contained calendar picker
    Screen.js       app bar + page title + screen shell
    fill.js         absolute-fill style for background images
  navigation/
    RootNavigator.js   native stack, including deep links
    TabNavigator.js    the Figma "Navigation / Tab Bar"
  screens/           one file per Figma frame
```

## Screens

| Screen file | Figma frame |
| --- | --- |
| `SplashScreen` | `splash-light` (12:2) |
| `LoginScreen` | `login-register` (12:25) |
| `OtpScreen` | `otp-verification` (12:73) |
| `CompleteProfileScreen` | `complete-profile` (12:126) |
| `ProfileStepTwoScreen` | `profile-step-two-new` (12:223) |
| `ChannelPartnerDetailsScreen` | `channel-partner-details` (12:292) |
| `ThankYouScreen` | `thank-you-screen` (12:416) |
| `HomeScreen` | `home-screen` (12:450) and `User-home-screen` (12:3170) |
| `RegistrationsScreen` | registrations list (12:549) |
| `RegistrationDetailScreen` | `user-detail-screen` (12:698) |
| `SiteVisitsScreen` | `site-visits-screen` (12:859) |
| `VisitDetailScreen` | `visit-detail-screen` (12:1020) |
| `ScheduleVisitScreen` | `schedule-visit-screen` (12:1176) |
| `MISReportScreen` | `mis-report-screen` (12:1308) |
| `ProjectDetailScreen` | `project-detail-screen` (12:1440) |
| `InventoryScreen` | `inventory-list-screen` (12:1584) + accordion (12:1681) |
| `DocumentsScreen` | documents list (12:1797) |
| `LeadsScreen` | `leads-list-screen` (12:1965) |
| `LeadDetailScreen` | `lead-detail-screen` (12:2135) + `lead-update-popup` (12:2415) |
| `NewLeadScreen` | new-lead form (12:2293) |
| `NewsScreen` | `news-screen` (12:2616) |
| `NewsDetailScreen` | `news-detail-screen` (12:2736) |
| `MyProfileScreen` | `my-profile` (12:2796) |
| `NotificationsScreen` | `meraqui-notifications-screen` (12:2972) |
| `TermsScreen` | `meraqui-terms-conditions` (12:3095) |
| `AboutScreen` | `about-screen` (12:3233) |

The Figma shows the inventory list and its expanded accordion as two frames of the
same screen; they are one screen here, with the row expanding in place. Home and
User-home differ only in their Quick Access tiles, so one screen serves both —
`user-home` renders the second variant.

## What actually works

- Phone → OTP → three-step profile wizard → submitted. What you type in the wizard
  becomes the signed-in profile, so the dashboard greets you by name.
- Leads: search, status filters with live counts, detail view, the Update Lead
  dialog (type, status, follow-up date, note) which writes into the lead's history,
  and a New Lead form that adds to the list.
- Visits: filters, detail view, "End Current Visit", and a Schedule Visit form that
  creates a new visit.
- Inventory: tower filter and expanding unit rows.
- Notifications: unread dots, the app-bar badge count, mark all as read.
- Profile: inline editing that persists for the session.
- Deep links — `affinitybelgravia://leads/l1`, `/inventory`, `/about`, and so on
  (the full map is in `App.js`).

State lives in memory only, so it resets when the app reloads. Wiring it to a real
API means replacing the bodies of the mutators in `src/store.js`; the screens
themselves would not change.

## Assets

Icons were exported from Figma as SVG, de-duplicated by content, and compiled into
`src/components/icons.js` as path data so they can be tinted and scaled — the
geometry is Figma's, nothing is redrawn. Two icons (`target` and `eye`) lost their
inner rings in Figma's SVG export; `iconPatches.js` restores them to match the
rendered design.

Photography and the monogram were exported from Figma, resized, and re-encoded as
JPEG (the monogram stays PNG for its transparency). Total image weight is about 2 MB.

## Two things worth flagging

- **"Meraqui" in the copy.** The Terms & Conditions body and two notification
  messages name *Meraqui* and *Gillco Group* rather than Affinity Belgravia — this
  is in the Figma text as-is, so it has been transcribed verbatim rather than
  silently rewritten. The strings are in `terms` and `notifications` in `data.js`.
- **Wizard step numbers.** The first two Figma wizard frames both read "Step 2 of 3".
  The app numbers them 1, 2, 3.

## Fonts

Electrolux Sans replaces the Inter placeholder the Figma file notes ("ElectroluxSans
was unavailable, so all text styles use Inter temporarily"). Weights map as:
Light 300, Regular 400, Semibold 600, Bold 700 — see `fonts` and `type` in
`src/theme.js`.
