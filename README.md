# DevTracker

A full-stack job application tracker built for daily use during a job search. Create and manage applications, move them through a hiring pipeline, and keep a full history of every status change.

![DevTracker dashboard](docs/screenshot.png)

---

## Features

- **CRUD** — add, edit, and delete job applications (company, role, URL, source, location, salary, dates, notes)
- **Status pipeline** — move applications through Applied → Screening → Technical Interview → Final Interview → Offer / Rejected, with optional notes per transition
- **Full status history** — every change is logged with a timestamp; the detail page shows the complete timeline
- **Search & filter** — instant client-side search by company or role; filter by status; sort by 5 criteria
- **Export to CSV** — export visible (filtered) applications to a CSV file compatible with Excel
- **Profile page** — change email address or password from inside the app
- **Responsive** — table layout on desktop, card layout on mobile

---

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | React 19, React Router v7, Vite 8 |
| Styling | Bootstrap 5 (CSS only), Bootstrap Icons |
| HTTP client | Axios |
| Backend | Flask 3, Flask-SQLAlchemy, Flask-Migrate (Alembic) |
| Auth | Flask-JWT-Extended, bcrypt |
| Database | PostgreSQL |
| Package manager (backend) | Pipenv |

---

## Project structure

```
devtracker/
├── backend/
│   ├── app/
│   │   ├── __init__.py          # app factory
│   │   ├── config.py
│   │   ├── constants.py         # shared enum values (STATUSES, SOURCES…)
│   │   ├── extensions.py        # db, migrate, jwt instances
│   │   ├── models/
│   │   │   ├── user.py
│   │   │   ├── application.py
│   │   │   └── status_history.py
│   │   ├── routes/
│   │   │   ├── auth.py          # /api/auth/register, login, profile
│   │   │   └── applications.py  # /api/applications/ + status history
│   │   └── utils/
│   ├── migrations/
│   └── Pipfile
└── frontend/
    ├── src/
    │   ├── components/          # Navbar, ApplicationModal, StatusModal…
    │   ├── context/             # AuthContext (token + user state)
    │   ├── hooks/               # useFocusTrap
    │   ├── pages/               # DashboardPage, ApplicationDetailPage, ProfilePage…
    │   ├── services/            # axios wrappers (api.js, applications.js)
    │   └── styles/              # custom.css, Dashboard.css, ApplicationDetail.css
    └── package.json
```

---

## Local setup

### Prerequisites

- Python 3.11+ and `pip install pipenv`
- Node.js 18+ and npm
- PostgreSQL running locally

### 1 — Backend

```bash
cd backend

# Install dependencies
pipenv install

# Create environment file
cp .env.example .env   # then fill in the values below

# Run database migrations
pipenv run flask db upgrade

# Start the development server (port 5000)
pipenv run flask run
```

> **Windows note:** if `pipenv run` fails with a path error, use the virtualenv directly:
> `.venv\Scripts\python.exe -m flask run`

### 2 — Frontend

```bash
cd frontend

npm install

# Optional: create .env if the API runs on a different port
echo "VITE_API_URL=http://localhost:5000" > .env

# Start the dev server (port 5173)
npm run dev
```

---

## Environment variables

### `backend/.env`

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | yes | PostgreSQL connection string, e.g. `postgresql://user:pass@localhost/devtracker` |
| `SECRET_KEY` | yes | Flask session secret — use a long random string in production |
| `JWT_SECRET_KEY` | yes | JWT signing secret — use a long random string in production |

### `frontend/.env`

| Variable | Required | Description |
|---|---|---|
| `VITE_API_URL` | no | Base URL of the Flask API. Defaults to `http://localhost:5000` |

---

## Technical notes

**Status history as a separate table**
Every status change is stored as a row in `status_history` (status, timestamp, optional notes), rather than overwriting the current status. `Application.current_status` is a denormalized field kept in sync for fast filtering. This gives a full audit trail at zero query cost on the list view.

**Bootstrap CSS + React for interactivity**
Bootstrap JS relies on direct DOM manipulation that conflicts with React's rendering model. The project uses Bootstrap's utility classes and components purely for styling, while all interactive behaviour (modals, dropdowns, state changes) is handled by React state. This avoids hydration bugs and keeps the component model clean.

**Flask app factory pattern**
`create_app()` in `app/__init__.py` wires up extensions and registers blueprints, making it straightforward to run the same code under different configs (development, testing, production).

**Client-side filtering and sorting**
All search, filter, and sort logic runs in the browser via a `useMemo` in `DashboardPage`. The API exposes a single `GET /api/applications/` endpoint and the UI derives every view from that response, keeping the API surface small and avoiding additional round-trips.
