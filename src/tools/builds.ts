import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ascGet, type PaginatedResponse, type SingleResponse } from "../client/api-client.js";
import type { Build } from "../types/asc-api.js";

function formatBuild(build: Build): Record<string, unknown> {
  return {
    id: build.id,
    version: build.attributes.version,
    uploadedDate: build.attributes.uploadedDate,
    expirationDate: build.attributes.expirationDate,
    expired: build.attributes.expired,
    minOsVersion: build.attributes.minOsVersion,
    processingState: build.attributes.processingState,
  };
}

export function registerBuildsTools(server: McpServer): void {
  server.tool(
    "list_builds",
    "List builds for an app. Filter by processing state or version.",
    {
      appId: z.string().describe("The App Store Connect app ID"),
      filterProcessingState: z.enum(["PROCESSING", "FAILED", "INVALID", "VALID"]).optional()
        .describe("Filter by processing state"),
      filterVersion: z.string().optional()
        .describe("Filter by build version string"),
      limit: z.number().min(1).max(200).optional()
        .describe("Number of builds to return (default 20)"),
    },
    async ({ appId, filterProcessingState, filterVersion, limit }) => {
      const params: Record<string, string> = {
        "filter[app]": appId,
        "fields[builds]": "version,uploadedDate,expirationDate,expired,minOsVersion,processingState",
        limit: String(limit ?? 20),
        sort: "-uploadedDate",
      };

      if (filterProcessingState) {
        params["filter[processingState]"] = filterProcessingState;
      }
      if (filterVersion) {
        params["filter[version]"] = filterVersion;
      }

      const response = await ascGet<PaginatedResponse<Build>>("/builds", params);
      const builds = response.data.map(formatBuild);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ builds, total: builds.length }, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "get_build",
    "Get detailed information about a specific build",
    {
      buildId: z.string().describe("The build ID"),
    },
    async ({ buildId }) => {
      const response = await ascGet<SingleResponse<Build>>(
        `/builds/${buildId}`,
        { "fields[builds]": "version,uploadedDate,expirationDate,expired,minOsVersion,processingState,buildAudienceType" }
      );

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(formatBuild(response.data), null, 2),
          },
        ],
      };
    }
  );
}
