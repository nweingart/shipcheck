# shipcheck

## The Problem

You've spent months building your React Native app. The features work. The tests pass. You submit to the App Store and wait. Three days later you get the email:

> **Binary Rejected.** Your app does not comply with the following guidelines...

What follows is a scavenger hunt through Apple's labyrinth of review guidelines, plist configurations, and privacy requirements — most of which have nothing to do with whether your app actually works. You're not debugging code. You're debugging bureaucracy.

Missing a `NSCameraUsageDescription` in your Info.plist? Rejected. Forgot the privacy manifest Apple started requiring in 2024? Rejected. Have a signup flow but no way to delete an account? Believe it or not, rejected. These aren't edge cases. They are the most common reasons React Native apps get bounced from the App Store, and every single one of them is preventable.

shipcheck scans your React Native iOS project for the issues that get apps rejected and, if you have a local AI coding CLI installed, fixes them for you. No API keys. No configuration files. One command.

```bash
npx shipcheck
```

## What It Catches

shipcheck ships with 10 rules across five categories. Each rule maps directly to an App Store Review Guideline that has rejected real apps.

**Privacy** — the category that catches most teams off guard:
- `privacy/missing-purpose-strings` — Your code calls the camera API but your Info.plist doesn't explain why. Apple will reject this every time.
- `privacy/missing-privacy-manifest` — No `PrivacyInfo.xcprivacy` file. Required since Spring 2024 for any app that touches UserDefaults, file timestamps, or disk space — which is every React Native app.
- `privacy/overbroad-permissions` — Your plist declares microphone access but your code never uses a microphone. App Review will ask questions you don't want to answer.

**Metadata** — the paperwork:
- `metadata/missing-icons` — No app icon assets. You would be surprised how often this ships.
- `metadata/version-mismatch` — Your Xcode project says version 2.0.0 but package.json says 1.9.0. Pick one.

**Payments** — Apple's favorite topic:
- `payments/missing-restore-purchases` — You integrated In-App Purchases but there's no "Restore Purchases" button. Apple requires one. No exceptions.

**Security** — the one that's probably your fault:
- `security/insecure-transport` — `NSAllowsArbitraryLoads` is set to `true`, which disables App Transport Security entirely. This was fine in 2016. It is not fine now.

**Functionality** — the rules that exist because someone ruined it for everyone:
- `functionality/missing-account-deletion` — You let users create accounts but not delete them. Apple has required account deletion since June 2022.
- `functionality/missing-deep-link-handling` — You registered a URL scheme in your plist but nothing in your code handles incoming URLs. This creates blank screens during App Review, which reviewers love.
- `functionality/minimum-os-version` — Your deployment target is iOS 13. It's not 2019 anymore.

## The AI Fix

Here is where it gets interesting. Most of these issues are tedious but straightforward to fix — add a key to a plist, create a privacy manifest, wire up a deep link handler. The kind of work that takes an experienced developer 20 minutes and a junior developer an entire afternoon of Stack Overflow archaeology.

shipcheck can fix these issues automatically by shelling out to whatever AI coding CLI you have installed locally. No API keys. No SDK. No vendor lock-in. If you have `claude` or `codex` on your PATH, shipcheck will detect it and use it.

```bash
# See what would be fixed
shipcheck fix --dry-run

# Fix everything
shipcheck fix --yes

# Use a specific AI CLI
shipcheck fix --agent claude --yes
```

For each violation, shipcheck generates a targeted prompt with the exact context the AI needs: which files to modify, what the issue is, and what the fix should look like. The AI does the rest.

This is not a wrapper around ChatGPT. There are no API calls leaving your machine. The AI runs locally, reads your actual project files, and makes edits in place. You can review every change with `git diff` before you commit.

## Install

```bash
npm install -g shipcheck
```

Or run it directly:

```bash
npx shipcheck
```

## Usage

```bash
# Scan the current directory
shipcheck

# Scan a specific project
shipcheck scan ./my-app

# Only show errors (skip warnings)
shipcheck scan --severity error

# Only run privacy rules
shipcheck scan --rule "privacy/*"

# JSON output for CI pipelines
shipcheck scan --format json

# GitHub Actions annotations
shipcheck scan --format github

# List all available rules
shipcheck list-rules

# List only AI-fixable rules
shipcheck list-rules --fixable
```

## CI Integration

### GitHub Actions

```yaml
- name: App Store compliance check
  run: npx shipcheck scan --format github
```

This annotates your PR with inline warnings and errors on the files that have issues. No more "I'll fix the plist later" making it to main.

### JSON Output

```bash
shipcheck scan --format json | jq '.summary'
```

Returns structured data you can pipe into Slack alerts, dashboards, or whatever system you've built to yell at people who break things.

## Configuration

If you need to customize behavior, create a `.shipcheckrc.json` in your project root:

```json
{
  "iosDir": "ios",
  "agent": "claude",
  "rules": {
    "functionality/minimum-os-version": {
      "severity": "info"
    },
    "privacy/overbroad-permissions": {
      "enabled": false
    }
  },
  "exclude": ["**/generated/**"]
}
```

You can override rule severity, disable rules entirely, point to a non-standard iOS directory, lock in your preferred AI agent, and exclude generated files from source scanning.

Most projects won't need a config file. The defaults are opinionated because Apple's review process is opinionated.

## How It Works

shipcheck is an ESLint-style rule engine built for iOS project structure rather than JavaScript syntax. On each run it:

1. **Detects** your React Native iOS project structure — finds the `.xcodeproj`, `Info.plist`, `project.pbxproj`, `Podfile.lock`, and privacy manifest
2. **Parses** iOS configuration files and scans your JS/TS source code for API usage patterns
3. **Runs** all rules in parallel against a shared, read-only context
4. **Reports** violations with severity levels, file locations, and (for fixable rules) the exact prompt an AI agent would use to fix them

Rules are stateless and parallel-safe. Parsers run once and their results are cached. The whole scan completes in under a second for most projects.

## Contributing

The rule engine is designed to make adding new rules simple. Each rule is a single file that exports a `meta` object and a `check` function. If you've been burned by an App Store rejection that isn't covered, open a PR. The best rules come from pain.

## License

MIT
