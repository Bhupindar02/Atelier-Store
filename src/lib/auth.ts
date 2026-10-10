import { betterAuth, type BetterAuthPlugin } from "better-auth";
import { APIError, createAuthEndpoint, sensitiveSessionMiddleware } from "better-auth/api";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { and, eq, ne } from "drizzle-orm";
import { db } from "@/db";
import * as schema from "@/db/schema";
import { session as sessionTable } from "@/db/schema/auth";

/**
 * Mitigation for CWE-613 (Broken auth in revoke-other-sessions).
 * Overrides Better Auth's default revoke-other-sessions endpoint to atomically
 * revoke ALL sessions belonging to the user except the current token via a direct
 * bulk predicate, eliminating pagination/default query limit truncation.
 */
const sessionRevocationPlugin: BetterAuthPlugin = {
  id: "session-revocation-bulk-fix",
  endpoints: {
    revokeOtherSessions: createAuthEndpoint(
      "/revoke-other-sessions",
      {
        method: "POST",
        requireHeaders: true,
        use: [sensitiveSessionMiddleware],
        metadata: {
          openapi: {
            description: "Revoke all other sessions for the user except the current one",
            responses: {
              "200": {
                description: "Success",
                content: {
                  "application/json": {
                    schema: {
                      type: "object",
                      properties: {
                        status: {
                          type: "boolean",
                          description: "Indicates if all other sessions were revoked successfully",
                        },
                      },
                      required: ["status"],
                    },
                  },
                },
              },
            },
          },
        },
      },
      async (ctx) => {
        const currentSession = ctx.context.session;
        if (!currentSession?.user?.id) {
          throw APIError.from("UNAUTHORIZED", {
            message: "Unauthorized",
            code: "UNAUTHORIZED",
          });
        }

        await db
          .delete(sessionTable)
          .where(
            and(
              eq(sessionTable.userId, currentSession.user.id),
              ne(sessionTable.token, currentSession.session.token)
            )
          );

        return ctx.json({ status: true });
      }
    ),
  },
};

/**
 * Safely escapes control characters (CR, LF, etc.) from log messages
 * to prevent log injection / log forging (CWE-117).
 */
function sanitizeLogOutput(value: unknown): unknown {
  if (typeof value !== "string") return value;
  return value.replace(/[\r\n\x00-\x1f\x7f-\x9f]/g, (char) => {
    switch (char) {
      case "\r": return "\\r";
      case "\n": return "\\n";
      case "\t": return "\\t";
      default: return `\\u${char.charCodeAt(0).toString(16).padStart(4, "0")}`;
    }
  });
}

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
  },
  rateLimit: {
    enabled: true,
  },
  advanced: {
    ipAddress: {
      // Only trust reverse proxies when explicitly configured via TRUSTED_PROXIES
      trustedProxies: process.env.TRUSTED_PROXIES
        ? process.env.TRUSTED_PROXIES.split(",").map((s) => s.trim()).filter(Boolean)
        : undefined,
      // When running directly without a trusted ingress, do not trust caller-supplied X-Forwarded-For
      ipAddressHeaders: process.env.TRUSTED_PROXIES
        ? ["x-forwarded-for"]
        : ["x-trusted-client-ip"],
    },
  },
  logger: {
    log(level, message, ...args) {
      const cleanMessage = sanitizeLogOutput(message) as string;
      const cleanArgs = args.map((arg) => sanitizeLogOutput(arg));
      if (level === "error") {
        console.error(`[Better Auth error]:`, cleanMessage, ...cleanArgs);
      } else if (level === "warn") {
        console.warn(`[Better Auth warn]:`, cleanMessage, ...cleanArgs);
      } else {
        console.log(`[Better Auth ${level}]:`, cleanMessage, ...cleanArgs);
      }
    },
  },
  plugins: [sessionRevocationPlugin],
});

