import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ascGet, type PaginatedResponse } from "../client/api-client.js";
import type { Device } from "../types/asc-api.js";

export function registerDevicesTools(server: McpServer): void {
  server.tool(
    "list_devices",
    "List registered devices in your developer account",
    {
      filterPlatform: z.enum(["IOS", "MAC_OS"]).optional()
        .describe("Filter by platform"),
      filterStatus: z.enum(["ENABLED", "DISABLED"]).optional()
        .describe("Filter by status"),
      limit: z.number().min(1).max(200).optional()
        .describe("Number of devices to return (default 50)"),
    },
    async ({ filterPlatform, filterStatus, limit }) => {
      const params: Record<string, string> = {
        "fields[devices]": "name,platform,udid,deviceClass,status,model,addedDate",
        limit: String(limit ?? 50),
      };

      if (filterPlatform) params["filter[platform]"] = filterPlatform;
      if (filterStatus) params["filter[status]"] = filterStatus;

      const response = await ascGet<PaginatedResponse<Device>>("/devices", params);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({
              devices: response.data.map((d) => ({
                id: d.id,
                name: d.attributes.name,
                platform: d.attributes.platform,
                udid: d.attributes.udid,
                deviceClass: d.attributes.deviceClass,
                status: d.attributes.status,
                model: d.attributes.model,
                addedDate: d.attributes.addedDate,
              })),
            }, null, 2),
          },
        ],
      };
    }
  );
}
