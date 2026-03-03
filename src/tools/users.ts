import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ascGet, type PaginatedResponse } from "../client/api-client.js";
import type { User } from "../types/asc-api.js";

export function registerUsersTools(server: McpServer): void {
  server.tool(
    "list_users",
    "List all users (team members) and their roles in App Store Connect",
    {
      filterRole: z.string().optional()
        .describe("Filter by role (e.g. ADMIN, DEVELOPER, APP_MANAGER)"),
      limit: z.number().min(1).max(200).optional()
        .describe("Number of users to return (default 50)"),
    },
    async ({ filterRole, limit }) => {
      const params: Record<string, string> = {
        "fields[users]": "username,firstName,lastName,roles,allAppsVisible,provisioningAllowed",
        limit: String(limit ?? 50),
      };

      if (filterRole) params["filter[roles]"] = filterRole;

      const response = await ascGet<PaginatedResponse<User>>("/users", params);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              users: response.data.map((u) => ({
                id: u.id,
                username: u.attributes.username,
                firstName: u.attributes.firstName,
                lastName: u.attributes.lastName,
                roles: u.attributes.roles,
                allAppsVisible: u.attributes.allAppsVisible,
                provisioningAllowed: u.attributes.provisioningAllowed,
              })),
            }, null, 2),
          },
        ],
      };
    }
  );
}
