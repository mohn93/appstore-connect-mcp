import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ascGet, type PaginatedResponse, type SingleResponse } from "../client/api-client.js";
import type { App } from "../types/asc-api.js";

function formatApp(app: App): Record<string, unknown> {
  return {
    id: app.id,
    name: app.attributes.name,
    bundleId: app.attributes.bundleId,
    sku: app.attributes.sku,
    primaryLocale: app.attributes.primaryLocale,
  };
}

export function registerAppsTools(server: McpServer): void {
  server.tool(
    "list_apps",
    "List all apps in your App Store Connect account",
    {
      limit: z.number().min(1).max(200).optional()
        .describe("Number of apps to return (1-200, default 50)"),
    },
    async ({ limit }) => {
      const params: Record<string, string> = {
        "fields[apps]": "name,bundleId,sku,primaryLocale",
        limit: String(limit ?? 50),
      };

      const response = await ascGet<PaginatedResponse<App>>("/apps", params);
      const apps = response.data.map(formatApp);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              { apps, total: response.meta?.paging?.total ?? apps.length },
              null,
              2
            ),
          },
        ],
      };
    }
  );

  server.tool(
    "get_app",
    "Get detailed information about a specific app",
    {
      appId: z.string().describe("The App Store Connect app ID"),
    },
    async ({ appId }) => {
      const response = await ascGet<SingleResponse<App>>(
        `/apps/${appId}`,
        { "fields[apps]": "name,bundleId,sku,primaryLocale,contentRightsDeclaration,isOrEverWasMadeForKids" }
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(formatApp(response.data), null, 2),
          },
        ],
      };
    }
  );
}
