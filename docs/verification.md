# Verification

Target: Chromium (desktop and mobile-sized viewport). Run both Node suites and `npx playwright test --project=chromium`.

Acceptance requires exact-commit hosted checks plus a deployed smoke test. Verify light/dark appearance, persistent header toggle, mobile/desktop layout, three tabs, local date, completion/undo, archived task reopening, editing, recurrence, persistence, backup/recovery, offline reload, keyboard navigation and responsive layout. Public plan changes must not invalidate browser fixtures.

The repository does not claim physical-device, formal accessibility or performance certification. Record actual results in GitHub Actions; a configured test is not a passing test.

Automated accessibility gate: axe-core WCAG 2.1 A/AA rules in light and dark themes across all three views; keyboard completion and focus checks; 44 CSS pixel primary controls and horizontal overflow checks at 320, 360, 390, 430, 768, 1024 and 1440 pixels with long content. Full manual assistive-technology testing is still required for a formal conformance claim.
