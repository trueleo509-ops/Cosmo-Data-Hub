# 📒 Intern Logbook

A one-page attendance logbook for a supervisor tracking two interns. Open `index.html` in any browser. You don't need to install anything or set up a server.

## Features
- **SharePoint calendars.** Each intern's card has a button that opens their SharePoint calendar. You can also try showing it inside the page, but that only works if your SharePoint site allows it.
- **Daily attendance sheet.** Columns: date, intern, time in, time out, signature (drawn with a mouse or finger) and hours worked. Hours are calculated for you.
- **Weekly hours.** Hours add up per intern for each Monday–Sunday week, compared with a **20-hour** target that you can change. A progress bar shows the hours left.
- **Week navigation.** Move back and forth between weeks to review past attendance.
- **Export and print.** Export every entry to a CSV file that opens in Excel, or print the current week.
- **Backup and restore.** Data is saved in the browser on this device. Download a JSON backup regularly, or restore one on another computer.

## Setup
1. Open `index.html`.
2. Open **⚙️ Settings**. Enter your name, the interns' names and the link to each SharePoint calendar (the URL in the browser's address bar while the calendar is open).
3. Each day, choose the intern, enter the times, have them sign, and click **Save entry**.
