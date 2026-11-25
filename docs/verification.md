# Verification and acceptance plan

All scenarios below are acceptance requirements, not recorded passing test results.

| ID | Scenario | Expected result |
| --- | --- | --- |
| F01 | Add a valid task | Task appears under the selected category; counters update |
| F02 | Submit blank or whitespace-only title | No task is created |
| F03 | Complete a pending task | Task disappears from pending and appears in completed |
| F04 | Reopen a completed task | Task returns to pending; metrics reconcile |
| F05 | Edit title, category and priority | Existing identifier and completion state are retained |
| F06 | Cancel deletion | Task remains unchanged |
| F07 | Confirm deletion | Task is removed and metrics update |
| P01 | Reload after task mutation | Saved state is restored |
| P02 | Storage unavailable or quota exceeded | Visible warning; in-memory changes remain available for export |
| P03 | Malformed stored JSON | Empty task view with a warning |
| D01 | Export and import valid data | New task identifiers are imported |
| D02 | Import matching identifiers | Existing task records remain unchanged |
| D03 | Import malformed JSON, invalid enum or duplicate ID | Import rejected without replacing existing state |
| D04 | Import oversized file or collection | Import rejected |
| U01 | Test 320, 375, 390, 768 and 1440 CSS-pixel widths | No horizontal overflow; all controls usable |
| U02 | Toggle theme and reload | Selected theme persists |
| A01 | Keyboard-only navigation | Controls reachable, focus visible and task operations usable |
| A02 | VoiceOver and screen reader checks | Controls, status updates and progress announced meaningfully |
| A03 | Contrast and zoom checks | WCAG 2.2 AA criteria assessed; no conformance claimed until verified |
| O01 | Open deployed GitHub Pages URL | HTTPS page loads and task lifecycle functions |
| O02 | Inspect public source and network requests | No real task data or credentials embedded |

## Verification environments

Target modern Chromium, Firefox, Safari and physical iPhone Safari. Record browser version, viewport, commit SHA, observed result and evidence for each run.

## Known gaps

No automated CI, browser test suite, physical-device test evidence, formal accessibility audit, performance benchmark, or authenticated synchronization is present. Deployment was configured by the owner but must be checked independently. Browser-local storage is not a reliable backup and concurrent tabs may overwrite each other's changes.

## Release gate

A release should record exact commit, test results, known deviations and deployment URL. Do not label the application production-ready until agreed acceptance requirements are met.
