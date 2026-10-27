# Unified Login — Flow Handoff

The third login approach for the app, designed screen by screen in Figma and built to match.
One constant runs through every screen: a soft dotted background that stays put while the content
changes around it. Everything below describes what a user experiences, in the order they experience it.

## The idea in one paragraph

A community member opens the app and proves which community they belong to with an access code.
From there the flow splits three ways: returning members sign in, new members create an account
through a short guided signup, and locked-out members reset their password without ever leaving
the flow. Each path is a short sequence of calm, single-purpose screens with one primary action
each — and plain-language error messages inline under the field whenever something needs fixing.

## First — the splash: from QuestionPro to Communities

Before any screen appears, the app plays a short brand handover (~3 seconds, `AnimatedSplashOverlay`).
It opens on the QuestionPro wordmark — the company behind the product — holds a beat, then the
wordmark slides behind its own question mark while the mark blooms outward and the Communities
logo grows out of its center. The overlay fades, and the login flow is underneath, ready to use.

The intent is twofold: it hands the user's trust from the maker brand to the product brand
("Powered by QuestionPro" echoes later in every screen footer), and it turns unavoidable
loading time — fonts, session check — into a moment of delight instead of a blank wait. Nothing
is tappable and nothing can be skipped; it always resolves into the access-code screen (or straight
into the app for signed-in users).

## Journey A — returning member: from access code to inside the app

The user lands on a welcome screen asking for their community's access code, over an illustration
and the dotted background. They type the code and continue. A wrong code doesn't scold — the field
outlines in deep red with "Invalid access code. Try again" right beneath it, and typing clears it.

A correct code glides them forward into the community's login screen (the header takes the
community's name — Petverse in the current demo). Email, password with a show/hide toggle, a
"Forgot password?" escape hatch, and a Log in button. Below, a divider and four sign-in options
(Google, Apple, Facebook, LinkedIn) stretching across the full width. Correct credentials take the
user straight inside the app.

## Journey B — new member: a guided signup in small steps

From the login screen, "Create account" opens signup. It starts with just an email address and a
"Sign up with email" button (plus the same full-width sign-in options for anyone who'd rather
use an existing account, and a "Sign in" way back for existing members).

A valid email moves to email verification, the first of a five-step progress trail shown as small
segments at the top. The screen echoes back where the code was sent, offers six roomy code boxes
that advance as you type (pasting works, backspace steps back), a Verify button, and a
"Send a new code" fallback. A close button is always present — leaving signup returns to login,
never to a dead end.

Then the flow collects the account piece by piece, the progress segments filling as it goes:

- **Step 2 — password.** A new password with a live checklist (8+ characters, upper and lower case,
  a number, a special character). Each rule flips from a grey bullet to a green check the moment
  it's satisfied, and Continue only enables when all four pass.
- **Step 3 — profile.** First name, last name, and the username they'll appear as in the community,
  each validated gently on submit.
- **Step 4 — details.** Birth year and ZIP code, with a "Why?" link explaining the ask. Birth year
  is a native scrolling year picker (no fiddly typing); ZIP is typed. A Skip option sits under
  Continue for anyone who'd rather do this later.

Step 5 doesn't exist yet — the flow currently rests here after Continue or Skip.

## Journey C — locked out: back in without leaving the flow

"Forgot password?" opens a reset request: email or username (either works — no format lecture),
then "Send reset link". That leads to the same six-box code entry, this time for the reset code,
with resend available. A correct code opens the new-password screen: same live checklist as
signup, a Reset button gated on all four rules, and on success the user returns to login greeted
by "Password updated. Sign in with your new password." — the loop closed in one place.

## How the flow feels

- **Motion has meaning.** Pushing deeper (access code into the community) slides; switching
  sideways (login ⇄ signup, everything inside forgot and signup) crossfades. One consistent
  language, so movement always tells the user where they are.
- **The keyboard is polite.** It only ever opens when the user taps a field, and it gets out of
  the way — closed during every screen change — so buttons and options are never hidden behind it.
- **Errors stay where the mistake is.** Every error appears as a short red line directly under its
  field, with the field itself outlined red. Nothing pops up, nothing scolds, and typing clears it.

## Decisions made along the way

- **Full-width sign-in buttons everywhere.** One Figma frame showed small centered squares; review
  chose the full-width bar from the login screen for all of them, so the pattern never changes shape.
- **Solid icon tiles.** The back/close tiles were drawn translucent, which let the drifting dots show
  through and looked broken — they're now solid light grey, identical on white.
- **A real year picker, not a text field.** Typing a birth year is error-prone; the native scrolling
  wheel can't produce an invalid year, so an entire error case disappeared.
- **No autofocus, ever.** Fields wait in their resting state until tapped — after an earlier build
  was caught focusing the email field (and its keyboard) before the user had touched anything.
- **Labels unified.** Mixed line-heights across frames were settled to one treatment app-wide.
- **Fira Sans throughout**, including the background SVG handoff assets (one browser build, one
  Figma-safe build with the fade baked into individual dots, since Figma can't import pattern
  fills or masks).

## What's stubbed and what's next

- **Sign-in options** (Google, Apple, Facebook, LinkedIn) are present and tappable but do nothing yet.
- **Signup step 5+** has no design — details rests after Continue/Skip.
- **Password visibility** currently uses a text Show/Hide toggle; proper eye icons land together across
  login, reset, and signup-password once picked from the icon library.
- **Demo access:** the access code is `A123Z`, verification codes are `123456`, and all network calls
  are short simulated delays — every one marked for replacement with real APIs.
- **"Why?" link** has no destination yet (placeholder pressable).

## Technical footnote

- Route `/login-unified` (`src/app/login-unified.tsx`, one file, ten steps:
  access-code, credentials, signup, forgot, forgot-verify, reset-password, signup-verify,
  signup-password, signup-profile, signup-details). Registered in `src/app/_layout.tsx`, listed in
  `src/app/login-menu.tsx` next to Classic and Sheets (both untouched).
- Test codes: access `A123Z` · verification `123456` · passwords need 4/4 rules · username 3+ chars ·
  birth year 1900–now · ZIP `12345` or `12345-6789`.
- Background exports: `assets/handoff/dots-background-375x812.svg` (browser) and
  `assets/handoff/dots-background-375x812-figma.svg` (Figma-safe).
- New dependency this flow introduced: `@react-native-picker/picker@2.11.4`.
