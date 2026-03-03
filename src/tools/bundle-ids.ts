import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ascGet, type PaginatedResponse } from "../client/api-client.js";
import type { BundleId } from "../types/asc-api.js";

export function registerBundleIdsTools(server: McpServer): void {
  server.tool(
    "list_bundle_ids",
    "List registered bundle identifiers",
    {
      filterPlatform: z.enum(["IOS", "MAC_OS", "UNIVERSAL"]).optional()
        .describe("Filter by platform"),
      filterIdentifier: z.string().optional()
        .describe("Filter by bundle identifier string (e.g. com.example.*)"),
      limit: z.number().min(1).max(200).optional()
        .describe("Number of bundle IDs to return (default 50)"),
    },
    async ({ filterPlatform, filterIdentifier, limit }) => {
      const params: Record<string, string> = {
        "fields[bundleIds]": "name,identifier,platform,seedId",
        limit: String(limit ?? 50),
      };

      if (filterPlatform) params["filter[platform]"] = filterPlatform;
      if (filterIdentifier) params["filter[identifier]"] = filterIdentifier;

      const response = await ascGet<PaginatedResponse<BundleId>>("/bundleIds", params);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              bundleIds: response.data.map((b) => ({
                id: b.id,
                name: b.attributes.name,
                identifier: b.attributes.identifier,
                platform: b.attributes.platform,
                seedId: b.attributes.seedId,
              })),
            }, null, 2),
          },
        ],
      };
    }
  );
}
