# App Store Connect MCP Server

An MCP (Model Context Protocol) server that wraps Apple's [App Store Connect API](https://developer.apple.com/documentation/appstoreconnectapi), giving AI assistants the ability to manage apps, builds, TestFlight, reviews, and more — right from your IDE.

## Prerequisites

1. An **App Store Connect API key** — generate one in [Users and Access → Integrations → Team Keys](https://appstoreconnect.apple.com/access/integrations/api).
2. Note your **Key ID**, **Issuer ID**, and download the **`.p8` private key** file.

## Setup

### Claude

<details>
<summary>Claude Code (CLI)</summary>

```bash
claude mcp add appstore-connect \
  --transport stdio \
  --env ASC_KEY_ID=YOUR_KEY_ID \
  --env ASC_ISSUER_ID=YOUR_ISSUER_ID \
  --env ASC_PRIVATE_KEY_PATH=/absolute/path/to/AuthKey.p8 \
  -- npx -y appstore-connect-mcp
```

</details>

<details>
<summary>Claude Desktop</summary>

Add to your `claude_desktop_config.json`:

| OS | Path |
|----|------|
| macOS | `~/Library/Application Support/Claude/claude_desktop_config.json` |
| Windows | `%APPDATA%\Claude\claude_desktop_config.json` |

```json
{
  "mcpServers": {
    "appstore-connect": {
      "command": "npx",
      "args": ["-y", "appstore-connect-mcp"],
      "env": {
        "ASC_KEY_ID": "YOUR_KEY_ID",
        "ASC_ISSUER_ID": "YOUR_ISSUER_ID",
        "ASC_PRIVATE_KEY_PATH": "/absolute/path/to/AuthKey.p8"
      }
    }
  }
}
```

</details>

### Cursor

Add to `.cursor/mcp.json` in your project (or `~/.cursor/mcp.json` for global):

```json
{
  "mcpServers": {
    "appstore-connect": {
      "command": "npx",
      "args": ["-y", "appstore-connect-mcp"],
      "env": {
        "ASC_KEY_ID": "YOUR_KEY_ID",
        "ASC_ISSUER_ID": "YOUR_ISSUER_ID",
        "ASC_PRIVATE_KEY_PATH": "/absolute/path/to/AuthKey.p8"
      }
    }
  }
}
```

Verify under **Cursor Settings → MCP** after restarting.

### Antigravity

Add to `~/.gemini/antigravity/mcp_config.json` (or via **Agent pane → MCP Servers → Manage MCP Servers → View raw config**):

```json
{
  "mcpServers": {
    "appstore-connect": {
      "command": "npx",
      "args": ["-y", "appstore-connect-mcp"],
      "env": {
        "ASC_KEY_ID": "YOUR_KEY_ID",
        "ASC_ISSUER_ID": "YOUR_ISSUER_ID",
        "ASC_PRIVATE_KEY_PATH": "/absolute/path/to/AuthKey.p8"
      }
    }
  }
}
```

> **Tip:** Run `npx -y appstore-connect-mcp` once in your terminal first so the package is cached — Antigravity's first-run timeout can otherwise cause the server to fail to start.

## Available Tools

| Tool | Description |
|------|-------------|
| `list_apps` | List all apps in your App Store Connect account |
| `get_app` | Get details for a specific app |
| `list_builds` | List builds, optionally filtered by app or state |
| `get_build` | Get details for a specific build |
| `list_app_versions` | List App Store versions for an app |
| `get_app_version` | Get details for a specific version |
| `submit_for_review` | Submit an app version for App Store review |
| `list_beta_groups` | List TestFlight beta groups |
| `list_beta_testers` | List TestFlight beta testers |
| `add_beta_tester` | Add a tester to a beta group |
| `list_users` | List team members |
| `list_devices` | List registered devices |
| `list_bundle_ids` | List bundle IDs |
| `list_customer_reviews` | List customer reviews for an app |
| `respond_to_review` | Respond to a customer review |
| `list_certificates` | List signing certificates |
| `list_profiles` | List provisioning profiles |
| `list_in_app_purchases` | List in-app purchases for an app |
| `list_subscriptions` | List subscription groups for an app |
| `get_sales_report` | Download sales and financial reports |

## License

MIT
