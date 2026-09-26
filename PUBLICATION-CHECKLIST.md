# GN-Apex SDK Public Release Checklist

## Blocking items found during SDK inspection

-   [ ] Reconcile `package.json` version (`0.0.1` in the inspected
    archive) with the runtime SDK version (`1.1.0`).
-   [ ] Reconcile CLI version (`1.3.0` in the inspected CLI source) with
    the package/release version, or explicitly define CLI and SDK
    versioning policy.
-   [ ] Add the MIT `LICENSE` file to the repository.
-   [ ] Ensure `README.md` is the same version as the package being
    published.
-   [ ] Generate and inspect `dist/*.d.ts`.
-   [ ] Confirm `package.json` `files` includes every artifact intended
    for npm.
-   [ ] Verify the CLI entry file exists in the published tarball.
-   [ ] Verify `@gnapex/sdk/react` resolves correctly from the published
    package.
-   [ ] Test both ESM and CommonJS consumption.
-   [ ] Run the complete test/type-check/build pipeline.

## npm/package metadata

-   [ ] Package name is correct.
-   [ ] Description is concise and developer-facing.
-   [ ] Keywords cover actual functionality without keyword stuffing.
-   [ ] Repository URL is present.
-   [ ] Homepage/documentation URL is present.
-   [ ] Bugs URL is present.
-   [ ] Author/maintainer information is correct.
-   [ ] License field matches the LICENSE file.
-   [ ] Engines are accurate.
-   [ ] Peer dependencies are accurate.
-   [ ] `exports` are tested.
-   [ ] `types` are tested.
-   [ ] `bin` entries are tested.

## Search/SEO

A README helps GitHub/npm discovery, but it is not a complete SEO
system.

Publish a documentation website with:

-   One canonical URL per documentation page.
-   Descriptive `<title>` and meta description.
-   Open Graph metadata.
-   Twitter/X card metadata.
-   `sitemap.xml`.
-   `robots.txt`.
-   Canonical links.
-   Breadcrumb structured data.
-   `SoftwareSourceCode`/`TechArticle` structured data where
    appropriate.
-   Search-friendly API/reference pages.
-   Versioned documentation.
-   Stable URLs.
-   Internal links between guides and API pages.
-   Examples that are indexable as text.
-   A dedicated page for each major SDK capability.

## AI discoverability

Publish:

-   `llms.txt`
-   `llms-full.txt`
-   Versioned API docs
-   Installation page
-   Migration guides
-   Troubleshooting pages
-   Compatibility matrix
-   Security/privacy pages

Keep exact package names, imports, signatures, configuration names,
prerequisites, defaults, and limitations in machine-readable text.

## Structured documentation

Recommended:

``` text
docs/
  getting-started/
  guides/
  api/
  cli/
  concepts/
  security/
  privacy/
  troubleshooting/
  migration/
  releases/
examples/
```

## Trust signals

-   [ ] Security policy
-   [ ] License
-   [ ] Changelog
-   [ ] Contribution guide
-   [ ] Code of conduct
-   [ ] Version/release tags
-   [ ] CI status
-   [ ] Test/coverage reporting
-   [ ] Published package
-   [ ] Documentation site
-   [ ] Public examples
-   [ ] Clear support/contact path

## Before `npm publish`

``` bash
npm pack --dry-run
npm run type-check
npm run lint
npm test
npm run build
```

Inspect the generated tarball manually before publishing.
