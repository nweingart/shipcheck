# PRD: `shipcheck appstore` — App Store Metadata Generator

## Problem

After shipcheck helps you pass review, you still spend 1-2 hours manually writing App Store submission metadata: description, keywords, "What's New" text, privacy nutrition labels, and category selection. This is tedious, repetitive, and most devs just copy-paste from last time. The metadata directly affects discoverability and conversion, but it gets the least attention.

## Solution

Add a new `shipcheck appstore` command that generates complete App Store Connect metadata from your codebase. It reads what's already there — your README, changelog, privacy manifest, Info.plist, package.json — and produces ready-to-paste (or API-uploadable) metadata.

## Command

```
shipcheck appstore [dir]
  --locale <code>        Target locale (default: en-US)
  --format <type>        Output: text (default), json, fastlane
  --out <path>           Write to file instead of stdout
  --open                 Open App Store Connect in browser after generating
```

## What It Generates

### 1. App Description (4000 chars max)
- **Source**: README.md, package.json description
- **Logic**: AI rewrites the developer-facing README into a user-facing App Store description. Strips technical jargon. Structures as: hook line → feature bullets → closing CTA. Respects the 4000 char limit.
- **Output**: `description.txt`

### 2. Keywords (100 chars max)
- **Source**: README, package.json keywords, app name, source code analysis (feature detection)
- **Logic**: Extracts candidate keywords, deduplicates against the app name (Apple already indexes it), ranks by relevance, packs into 100 chars comma-separated. No spaces after commas (wastes chars).
- **Output**: `keywords.txt`

### 3. What's New / Release Notes
- **Source**: CHANGELOG.md, git log since last tag, package.json version
- **Logic**: Reads the latest changelog entry or git commits since the previous version tag. Summarizes into user-facing language (not commit messages). Groups into "New", "Improved", "Fixed".
- **Output**: `release-notes.txt`

### 4. Privacy Nutrition Labels
- **Source**: PrivacyInfo.xcprivacy, source code analysis (reuses shipcheck's existing detection)
- **Logic**: Maps detected API usage and privacy manifest declarations to App Store Connect privacy label categories:
  - Data types collected (contacts, location, identifiers, usage data, etc.)
  - Data linked to user vs. not linked
  - Data used for tracking vs. not
  - Purpose categories (app functionality, analytics, advertising, etc.)
- **Output**: `privacy-labels.json` (structured for App Store Connect API or manual entry)

### 5. Category Suggestion
- **Source**: Source code analysis, dependencies, app name
- **Logic**: Heuristic based on detected libraries and patterns:
  - Camera/photo libs → "Photo & Video"
  - MapView/location → "Navigation" or "Travel"
  - Health/fitness APIs → "Health & Fitness"
  - IAP/subscription patterns → likely not "Games"
  - WebView-heavy → "Utilities" or "Reference"
  - Chat/messaging patterns → "Social Networking"
- **Output**: Primary + secondary category recommendation with confidence

### 6. Subtitle (30 chars max)
- **Source**: package.json description, README first line
- **Logic**: AI distills the core value prop into ≤30 chars. Avoids generic phrases ("The best app for...").
- **Output**: `subtitle.txt`

## Output Formats

### text (default)
Human-readable with sections and character counts:
```
📱 App Store Metadata for MyApp v1.2.0

SUBTITLE (23/30 chars)
Track your daily habits

DESCRIPTION (2847/4000 chars)
Build better habits, one day at a time. ...

KEYWORDS (98/100 chars)
habit,tracker,daily,routine,goals,streak,reminder,productivity,wellness

WHAT'S NEW
- Added dark mode support
- Improved notification scheduling
- Fixed crash on iPad when rotating

CATEGORY
  Primary:   Health & Fitness (high confidence)
  Secondary: Productivity (medium confidence)

PRIVACY LABELS
  Data collected: Usage Data (App Functionality)
  Data not linked to user: Diagnostics
  Data used for tracking: None
```

### json
Structured JSON matching App Store Connect API field names. Can be piped to automation tools.

### fastlane
Generates a `Deliverfile` or `metadata/` directory structure compatible with `fastlane deliver`:
```
metadata/
  en-US/
    description.txt
    keywords.txt
    release_notes.txt
    subtitle.txt
    privacy_url.txt
```

## Architecture

### New files
```
src/commands/appstore.ts          — CLI command handler
src/generators/description.ts     — README → description
src/generators/keywords.ts        — keyword extraction + packing
src/generators/release-notes.ts   — changelog/git → release notes
src/generators/privacy-labels.ts  — privacy manifest → nutrition labels
src/generators/category.ts        — heuristic category suggestion
src/generators/subtitle.ts        — value prop → 30 chars
src/formatters/fastlane.ts        — fastlane output format
```

### Reused from existing shipcheck
- `engine/project-detector.ts` — find ios dir, app name
- `engine/context.ts` — parse plist, source files, package.json
- `parsers/*` — plist, pbxproj parsing
- Privacy/permissions detection patterns from existing rules

### AI Integration
The description, subtitle, and release notes generators benefit from AI. Two modes:
1. **Offline (default)**: Template-based generation using extracted data. Good enough for most cases.
2. **`--ai` flag**: Sends extracted context to local AI CLI (same claude/codex pattern as `shipcheck fix`) for higher quality, more natural copy. Costs one AI call per field.

## Scope Boundaries

### In scope
- All 6 metadata fields above
- text/json/fastlane output formats
- Offline template generation (no AI dependency for basic usage)
- Optional AI enhancement with `--ai` flag

### Out of scope (future)
- Screenshot generation (needs device frames, visual assets — separate tool)
- Direct App Store Connect API upload (auth complexity)
- Localization/translation (could be a `--locale` enhancement later)
- App preview video generation
- Pricing/IAP metadata

## Success Metrics
- Generates usable metadata in <5 seconds (offline mode)
- Keywords consistently fill 90%+ of the 100-char limit
- Description passes App Store Connect validation (no forbidden terms, under char limit)
- Privacy labels match what a human would select for the same app

## Implementation Order
1. `keywords.ts` + `category.ts` — pure heuristic, no AI needed, quick wins
2. `release-notes.ts` — git/changelog parsing
3. `privacy-labels.ts` — reuses existing shipcheck detection
4. `description.ts` + `subtitle.ts` — template mode first, AI mode second
5. `appstore.ts` command + `fastlane.ts` formatter
6. Wire into CLI alongside existing `scan`, `fix`, `list-rules`
