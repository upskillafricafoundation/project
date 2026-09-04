# UAF Digital M&E/L — Stage 7 Pre-Deployment Test Plan

## Current status

Stage 7 is integrated into `apps-script/Setup.gs` through the Stage 7 GET/POST routing hooks. The integrated endpoint supports portfolio intelligence, donor compliance, learning/adaptation, risks, decisions, reporting deadlines, and results framework actions.

## 1. Apps Script source check

Confirm these files are copied into the same Apps Script project:

- `apps-script/Setup.gs`
- `apps-script/Stage7.gs`
- `apps-script/Stage7Router.gs`

Do not create a second `doGet()` or `doPost()` function.

## 2. Initialize the database

Run `setupUAFMEL()` once from the Apps Script editor. Then run `setupStage7()` once.

Expected additional sheets:

- Donors
- Grants
- DonorRequirements
- ReportingDeadlines
- LearningQuestions
- LearningLog
- AdaptationLog
- ResultsFramework
- RiskRegister
- Decisions
- DonorReports
- ComplianceTracker

Existing M&E data must remain intact.

## 3. Create the ED account

In `Users`, add the authorized Google account with:

- Role: `ED`
- Project Access: `*`
- Status: `Active`

Then verify the `currentUser` endpoint identifies the account as authorized.

## 4. Create a test project

Create one non-production project and verify that its Project ID and Code are returned.

Use this test project for all Stage 7 tests before entering real donor information.

## 5. Stage 7 API tests

Test these GET actions:

- `stage7`
- `portfolioIntelligence`
- `learningIntelligence`
- `donorCompliance`
- `risks`
- `decisions`
- `deadlines`
- `resultsFramework`

Test these POST actions:

- `stage7Setup`
- `createStage7Record`
- `runStage7Alerts`

Every response should return valid JSON with `ok: true` when the request is authorized and valid.

## 6. Donor compliance test

Create a donor, grant, donor requirement, reporting deadline, donor report, and compliance record. Verify:

- days remaining are calculated;
- overdue items are identifiable;
- compliance RAG is returned;
- project access is enforced.

## 7. Learning and adaptation test

Create:

- one learning question;
- one learning-log entry;
- one adaptation-log entry.

Verify they appear in `learningIntelligence` and remain associated with the correct project.

## 8. Risk and decision test

Create one risk and one management decision. Verify both are returned only to users with access to the related project.

## 9. Security test

Test with an authorized ED account and an authorized non-ED account. Then test with an email that is not in `Users`.

Expected result for an unauthorized account: an authorization error; no protected data should be returned.

Also test a user whose Project Access contains only one project and confirm another project's records are not exposed.

## 10. Frontend configuration

`frontend/config.js` currently contains a placeholder for the Apps Script `/exec` URL. Replace it only after deployment of the Apps Script web app.

Do not place secrets, API keys, service-account credentials, or passwords in the frontend.

## 11. Production deployment sequence

1. Finalize and test the Apps Script project.
2. Run `setupUAFMEL()`.
3. Run `setupStage7()`.
4. Populate `Users` with authorized accounts.
5. Deploy the Apps Script as a Web App.
6. Copy the `/exec` URL into `frontend/config.js`.
7. Publish the GitHub Pages frontend.
8. Test login/authorization, dashboard loading, data creation, evidence, alerts, reports, donor compliance, learning, risks, and decisions.
9. Only then enter production project and beneficiary data.

## 12. Important security note

Role-based filtering depends on Apps Script user identity and the `Users` sheet. The web-app deployment mode must be chosen so the executing user's identity is available as intended. Verify this with a real second Google account before production use.
