# Verification

## Evidence

Nine data-model test callbacks passed in a JavaScript development harness. The committed Node test suite and Playwright suite are configured in GitHub Actions. Hosted outcomes must be checked at the exact revision; no browser pass is claimed here.

| Area | Acceptance |
|---|---|
| Migration | Preserve old tasks, completions and seen IDs |
| Reconciliation | Repeated refresh does not duplicate or reset tasks |
| Lifecycle | Complete, undo, reopen, defer, resume, archive and restore |
| Recurrence | Daily/weekly completion-relative due date, no duplicate active occurrence |
| Backup | Validate envelope; confirm replacement; preserve prior raw data |
| Recovery | Corrupt storage blocks writes; raw export available |
| Appearance | Automatic local time and explicit persistent modes |
| Accessibility | Keyboard focus, names, reduced motion, contrast and VoiceOver |
| Responsive | 320–1440 CSS pixels, no overflow |
| Offline | Successful prior install, reload without network, refresh failure visible |
| Deployment | Verify HTTPS, assets, manifest, worker and task JSON |
| Privacy | No sensitive task details in public artifacts |

Run `node --test tests/core.test.cjs` and `npx playwright test`. Record exact SHA, browser, viewport and results. The physical iPhone, offline upgrade, concurrency stress, accessibility audit and Lighthouse measurements remain unverified. Do not mark production acceptance complete until evidence is recorded.
