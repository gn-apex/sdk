## Summary

What does this PR change, and why?

## Related issue

Closes #

## Type of change

- [ ] Documentation fix (typo, clarity, broken link, outdated info)
- [ ] New or updated example under `examples/`
- [ ] New documentation section
- [ ] Other (community/repo file, e.g. issue template, `.gitignore`)

> This repository holds documentation, guides, and examples only — `@gnapex/sdk`'s source lives in a private repository. Pull requests changing SDK behavior can't be merged here; please open a feature/bug issue instead so it can be tracked and implemented upstream.

## Checklist

- [ ] Changes are limited to documentation, examples, or repo/community files (no attempt to add `src/` or SDK implementation code)
- [ ] If an example changed: it was tested against the currently published `@gnapex/sdk` version (`npm install @gnapex/sdk` in a scratch project) and only uses the SDK's public API
- [ ] If a documented default or API signature changed: it matches the actual behavior of the currently published npm package, not a proposed/future behavior
- [ ] Updated `llms.txt` if a documented export, method, or default changed
- [ ] Links (internal `#anchors` and file references) still resolve correctly

## Does this touch a documented default?

If this PR changes how a default is described (e.g. `privacy.fingerprinting`, `hasConsent`, `autoPromptPush`, `revalidateTime` in the README's "Privacy, consent & data collection defaults" or "Caching model" sections), confirm this matches the published package's actual current behavior. If not applicable, write "N/A".

## Screenshots / output (if applicable)
