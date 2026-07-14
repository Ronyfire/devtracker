# DevTracker — Project Summary

## What it is
A job application tracker (CRUD) built to learn the full React + Flask flow end-to-end and to actually manage a real job search. Doubles as a portfolio piece for interviews.

## Stack
- **Front-end:** React + Vite, Bootstrap (CSS utilities only — no Bootstrap JS)
- **Back-end:** Flask, Flask-Blueprints, Flask-JWT-Extended
- **ORM/DB:** SQLAlchemy + PostgreSQL
- **Auth:** JWT (bcrypt password hashing)
- **Package manager:** Pipenv

## Data model
- **User** `1 — N` **Application** `1 — N` **StatusHistory**
- `User`: email + bcrypt password hash. Cascade-deletes its applications.
- `Application`: company, role_title, job_url, source, salary (String), location_type, posted_date, next_action_date, notes, `current_status` (denormalized).
- `StatusHistory`: append-only log of every status change (`status`, `changed_at`, optional `notes`) tied to an application.

**Why an event log instead of a flat status field:** a single `current_status` column can only answer "what stage is this in right now." An event log answers "how long did each stage take" and "when did it change" — the exact data a dashboard or a "time in each stage" chart would need later, and it costs one extra table now vs. a migration + backfill later. `current_status` is still kept on `Application` as a denormalized read-optimization so list views don't need a join; every write to it goes through the same code path that also appends a `StatusHistory` row (`add_status` in `applications.py:147-169`), so the two never drift apart.

**Why `salary` is a String, not a number:** real job listings write salary as ranges, mixed currencies, or "DOE" — there's no clean numeric to normalize to without lossy parsing. Storing it as free text avoids inventing a schema for data that isn't structured at the source.

**Why `constants.py` exists:** `STATUSES`, `SOURCES`, `LOCATION_TYPES` are shared enums referenced by both `Application` and `StatusHistory` models. Importing one model from the other to reach a constant would create a circular import; a shared module doesn't.

## API endpoints
| Method | Path | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create user, return JWT |
| POST | `/api/auth/login` | Verify credentials, return JWT |
| PUT | `/api/auth/profile` | Update email and/or password (re-verifies current password) |
| GET | `/api/applications/` | List current user's applications, optional `?status=` filter |
| POST | `/api/applications/` | Create application (auto-seeds first `StatusHistory` row) |
| GET | `/api/applications/<id>` | Get one application |
| PUT | `/api/applications/<id>` | Partial update |
| DELETE | `/api/applications/<id>` | Delete (cascades its history) |
| POST | `/api/applications/<id>/status` | Append a status change + sync `current_status` |
| GET | `/api/applications/<id>/history` | Full status timeline for one application |

All application routes scope queries by `user_id` from the JWT — one user can never read or mutate another's data.

## Technical decisions and their trade-offs
| Decision | Alternative considered | Why this won |
|---|---|---|
| Status as event log (`StatusHistory` table) | Flat `status` column only | Needed timeline/history data; flat field can't answer "when did it change" |
| `current_status` kept denormalized on `Application` | Compute from latest `StatusHistory` row on every read | Avoids a join/subquery on every list view; consistency enforced by routing all writes through one endpoint |
| `salary` as String | Numeric column (`Integer`/`Range`) | Source data (job postings) isn't clean numbers; parsing would be lossy and fragile |
| Bootstrap CSS only, no Bootstrap JS | Full Bootstrap (incl. JS components) | Bootstrap JS mutates the DOM directly, which fights React's virtual DOM — kept all interactivity in React state |
| `constants.py` for shared enums | Define `STATUSES` inside the `Application` model and import it into `StatusHistory` | Cross-model import would create a circular import |

## How to explain it in 60 seconds
"DevTracker is a job application tracker I built with a React front-end and a Flask/PostgreSQL back-end, secured with JWT auth. The interesting design decision is how I track status: instead of a single status column that only tells you where an application is *right now*, I log every status change as its own row in a `status_history` table, timestamped. That gives me a real timeline per application — when it moved from Applied to Interview, how long it sat there — while I still keep a denormalized `current_status` field on the application itself so list views don't need a join. Every status update goes through one endpoint that writes both, so they can't drift apart. It's a small CRUD app, but it's built the way a production app would track state changes over time, not just current state."

## Typical interview questions + short answers
**Q: Why not just have a `status` column and update it in place?**
A: Because then you lose history — you can't answer "how long was this in Screening" or show a timeline. The event log costs one extra table but gives you an audit trail for free.

**Q: Doesn't storing `current_status` in two places (denormalized + derivable from history) risk inconsistency?**
A: Yes, that's the trade-off of denormalization — I mitigate it by having exactly one code path (`add_status`) write to both the `Application.current_status` field and the `StatusHistory` table, so there's no way to update one without the other.

**Q: Why is salary a string instead of a number?**
A: Real salary listings aren't clean numbers — ranges, "DOE", different currencies. Forcing them into an Integer column would mean lossy parsing at write time for no real query benefit at this scale.

**Q: Why avoid Bootstrap's JavaScript?**
A: Bootstrap JS toggles classes and inline styles directly on the DOM (e.g. for modals, dropdowns). React expects to own the DOM via its virtual DOM diffing — the two fighting over the same nodes causes state to get out of sync. Using Bootstrap only for CSS and handling all show/hide logic in React state avoids that.

**Q: How do you scope data per user?**
A: Every application route filters by `user_id` pulled from the JWT identity, not from the request body/params — so a user can never fetch or mutate another user's applications by guessing an ID.

---
*Drift check: nothing in `CLAUDE.md`'s "Key decisions" was left unreflected in code — status_history, constants.py, salary-as-String, and the Bootstrap CSS-only decision all match what's actually implemented.*
