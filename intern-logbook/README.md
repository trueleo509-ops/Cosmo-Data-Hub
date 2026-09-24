# 📒 Intern Logbook

An attendance logbook for a supervisor and two interns. It records **date, time in, time out, signature and hours worked**, and adds up each intern's hours for the week against a **20-hour** target. There are two versions; use whichever suits you.

## Option 1: Excel workbook (`Intern_Logbook.xlsx`)

| Tab | What it's for |
|---|---|
| **Setup** | Enter the supervisor's name, the weekly target (20), the first week of the internship and the two interns' names (yellow cells). |
| **Logbook** | One row per day: **Date, Intern** (drop-down), **Time In, Time Out, Signature** (type your full name). **Hours Worked**, **Week Of**, **Week-to-Date Hours** and **Remaining to Target** fill in by themselves. |
| **Weekly Summary** | Each intern's hours for every week (Mon–Sun), with the hours left and a status: ✓ Target met / In progress / Short by X hrs. |

Built-in checks: if Time Out isn't after Time In, the Hours cell shows **Check times** and the row isn't counted. A dated row with no signature turns orange. When a week reaches the target it turns green.

## Option 2: Web app (`index.html`)

Open `index.html` in any browser. You don't need to install anything.
- **Log attendance:** pick the intern, enter the date and times, have them **draw their signature** with a mouse or finger, and save. Hours are calculated for you.
- **Weekly hours:** a progress bar for each intern shows the hours logged this week (Monday–Sunday) and how many are left to reach 20. You can change the target in Settings.
- **Week navigation:** move back and forth between weeks to review past attendance.
- **Export and print:** export every entry to a CSV file that opens in Excel, or print the current week.
- **Backup and restore:** entries are saved in this browser on this device. Download a JSON backup regularly, or restore one on another computer.

First time: open **⚙️ Settings** and enter the supervisor's name and the interns' names.
