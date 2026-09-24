# 📒 Intern Logbook

An attendance logbook for a supervisor and two interns. Entries can be saved in a **SharePoint list** on the interns' SharePoint site, so the supervisor and both interns see the same logbook on any device. Without that connection, entries are saved only in the browser on the device you use.

## Quickest option: the Excel workbook (IT doesn't need to do anything)

**`Intern_Logbook.xlsx`** is a ready-made logbook for SharePoint. Upload it to the Interns site's **Documents** and open it in **Excel for the web**. The supervisor and both interns can then edit the same copy at the same time, and it needs no app registration.

| Tab | What it's for |
|---|---|
| **Setup** | Enter the supervisor's name, the weekly target (20), the first week of the internship, and each intern's name and SharePoint calendar link (yellow cells). |
| **Logbook** | One row per day: **Date, Intern** (drop-down), **Time In, Time Out, Signature** (type your full name). **Hours Worked**, **Week Of**, **Week-to-Date Hours** and **Remaining to Target** fill in by themselves. The top of the sheet links to both interns' calendars. |
| **Weekly Summary** | Each intern's hours for every week (Mon–Sun), with the hours left and a status: ✓ Target met / In progress / Short by X hrs. |

Built-in checks: if Time Out isn't after Time In, the Hours cell shows **Check times** and the row isn't counted. A dated row with no signature turns orange. When a week reaches the target it turns green. Excel's **Version History** records who entered or changed each row, which backs up the typed signatures.

To show it on the Interns page, add a **File viewer** (or **Document library**) web part that points to the workbook.

The web app below does more (drawn signatures, one-tap entry on a phone), but syncing it to SharePoint needs an Entra app registration by IT. Without that, the web app still works, but it saves entries only on the device where they were entered.

## Features
- **SharePoint calendars.** Each intern's card has a button that opens their SharePoint calendar.
- **Daily attendance sheet.** Columns: date, intern, time in, time out, signature (drawn with a mouse or finger) and hours worked. Hours are calculated for you.
- **Weekly hours.** Hours add up per intern for each Monday–Sunday week, compared with a **20-hour** target that you can change. A progress bar shows the hours left.
- **Microsoft 365 sync.** Entries are stored as items in a SharePoint list, and people sign in with their work account. The page picks up new entries when you return to its tab and every few minutes while it's open.
- **Setup link.** The supervisor fills in Settings once and sends the interns a link that fills in the same settings for them.
- **Export and print.** Export every entry to a CSV file that opens in Excel, or print the current week. You can also back up to and restore from a JSON file.

## How it works

```
Browser (index.html) ──sign-in popup──▶ Microsoft Entra ID (work account)
        │
        └──Microsoft Graph──▶ SharePoint site "Interns" ▶ list "Intern Attendance"
```

Each attendance entry becomes one list item with the columns `Intern`, `InternSlot`, `WorkDate`, `TimeIn`, `TimeOut`, `Hours` and `Signature` (the signature is stored as a small image). Anyone who can edit the Interns site can add entries. You can also open the list directly in SharePoint, filter it, or export it to Excel from there.

## One-time Microsoft 365 setup

Three pieces are needed. Registering an app in step 2 needs an account that is allowed to do so. In many organizations that means asking IT.

### 1. Put the page on a web address (https)
Microsoft sign-in doesn't work when `index.html` is opened as a file. Host the `intern-logbook/` folder anywhere that serves static files over https, for example:
- **GitHub Pages:** in the repository go to *Settings → Pages*, deploy from the `main` branch, root folder. The logbook will be at `https://<your-github-username>.github.io/Cosmo-Data-Hub/intern-logbook/`. On a free GitHub plan this requires the repository to be public. The site holds no data or secrets; the entries stay in SharePoint.
- Any internal web server your IT team offers.

*A SharePoint document library won't work here: it downloads `.html` files instead of showing them.*

### 2. Register the app in Microsoft Entra ID
1. Go to <https://entra.microsoft.com> → **Applications → App registrations → New registration**.
2. Name: `Intern Logbook`. Supported account types: **Accounts in this organizational directory only**.
3. Redirect URI: choose the platform **Single-page application (SPA)** and enter the hosted address of `blank.html`, e.g. `https://<your-github-username>.github.io/Cosmo-Data-Hub/intern-logbook/blank.html`.
4. Click **Register**, then copy the **Application (client) ID** and the **Directory (tenant) ID**.
5. Go to **API permissions → Add a permission → Microsoft Graph → Delegated permissions** and add:
   - `Sites.ReadWrite.All`: read and write the list items.
   - `Sites.Manage.All`: only needed once, so the app can create the list. You can skip it if you create the list yourself (see below).
6. If your organization requires it, an admin clicks **Grant admin consent**.

These are *delegated* permissions: the app can only do what the signed-in person can already do in SharePoint.

### 3. Connect the logbook
1. Open the hosted logbook and expand **⚙️ Settings**.
2. Enter the interns' names and calendar links. Then, under **Microsoft 365**, enter:
   - **SharePoint site URL:** the Interns site, e.g. `https://yourorg.sharepoint.com/sites/Interns`. Copying the address of any page on the site works.
   - **List name:** `Intern Attendance`, or any name you like.
   - **Application (client) ID** and **Directory (tenant) ID** from step 2.
3. Click **Save & connect to SharePoint** and sign in. If the list doesn't exist, the logbook offers to create it.
4. If you logged entries before connecting, click **⬆ Upload device entries** to copy them into SharePoint.
5. Click **Copy setup link for interns** and send the link to the interns. When they open it, the settings are filled in and they only need to sign in.

**Creating the list yourself** (instead of granting `Sites.Manage.All`): on the Interns site, create a blank list named `Intern Attendance` with these columns. Single line of text: `Intern`, `WorkDate`, `TimeIn`, `TimeOut`. Number: `InternSlot`, `Hours`. Multiple lines of text (plain): `Signature`.

### Optional: show it on the Interns SharePoint page
Edit the Interns page, add an **Embed** web part and paste the logbook's address. A site owner may first need to allow the hosting domain under *Site settings → HTML Field Security*.

## Files
- `Intern_Logbook.xlsx`: the Excel logbook for SharePoint, with no setup needed from IT
- `index.html`: the page layout and styles
- `js/app.js`: the logbook: entries, weekly totals, signature pad, settings, export
- `js/m365.js`: Microsoft sign-in and reading/writing the SharePoint list through Microsoft Graph
- `blank.html`: the page the sign-in popup returns to
- `vendor/msal-browser.min.js`: Microsoft Authentication Library (MSAL.js v4, MIT license)
