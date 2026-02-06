# Review Fix Plan

This document lists the issues identified in the review, the intended fixes, and
the order of work. It also includes notes from running lint/tests.

## Test and lint status
- `npm run lint`: passes locally.
- `npm test`: fails in CI mode. With sandboxing disabled, Testem runs but all
  14 tests fail because Chrome/Firefox are not available in this environment.
  The earlier sandbox run failed with `EPERM` binding to `0.0.0.0:7357`.

## Fix plan (ordered by priority)

1) Size generator validation and safety (highest priority)
- Problem: `get-request-value` can infinite-loop or return wrong length when
  `request.size` or `request.template` are invalid, and it uses `request.size`
  instead of the parsed value.
- Fix: Validate `size` is a finite non-negative integer, ensure `template` is a
  non-empty string, and use `size` for substring. Return `false` for invalid
  requests to avoid runtime errors.
- Tests: Add/update unit tests for invalid size/template inputs.

2) Empty-string injection/paste handling
- Problem: Empty string values are treated as falsy and ignored, so you can’t
  inject/paste `''`.
- Fix: Update checks to allow empty strings while still rejecting `null`/`undefined`.
- Tests: Add tests for empty-string values in injection and paste.

3) Options JSON parsing safety
- Problem: JSON parsing errors from local/remote configs can bubble up and break
  the options UI.
- Fix: Wrap `JSON.parse` in try/catch or validate before calling `addSubMenu`,
  then display a clear error string.
- Tests: Add tests for invalid JSON content handling.

4) Iframe traversal null-guard
- Problem: `contentDocument.activeElement` can be `null` and cause crashes.
- Fix: Add guards and/or depth limits while traversing iframes.
- Tests: Add a test for iframe traversal with null active element (mocked).

5) Message injection race condition
- Problem: Retry after `executeScript` may occur before content script is ready.
- Fix: Add a small retry/backoff or a handshake response from the content script.
- Tests: Add a mocked test to verify retry behavior.

6) Copy-to-clipboard error signaling and restricted tabs
- Problem: No restricted tab checks or error signaling; failures are silent.
- Fix: Reuse the restricted URL checks and return a Promise to signal failure.
- Tests: Add tests for restricted tabs and missing active tab.

7) Architecture cleanup
- Problem: Duplicate iframe traversal logic and mixed async styles.
- Fix: Extract shared helper; standardize on Promise-based wrappers.
- Tests: No functional change; update unit tests as needed.
