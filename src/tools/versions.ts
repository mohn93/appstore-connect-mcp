import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ascGet, ascPost, type PaginatedResponse, type SingleResponse } from "../client/api-client.js";
import type { AppStoreVersion } from "../types/asc-api.js";

function formatVersion(version: AppStoreVersion): Record<string, unknown> {
  return {
    id: version.id,
    platform: version.attributes.platform,
    versionString: version.attributes.versionString,
    appStoreState: version.attributes.appStoreState,
    releaseType: version.attributes.releaseType,
    createdDate: version.attributes.createdDate,
    earliestReleaseDate: version.attributes.earliestReleaseDate,
  };
}

export function registerVersionsTools(server: McpServer): void {
  server.tool(
    "list_app_versions",
    "List all App Store versions for an app",
    {
      appId: z.string().describe("The App Store Connect app ID"),
      filterPlatform: z.enum(["IOS", "MAC_OS", "TV_OS", "VISION_OS"]).optional()
        .describe("Filter by platform"),
      filterAppStoreState: z.string().optional()
        .describe("Filter by app store state (e.g. READY_FOR_SALE, PREPARE_FOR_SUBMISSION)"),
      limit: z.number().min(1).max(200).optional()
        .describe("Number of versions to return (default 10)"),
    },
    async ({ appId, filterPlatform, filterAppStoreState, limit }) => {
      const params: Record<string, string> = {
        "fields[appStoreVersions]": "platform,versionString,appStoreState,releaseType,createdDate,earliestReleaseDate",
        limit: String(limit ?? 10),
      };

      if (filterPlatform) params["filter[platform]"] = filterPlatform;
      if (filterAppStoreState) params["filter[appStoreState]"] = filterAppStoreState;

      const response = await ascGet<PaginatedResponse<AppStoreVersion>>(
        `/apps/${appId}/appStoreVersions`,
        params
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ versions: response.data.map(formatVersion) }, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "get_app_version",
    "Get detailed information about a specific app version",
    {
      versionId: z.string().describe("The app store version ID"),
    },
    async ({ versionId }) => {
      const response = await ascGet<SingleResponse<AppStoreVersion>>(
        `/appStoreVersions/${versionId}`
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(formatVersion(response.data), null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "submit_for_review",
    "Submit an app store version for App Review. The version must be in READY_FOR_REVIEW state.",
    {
      versionId: z.string().describe("The app store version ID to submit"),
    },
    async ({ versionId }) => {
      const response = await ascPost<SingleResponse<{ type: string; id: string }>>(
        "/appStoreVersionSubmissions",
        {
          data: {
            type: "appStoreVersionSubmissions",
            relationships: {
              appStoreVersion: {
                data: {
                  type: "appStoreVersions",
                  id: versionId,
                },
              },
            },
          },
        }
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              { message: "Successfully submitted for review", submissionId: response.data.id },
              null,
              2
            ),
          },
        ],
      };
    }
  );
}
