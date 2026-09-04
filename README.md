# UAF Digital M&E/L System

A multi-project Monitoring, Evaluation & Learning system for Upskill Africa Foundation (UAF), built with Google Sheets + Google Apps Script + GitHub Pages.

## Architecture
- **Google Sheets:** data store and reporting tables
- **Google Apps Script:** API, authentication, calculations, report generation
- **GitHub Pages:** responsive web dashboard
- **Google Drive:** evidence/photos/report storage

## Core modules
1. Dashboard
2. Projects
3. Objectives & Activities
4. Indicators/KPIs
5. Beneficiaries / Participants
6. Beneficiary journey tracking
7. Follow-ups
8. Evidence
9. Lessons learned
10. Challenges & recommendations
11. Automated monthly/quarterly/donor reporting

## Initial beneficiary workflow
Identified -> Verified -> Referred -> Enrolled -> Household Empowered -> Follow-up -> Retained -> Completed

## Deployment
1. Create a Google Sheet and run `apps-script/Setup.gs` once.
2. Deploy the Apps Script project as a Web App.
3. Put the deployed `/exec` URL in `frontend/config.js`.
4. Enable GitHub Pages for the `main` branch.

Do not put API secrets in GitHub. Apps Script access control should be configured in the deployment settings.
