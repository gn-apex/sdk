# Contributing to @gnapex/sdk

Thanks for taking the time to contribute. This repository holds the **public documentation, guides, and examples** for `@gnapex/sdk`. The SDK's source code is developed in a private repository and distributed as a compiled, closed-source package via npm — so this repo isn't where the implementation lives, and code pull requests against the SDK itself can't be accepted here.

That still leaves plenty of useful ways to contribute:

## Table of contents

- [What you can contribute here](#what-you-can-contribute-here)
- [What you can't contribute here](#what-you-cant-contribute-here)
- [Reporting bugs](#reporting-bugs)
- [Proposing features](#proposing-features)
- [Improving documentation](#improving-documentation)
- [Contributing examples](#contributing-examples)
- [Style guide for docs](#style-guide-for-docs)
- [Submitting a pull request](#submitting-a-pull-request)
- [Security issues](#security-issues)
- [Code of conduct](#code-of-conduct)

## What you can contribute here

- **Documentation fixes** — typos, unclear explanations, outdated examples, broken links, missing edge cases in the [README](./README.md).
- **New or improved examples** under [`examples/`](./examples) — additional framework integrations, patterns, or more realistic sample code.
- **Bug reports** for the published npm package — behavior that doesn't match the docs, or docs that don't match the package's actual behavior.
- **Feature requests** — proposals for new SDK capabilities, config options, or API ergonomics. These get triaged by maintainers and, if accepted, implemented in the private source repository.
- **Questions and discussion** — if GitHub Discussions is enabled on this repo, general usage questions are welcome there.

## What you can't contribute here

- Pull requests that modify SDK internals, add features, or fix bugs in the implementation — there's no `src/` in this repository to submit that against. File an issue instead (see [Reporting bugs](#reporting-bugs) / [Proposing features](#proposing-features)) and a maintainer will implement it upstream.
- Changes to build tooling, tests, CI, or release scripts — these live with the private source.

If you're unsure whether something belongs here, open an issue describing what you'd like to change and a maintainer will point you in the right direction.

## Reporting bugs

Use the **Bug report** issue template. Since you won't have access to the source to debug directly, the most useful report includes:

- The `@gnapex/sdk` version you're using (from your `package.json` or `nexus.getConfig().sdkVersion`)
- Environment (Node version, Next.js version if applicable, browser if applicable)
- A minimal reproduction — a code snippet using only the **public API** (what you import from `@gnapex/sdk` or `@gnapex/sdk/react`) is ideal, since that's what maintainers can act on fastest
- Expected vs. actual behavior
- Output of `npx apex doctor`, if the issue looks configuration-related

**Do not use a public issue for security vulnerabilities** — see [Security issues](#security-issues).

## Proposing features

Use the **Feature request** issue template. Describe the problem you're trying to solve before proposing a specific API shape — this makes it easier for maintainers to evaluate whether it fits the SDK's zero-config philosophy, whether it's better solved at the application layer, and how it'd be implemented upstream.

## Improving documentation

The [README](./README.md) is the primary reference for the SDK's public API — every method, config flag, and default documented there is meant to match the _published package's actual behavior_, not aspirational behavior. If you find a mismatch (a method that doesn't exist, a default that's documented wrong, a config flag that doesn't do what's described), that's a high-value bug report even though it's "just docs" — please file it.

Small, obviously-correct doc fixes (typos, broken links, formatting) are welcome directly as pull requests. Larger documentation restructuring is best proposed as an issue first, so we can agree on the approach before you put in the work.

## Contributing examples

New examples belong in [`examples/`](./examples), following the existing pattern:

- One self-contained file or small folder per example
- A comment header explaining what it demonstrates and where it goes in a real project
- Only import the **public API** — examples should reflect what any consumer of the published package can actually do, not internal SDK behavior
- Add an entry to [`examples/README.md`](./examples/README.md) linking your new example

## Style guide for docs

- Prefer accurate-but-plain over polished-but-vague — if a default is unusual (see the README's "Privacy, consent & data collection defaults" or "Caching model" sections), say so plainly rather than glossing over it.
- Code samples should be complete enough to copy-paste and run, not fragments that assume undocumented context.
- Match the existing heading structure and table of contents style when adding a new README section.
- When documenting a config flag or method, state its default value explicitly — "default: X" — not just its type.

## Submitting a pull request

1. Fork this repository and create a branch off `main`.
2. Make your change (docs or examples only — see [above](#what-you-can-contribute-here)).
3. If you added or changed an example, confirm it type-checks against the published `@gnapex/sdk` package (`npm install @gnapex/sdk` in a scratch project is enough — you don't need the SDK's source to validate an example against its public types).
4. Open a PR describing what changed and why, using the PR template.
5. A maintainer will review. Since there's no CI running against private source in this repo, review here is manual — please be patient.

## Security issues

Do not open a public issue for a security vulnerability in the SDK. See [`SECURITY.md`](./SECURITY.md) for private reporting instructions.

## Code of conduct

Be respectful, assume good intent, and keep discussion focused on the technical merits of a change. Disagreements about documentation clarity or API design are welcome; personal attacks are not.
