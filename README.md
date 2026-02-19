# shipcheck

Scan React Native iOS projects for common App Store rejection issues — and auto-fix them with local AI coding CLIs.

No API keys needed. Ships with 10 rules covering privacy, metadata, payments, security, and functionality requirements.

## Install

```bash
npm install -g shipcheck
```

## Usage

```bash
# Scan current directory
shipcheck

# Scan a specific project
shipcheck scan ./my-app

# JSON output (for CI)
shipcheck scan --format json

# GitHub Actions annotations
shipcheck scan --format github

# List all rules
shipcheck list-rules

# AI-powered auto-fix (requires claude or codex on PATH)
shipcheck fix --yes

# Dry run — see what would be fixed
shipcheck fix --dry-run
```

## Rules

| Rule | Severity | Description |
|------|----------|-------------|
| `privacy/missing-purpose-strings` | error | Code uses permission APIs but Info.plist missing NS*UsageDescription |
| `privacy/missing-privacy-manifest` | error | No PrivacyInfo.xcprivacy file |
| `privacy/overbroad-permissions` | warning | Plist declares permissions not used in code |
| `metadata/missing-icons` | error | Missing required app icon assets |
| `metadata/version-mismatch` | warning | pbxproj MARKETING_VERSION ≠ package.json version |
| `payments/missing-restore-purchases` | error | Uses IAP but no restore purchases call |
| `security/insecure-transport` | error | NSAllowsArbitraryLoads = true in ATS |
| `functionality/missing-account-deletion` | error | Has auth/signup but no account deletion |
| `functionality/missing-deep-link-handling` | warning | Registers URL schemes but no Linking handler |
| `functionality/minimum-os-version` | warning | Deployment target below iOS 15 |

## AI Fix

shipcheck can auto-fix issues by shelling out to local AI coding CLIs:

- **Claude Code** (`claude`) — preferred
- **Codex CLI** (`codex`)

No API keys or SDK configuration required. Just have one of these CLIs installed and on your PATH.

```bash
# Auto-detect CLI and fix all issues
shipcheck fix --yes

# Use a specific agent
shipcheck fix --agent claude --yes

# Preview what would be fixed
shipcheck fix --dry-run
```

## Configuration

Create `.shipcheckrc.json` in your project root:

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

## CI Integration

### GitHub Actions

```yaml
- name: Check App Store compliance
  run: npx shipcheck scan --format github
```

### JSON output

```bash
shipcheck scan --format json | jq '.summary'
```

## License

MIT
