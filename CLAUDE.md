### Project: DevTracker

- **Goal:** Job application tracker (CRUD), built fast as a learning project + daily-use tool + portfolio piece. Exception to the "write code myself" rule — Claude Code generated full files here.
- **Stack:** React + Vite, Bootstrap (CSS only, no Bootstrap JS — interactivity handled in pure React for consistency with React's state model), Flask, SQLAlchemy, PostgreSQL, JWT.
- **Status:** MVP complete and merged to main. README pending/in progress.
- **Key decisions made:** status_history pattern (event log, not flat status fields) for tracking application stages over time; constants.py to avoid circular imports between models; salary stored as String (real-world salary listings aren't clean numbers); Bootstrap CSS + pure React JS for interactivity (DOM mutation from Bootstrap JS clashes with React's virtual DOM model).
- **What's next:** Build a one-page project summary (data model + key technical decisions + how to explain it in an interview).
