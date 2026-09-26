# GN-Apex SDK — Production Release & Publication Checklist

> **Target Release:** `@gnapex/sdk@1.0.0` (Inaugural Rebrand Release)  
> **Registry:** npm (Public)  
> **Binaries:** `apex`, `nexus`

---

## 1. Pre-Flight Codebase Remediation

Ensure the following code fixes and reconciliations are complete before running the build pipeline:

- [ ] **License Restored:** Verify `LICENSE` contains clean MIT license terms and that the accidental PR template text has been removed.
- [ ] **Version Alignment (1.0.0):**
  - [ ] `package.json` version set to `"1.0.0"`.
  - [ ] `tsup.config.ts` injects `__SDK_VERSION__: JSON.stringify(pkg.version)` across all builds.
  - [ ] `src/config.ts` fallback set to `"1.0.0"`.
  - [ ] `src/index.ts` exports `VERSION = "1.0.0"`.
  - [ ] `src/content/index.ts` uses `SDK_VERSION` instead of hardcoded strings.
  - [ ] `tools/cli.ts` `GNAPEX_VERSION` set to `"1.0.0"`.
  - [ ] `CHANGELOG.md` entry titled `## [1.0.0]`.
  - [ ] `SECURITY.md` header reflects `Version 1.0.0 Verified Release`.
- [ ] **Type Declarations Cleaned:**
  - [ ] Duplicate `interface NexusConfig` declaration in `src/types.ts` unified into a single definition.
- [ ] **Documentation & AI Files Synchronized:**
  - [ ] `README.md`, `llms.txt`, and `llms-full.txt` match the actual API signatures:
    - [ ] `nexus.content.getGlobals({ include: [...] })` (options object, not string key).
    - [ ] `nexus.content.search(query, { collections: [...] })` (query first, options second).
    - [ ] `trackPurchase({ orderId, total, products })` (correct property names).
    - [ ] All 16 atomic UI renderers (`NexusImage`, `NexusGallery`, `NexusCode`, etc.) documented in `llms.txt` and `llms-full.txt`.

---

## 2. Package Manifest & Metadata Verification (`package.json`)

- [ ] **Name & Visibility:** `"name": "@gnapex/sdk"`, `"private": false`.
- [ ] **Dual Module Exports:**
  - [ ] Root `.` resolves `import` to `./dist/index.js`, `require` to `./dist/index.cjs`, and `types` to `./dist/index.d.ts`.
  - [ ] Subpath `./react` resolves `import` to `./dist/react.js`, `require` to `./dist/react.cjs`, and `types` to `./dist/react.d.ts`.
- [ ] **TypesVersions:** `"typesVersions": { "*": { "react": ["./dist/react.d.ts"] } }` verified for older TypeScript bundlers.
- [ ] **CLI Binaries:** Both `"apex"` and `"nexus"` point to `./dist/cli.cjs`.
- [ ] **Browser Aliasing:**
  - [ ] `"./dist/content/local-cache-server.js": "./dist/content/local-cache-client.js"` present in `"browser"` field to ensure bundlers don't pull Node `fs` into client bundles.
- [ ] **Publish Files Whitelist:** Confirm `"files"` includes only release assets:
  ```json
  "files": [
    "dist",
    "README.md",
    "LICENSE",
    "CHANGELOG.md",
    "llms.txt",
    "llms-full.txt"
  ]
  ```
- [ ] **Peer Dependencies:** `"react": "^18.2.0 || ^19.0.0"` and `"react-dom": "^18.2.0 || ^19.0.0"` remain optional peer dependencies and are not bundled in the core client.
- [ ] **Engines:** `"node": ">=18.0.0"` declared.

---

## 3. Build & Test Pipeline Execution

Run each command sequentially from the root of the repository:

- [ ] **Step 1: Clean Installation**
  ```bash
  npm install
  ```
- [ ] **Step 2: Type Checking**
  ```bash
  npm run type-check
  ```
  _Pass Criteria:_ Zero compiler errors across `src/` and `tools/`.
- [ ] **Step 3: Test Suite**
  ```bash
  npm test
  ```
  _Pass Criteria:_ All suites (`client.test.ts`, `content.test.ts`, `analytics.test.ts`, `cache.test.ts`, `config.test.ts`) pass cleanly via `jest.config.cjs`.
- [ ] **Step 4: Production Build (Client + CLI + Studio)**
  ```bash
  npm run build
  ```
  _Pass Criteria:_
  - `tsup` creates all artifacts in `dist/` (`index.js`, `index.cjs`, `index.d.ts`, `react.js`, `react.cjs`, `react.d.ts`, `cli.cjs`).
  - Studio frontend builds into `./app/studio` without path errors.
- [ ] **Step 5: Shebang Verification**
      Verify that the built CLI file starts with the executable Node shebang:
  ```bash
  head -n 1 dist/cli.cjs
  # Expected: #!/usr/bin/env node
  ```

---

## 4. Tarball Inspection (Dry Run)

Inspect exactly what will be unpacked onto consumer machines:

```bash
npm pack --dry-run
```

Verify that:

- [ ] **Total package size** is reasonable (CLI dependencies bundled, but test/dev files excluded).
- [ ] **Included:** `dist/**`, `README.md`, `LICENSE`, `CHANGELOG.md`, `llms.txt`, `llms-full.txt`.
- [ ] **Excluded:** `src/`, `tools/`, `.nexus/`, `.nx/`, `coverage/`, `.github/`, tests, and local environment files (`.env*`).

---

## 5. Local Sandbox Smoke Testing

Test the built tarball in an isolated directory before uploading to npm:

```bash
# 1. Create a local tarball
npm pack

# 2. Test in a temporary scratch project
mkdir -p /tmp/gnapex-smoke-test
cd /tmp/gnapex-smoke-test
npm init -y
npm install /path/to/gnapex-sdk-1.0.0.tgz

# 3. Test CLI binaries
npx apex --version
# Expected: 1.0.0
npx nexus --version
# Expected: 1.0.0

# 4. Test CommonJS import
node -e "const { nexus } = require('@gnapex/sdk'); console.log('CJS OK:', !!nexus.getPage);"

# 5. Test ESM import
node --input-type=module -e "import { nexus } from '@gnapex/sdk'; console.log('ESM OK:', !!nexus.getPage);"

# 6. Test React subpath export
node --input-type=module -e "import { NexusProvider } from '@gnapex/sdk/react'; console.log('React OK:', !!NexusProvider);"
```

---

## 6. Publication to npm Registry

Once all smoke tests pass:

- [ ] **Check Authentication:**
  ```bash
  npm whoami
  ```
- [ ] **Publish Public Package:**
  ```bash
  npm publish --access public
  ```
- [ ] **Git Release Tagging:**
  ```bash
  git add .
  git commit -m "release: @gnapex/sdk@1.0.0"
  git tag v1.0.0
  git push origin main --tags
  ```

---

## 7. Legacy Package Migration (Deprecation)

Notify users of the legacy package:

- [ ] **Deprecate Legacy Name on npm:**
  ```bash
  npm deprecate @nexushub/client "@nexushub/client has migrated to @gnapex/sdk. Please install @gnapex/sdk@^1.0.0."
  ```

---

## 8. Post-Release Verification

- [ ] Check package page on npm: `https://www.npmjs.com/package/@gnapex/sdk`.
- [ ] Verify README rendering, badges, and MIT license display on npm.
- [ ] Confirm clean installation from registry:
  ```bash
  npx @gnapex/sdk@1.0.0 doctor
  ```

```

```
