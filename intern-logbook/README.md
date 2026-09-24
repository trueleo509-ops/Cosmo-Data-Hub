# 📒 Intern Logbook

A lightweight attendance logbook for **one supervisor and two interns**. Tracks each day's
**date, time in, time out, signature and hours worked**, and totals every intern's hours for the
week against a **20-hour weekly target** (configurable).

Single-page web app, no dependencies, no server — just open `index.html` in a browser.

## How it works

1. **First run (supervisor):** enter the supervisor's name and PIN, both interns' names, and
   the weekly hour target (defaults to 20).
2. **Intern first login:** the intern picks their name, creates a PIN and **draws their
   signature** on the signature pad (mouse, finger or stylus). The signature is saved and
   stamped on every entry they sign from then on.
3. **Daily attendance (intern):** tap **Time in** on arrival and **Time out** when leaving.
   The entry is automatically signed with the intern's saved signature and the hours are
   computed. A progress bar shows hours this week vs. the 20-hour target.
4. **Supervisor view:**
   - Weekly summary for both interns — hours worked vs. target, days attended, unsigned entries.
   - Full attendance table (date, intern, time in, time out, hours, signature, note) with
     week-by-week navigation.
   - Add, edit or delete entries (e.g. a forgotten time-out). Supervisor-created or edited
     entries become **Unsigned** until the intern signs them from their own login.
   - Export everything to CSV, or print the current week.
   - Settings: change the weekly target, reset an intern's PIN & signature, or erase all data.

Weeks run **Monday–Sunday**.

## Data storage

Everything is stored in the browser's `localStorage` on the device where it's used, so run the
logbook on **one shared device** (e.g. the office computer or the supervisor's tablet). Clearing
browser data erases the logbook — use **Export CSV** regularly as a backup.

PINs keep the three users from logging in as each other on the shared device; they are not
meant as strong security.
