# UAF Digital M&E/L System

A multi-project Monitoring, Evaluation & Learning system for Upskill Africa Foundation (UAF), built with Google Sheets + Google Apps Script + GitHub Pages.

## Architecture
- **Google Sheets:** central data store and reporting tables
- **Google Apps Script:** API, calculations, access checks and Google Docs report generation
- **GitHub Pages:** responsive web dashboard and case-management interface
- **Google Drive:** evidence, photos and generated reports

## Stage 3 modules
1. Executive organization dashboard
2. Multi-project management
3. Beneficiary registration and searchable case database
4. Beneficiary journey tracking
5. Indicator/KPI setup and performance monitoring
6. Project-level performance summaries
7. Monthly indicator data structure
8. Automated Google Docs report generation
9. User access/role structure via the Users sheet
10. Audit-log structure

## Beneficiary workflow
Identified -> Verified -> Referred -> Enrolled -> Household Empowered -> Follow-up -> Retained -> Completed

## Recommended roles
- Executive Director
- M&E Officer
- Program Manager
- Project Officer
- Field Officer
- Data Entry Officer

## Deployment
1. Create/open the UAF M&E Google Sheet.
2. Add `apps-script/Setup.gs` and `apps-script/Stage3.gs` to the Apps Script project.
3. Run `setupUAFMEL()` once. This version preserves existing records and creates missing sheets.
4. Add authorized staff to the **Users** sheet with name, email, role, project access and status.
5. Deploy Apps Script as a Web App and copy its `/exec` URL.
6. Put that URL into `frontend/index.html` as `API_URL`.
7. Enable GitHub Pages for the `main` branch.

## Important security note
Beneficiary information can be sensitive. Do not expose the Apps Script endpoint publicly without appropriate access controls. Restrict the Web App to authorized users where possible, use the Users sheet for role mapping, and do not place passwords, API keys or other secrets in GitHub.
