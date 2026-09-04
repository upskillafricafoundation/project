# UAF Digital M&E/L System

A multi-project Monitoring, Evaluation & Learning system for Upskill Africa Foundation (UAF), built with Google Sheets + Google Apps Script + GitHub Pages + Google Drive.

## Architecture
- **Google Sheets:** central database and reporting tables
- **Google Apps Script:** API, validation, role/project access, KPI calculations, evidence storage and report generation
- **GitHub Pages:** responsive dashboard and field interface
- **Google Drive:** private evidence and generated reports

## Stage 5 modules
1. Executive dashboard with project performance
2. Multi-project management with project-access filtering
3. Beneficiary registration, duplicate detection and consent validation
4. Beneficiary journey/case management and field follow-ups
5. Mobile-friendly field data collection
6. Indicator achievement recording and automatic KPI totals
7. Evidence/photo/document upload to Google Drive
8. Automated alerts for overdue follow-ups and low KPI performance
9. Automated Google Docs report generation
10. Audit logging and role-based access
11. Frontend API configuration in `frontend/config.js`

## Beneficiary workflow
Identified -> Verified -> Referred -> Enrolled -> Household Empowered -> Follow-up -> Retained -> Completed

## Recommended roles
- Executive Director
- M&E Officer
- Program Manager
- Project Officer
- Field Officer
- Data Entry Officer

## Stage 5 deployment
1. Open the UAF M&E Google Sheet and its Apps Script project.
2. Replace the existing backend with `apps-script/Setup.gs` from this repository.
3. Run `setupUAFMEL()` once. Existing rows are preserved; the new **Alerts** sheet is created.
4. Add authorized staff to **Users** with Name, Email, Role, Project Access and Status=Active.
5. For project-restricted users, set **Project Access** to `*` or a comma-separated list of Project IDs/codes.
6. Deploy the Apps Script as a Web App and copy the `/exec` URL.
7. Edit `frontend/config.js` and replace `YOUR_APPS_SCRIPT_EXEC_URL` with the `/exec` URL.
8. Enable GitHub Pages for the `main` branch.
9. In Apps Script, run `createDailyAlertsTrigger()` once to create the daily M&E alert check. Authorize the requested Google permissions.
10. If you want evidence organized in a dedicated Drive folder, add a Settings row with Key=`Evidence Folder ID` and Value=`YOUR_PRIVATE_DRIVE_FOLDER_ID`. Otherwise uploads go to the script owner's Drive root.

## Stage 5 data-quality rules
- Beneficiary registration requires parent/guardian consent.
- Possible duplicate beneficiaries in the same project are blocked when phone matches, or when name + date of birth match, or name + community match.
- Indicator baseline, target and achievements must be non-negative numbers.
- Field follow-ups update the beneficiary journey and create a FollowUps record.
- KPI observations are accumulated into the indicator's Current Achievement.

## Important security note
Beneficiary information can be sensitive, particularly information concerning children. Keep the Google Sheet and evidence Drive folder private. Do not publish beneficiary data, photos or the Apps Script endpoint openly. The Users sheet provides application-level authorization, but production security also depends on the Apps Script Web App deployment/account configuration. Review the deployment access setting before live use.
