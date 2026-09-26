---
name: Bug report
about: Report something that isn't working as documented
title: "[Bug]: "
labels: bug, needs-triage
assignees: ""
---

## Describe the bug

A clear, concise description of what's wrong.

## Reproduction

Minimal steps or a code snippet that reproduces the issue:

```ts
// your code here
```

## Expected behavior

What you expected to happen.

## Actual behavior

What actually happened. Include error messages, stack traces, or `err.code` / `err.requestId` from a `NexusError` if applicable.

## Environment

- `@gnapex/sdk` version: <!-- e.g. 1.0.0, or output of `nexus.getConfig().sdkVersion` -->
- Node.js version:
- Next.js version (if applicable):
- Browser + version (if applicable):
- `apex doctor` output (if configuration-related):

```
paste output here
```

## Additional context

Anything else that might help — relevant `NexusConfig`, deployment target (GN-Apex platform vs. self-hosted), etc.

<!-- If this is a security vulnerability, please do NOT file it here — see SECURITY.md for private reporting instructions. -->
