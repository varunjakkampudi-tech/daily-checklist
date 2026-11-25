# Verification

Target: Chromium (desktop and mobile-sized viewport). Run both Node suites and `npx playwright test --project=chromium`.

Acceptance requires exact-commit hosted checks plus a deployed smoke test. Verify three tabs, local date, completion/undo, archived task reopening, editing, recurrence, persistence, backup/recovery, offline reload, keyboard navigation and responsive layout. Public plan changes must not invalidate browser fixtures.

The repository does not claim physical-device, formal accessibility or performance certification. Record actual results in GitHub Actions; a configured test is not a passing test.

Rollback verification: confirm the original three-tab interface, a fresh-profile plan load, and existing-profile completion preservation. Check published tasks.json separately from local browser state; do not reset local storage to troubleshoot a cache issue.

Static asset checks accept versioned script URLs while still checking their files and core-before-controller order. A release must keep the public task manifest unchanged unless a task update is explicitly requested.

Maintenance baseline 39463dc: both quality workflows and GitHub Pages deployment succeeded. Subsequent task or documentation changes require fresh checks; historical successes are not evidence of a new deployment.
