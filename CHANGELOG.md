# Changelog

## Original interface maintenance

- Retain the original visual design and three task tabs.
- Validate cache-versioned script references in CI.
- Refresh cached assets from the network and avoid unnecessary list rendering on unchanged plans.
- Preserve recurrence ordering when older archive records have no completion date.


## Personal Chrome planner

- Local date in the header; exactly three task tabs.
- Archived completions remain accessible; legacy deferred tasks appear in Pending.
- Removed secondary navigation, insights UI and obsolete example assets.
- Improved date validation, recurrence identifiers, archive bounds and offline caching.
- Chromium-only browser acceptance and plan-independent test fixtures.

## Local-first upgrade

- Modular interface, versioned storage, migration, backup and recovery.
- Categories, notes, recurrence, appearance and offline shell.
