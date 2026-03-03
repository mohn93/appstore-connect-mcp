import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { ascGet, ascPost, type PaginatedResponse } from "../client/api-client.js";
import type { BetaGroup, BetaTester } from "../types/asc-api.js";

function formatBetaGroup(group: BetaGroup): Record<string, unknown> {
  return {
    id: group.id,
    name: group.attributes.name,
    isInternalGroup: group.attributes.isInternalGroup,
    hasAccessToAllBuilds: group.attributes.hasAccessToAllBuilds,
    publicLinkEnabled: group.attributes.publicLinkEnabled,
    publicLink: group.attributes.publicLink,
    feedbackEnabled: group.attributes.feedbackEnabled,
    createdDate: group.attributes.createdDate,
  };
}

function formatBetaTester(tester: BetaTester): Record<string, unknown> {
  return {
    id: tester.id,
    firstName: tester.attributes.firstName,
    lastName: tester.attributes.lastName,
    email: tester.attributes.email,
    inviteType: tester.attributes.inviteType,
    state: tester.attributes.state,
  };
}

export function registerTestFlightTools(server: McpServer): void {
  server.tool(
    "list_beta_groups",
    "List TestFlight beta groups for an app",
    {
      appId: z.string().describe("The App Store Connect app ID"),
      limit: z.number().min(1).max(200).optional()
        .describe("Number of groups to return (default 50)"),
    },
    async ({ appId, limit }) => {
      const params: Record<string, string> = {
        "filter[app]": appId,
        "fields[betaGroups]": "name,isInternalGroup,hasAccessToAllBuilds,publicLinkEnabled,publicLink,feedbackEnabled,createdDate",
        limit: String(limit ?? 50),
      };

      const response = await ascGet<PaginatedResponse<BetaGroup>>("/betaGroups", params);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ betaGroups: response.data.map(formatBetaGroup) }, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "list_beta_testers",
    "List beta testers, optionally filtered by beta group",
    {
      betaGroupId: z.string().optional()
        .describe("Filter testers by beta group ID"),
      filterEmail: z.string().optional()
        .describe("Filter testers by email address"),
      limit: z.number().min(1).max(200).optional()
        .describe("Number of testers to return (default 50)"),
    },
    async ({ betaGroupId, filterEmail, limit }) => {
      const params: Record<string, string> = {
        "fields[betaTesters]": "firstName,lastName,email,inviteType,state",
        limit: String(limit ?? 50),
      };

      if (filterEmail) params["filter[email]"] = filterEmail;

      const path = betaGroupId
        ? `/betaGroups/${betaGroupId}/betaTesters`
        : "/betaTesters";

      const response = await ascGet<PaginatedResponse<BetaTester>>(path, params);

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify({ betaTesters: response.data.map(formatBetaTester) }, null, 2),
          },
        ],
      };
    }
  );

  server.tool(
    "add_beta_tester",
    "Add a beta tester to a beta group by email",
    {
      betaGroupId: z.string().describe("The beta group ID to add the tester to"),
      email: z.string().email().describe("Email address of the tester"),
      firstName: z.string().optional().describe("Tester's first name"),
      lastName: z.string().optional().describe("Tester's last name"),
    },
    async ({ betaGroupId, email, firstName, lastName }) => {
      const response = await ascPost<{ data: BetaTester }>("/betaTesters", {
        data: {
          type: "betaTesters",
          attributes: {
            email,
            ...(firstName && { firstName }),
            ...(lastName && { lastName }),
          },
          relationships: {
            betaGroups: {
              data: [{ type: "betaGroups", id: betaGroupId }],
            },
          },
        },
      });

      return {
        content: [
          {
            type: "text" as const,
            text: JSON.stringify(
              { message: `Tester ${email} added to beta group`, tester: formatBetaTester(response.data) },
              null,
              2
            ),
          },
        ],
      };
    }
  );
}
