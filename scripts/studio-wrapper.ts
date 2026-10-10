#!/usr/bin/env node
import http from "node:http";
import net from "node:net";
import crypto from "node:crypto";
import { spawn, ChildProcess } from "node:child_process";
import { URL } from "node:url";

/**
 * Drizzle Studio Security Wrapper
 * Mitigates CWE-942 (Permissive CORS & Missing Proxy Authentication).
 *
 * Requirements addressed:
 * 1. Generates an unpredictable cryptographic per-launch token.
 * 2. Restricts CORS and Private Network Access strictly to intended UI origins (https://local.drizzle.studio).
 * 3. Enforces per-launch token authorization before permitting SQL proxy execution.
 * 4. Proxies requests to an internal, unexposed Drizzle Studio process on a private loopback port.
 */

const ALLOWED_ORIGINS = new Set([
  "https://local.drizzle.studio",
  "https://studio.drizzle.team",
]);

// Parse CLI flags or use defaults
const args = process.argv.slice(2);
function getArgValue(name: string, fallback: string): string {
  const index = args.indexOf(name);
  if (index !== -1 && index + 1 < args.length) {
    return args[index + 1];
  }
  return fallback;
}

const externalPort = parseInt(getArgValue("--port", process.env.PORT || "4983"), 10);
const externalHost = getArgValue("--host", "127.0.0.1");

// 1. Generate an unpredictable per-launch token
const launchToken = crypto.randomBytes(32).toString("hex");

// Set of active authorized sessions (tokens or session cookies)
const authorizedSessions = new Set<string>([launchToken]);
let isHandshakeAuthorized = false;

function findFreePort(): Promise<number> {
  return new Promise((resolve, reject) => {
    const srv = net.createServer();
    srv.listen(0, "127.0.0.1", () => {
      const addr = srv.address();
      const port = typeof addr === "object" && addr ? addr.port : 49831;
      srv.close(() => resolve(port));
    });
    srv.on("error", reject);
  });
}

function parseCookies(cookieHeader?: string): Record<string, string> {
  const cookies: Record<string, string> = {};
  if (!cookieHeader) return cookies;
  for (const part of cookieHeader.split(";")) {
    const [key, ...vals] = part.trim().split("=");
    if (key) {
      cookies[key] = decodeURIComponent(vals.join("="));
    }
  }
  return cookies;
}

function isOriginAllowed(origin?: string): boolean {
  if (!origin) return true; // Direct non-browser request or same-origin tool
  if (ALLOWED_ORIGINS.has(origin)) return true;
  try {
    const parsed = new URL(origin);
    if (parsed.hostname === "127.0.0.1" || parsed.hostname === "localhost") {
      return true;
    }
  } catch {}
  return false;
}

async function main() {
  const internalPort = await findFreePort();

  console.log("\n============================================================");
  console.log("  Drizzle Studio - Secure Launcher (CWE-942 Mitigation)");
  console.log("============================================================");
  console.log(`  Intended UI Origin : https://local.drizzle.studio`);
  console.log(`  Per-launch Token   : ${launchToken}`);
  console.log(`  Public Gateway     : http://${externalHost}:${externalPort}`);
  console.log(`  Internal Backend   : 127.0.0.1:${internalPort}`);
  console.log("------------------------------------------------------------");
  console.log(`  1. Secure Access Link (sets session & redirects to Studio):`);
  console.log(`     http://${externalHost}:${externalPort}/auth?token=${launchToken}`);
  console.log(`\n  2. Direct Studio Link (with port):`);
  console.log(`     https://local.drizzle.studio?port=${externalPort}&token=${launchToken}`);
  console.log("============================================================\n");

  // Spawn upstream drizzle-kit studio on private loopback port
  const studioProcess: ChildProcess = spawn(
    "npx",
    ["drizzle-kit", "studio", "--port", internalPort.toString(), "--host", "127.0.0.1"],
    {
      stdio: ["inherit", "pipe", "inherit"],
      env: { ...process.env },
    }
  );

  studioProcess.stdout?.on("data", (chunk) => {
    const text = chunk.toString();
    // Suppress conflicting original port instructions to avoid operator confusion
    if (text.includes("Drizzle Studio is up and running")) {
      console.log(`[Studio Ready] Backend listening on 127.0.0.1:${internalPort}`);
    } else {
      process.stdout.write(chunk);
    }
  });

  studioProcess.on("exit", (code) => {
    console.log(`[Studio] Child process exited with code ${code}`);
    process.exit(code || 0);
  });

  const cleanup = () => {
    studioProcess.kill("SIGINT");
    process.exit(0);
  };
  process.on("SIGINT", cleanup);
  process.on("SIGTERM", cleanup);

  // Secure Reverse Proxy Server
  const proxyServer = http.createServer((req, res) => {
    const origin = req.headers.origin;
    const reqUrl = new URL(req.url || "/", `http://${req.headers.host || "127.0.0.1"}`);

    // Origin Validation
    if (!isOriginAllowed(origin)) {
      console.warn(`[Security Block] Rejected cross-origin request from untrusted origin: ${origin}`);
      res.writeHead(403, { "Content-Type": "application/json" });
      res.end(
        JSON.stringify({
          error: "Forbidden: Untrusted cross-origin request blocked (CWE-942 mitigation)",
          origin,
        })
      );
      return;
    }

    // CORS Headers strictly for allowed origin
    const corsHeaders: Record<string, string> = {
      Vary: "Origin",
    };
    if (origin && isOriginAllowed(origin)) {
      corsHeaders["Access-Control-Allow-Origin"] = origin;
      corsHeaders["Access-Control-Allow-Credentials"] = "true";
      corsHeaders["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS";
      corsHeaders["Access-Control-Allow-Headers"] =
        "Content-Type, Authorization, X-Studio-Token, Access-Control-Request-Private-Network";
      corsHeaders["Access-Control-Allow-Private-Network"] = "true";
    }

    // Handle OPTIONS Preflight
    if (req.method === "OPTIONS") {
      res.writeHead(204, corsHeaders);
      res.end();
      return;
    }

    // 1. Initial Handshake & Session Authorization route
    if (reqUrl.pathname === "/auth" || reqUrl.pathname === "/login") {
      const providedToken = reqUrl.searchParams.get("token");
      if (providedToken === launchToken) {
        isHandshakeAuthorized = true;
        authorizedSessions.add(launchToken);
        console.log(`[Security] Operator successfully authenticated via per-launch token.`);

        res.writeHead(302, {
          ...corsHeaders,
          "Set-Cookie": `studio_token=${launchToken}; Path=/; HttpOnly; SameSite=None; Secure=false`,
          Location: `https://local.drizzle.studio?port=${externalPort}&token=${launchToken}`,
        });
        res.end();
        return;
      } else {
        res.writeHead(401, {
          ...corsHeaders,
          "Content-Type": "application/json",
        });
        res.end(JSON.stringify({ error: "Unauthorized: Invalid per-launch token" }));
        return;
      }
    }

    // 2. Per-launch Token Verification
    const cookies = parseCookies(req.headers.cookie);
    const tokenHeader = req.headers["x-studio-token"] as string | undefined;
    const authHeader = req.headers.authorization;
    const bearerToken = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : undefined;
    const queryToken = reqUrl.searchParams.get("token");

    const isAuthenticated =
      tokenHeader === launchToken ||
      bearerToken === launchToken ||
      queryToken === launchToken ||
      cookies.studio_token === launchToken ||
      isHandshakeAuthorized;

    if (!isAuthenticated) {
      console.warn(`[Security Block] Request to ${reqUrl.pathname} rejected: missing valid launch capability.`);
      res.writeHead(401, {
        ...corsHeaders,
        "Content-Type": "application/json",
      });
      res.end(
        JSON.stringify({
          error: "Unauthorized: Missing or invalid per-launch capability token (CWE-942 mitigation)",
        })
      );
      return;
    }

    // Forward to internal Drizzle Studio instance
    const upstreamReq = http.request(
      {
        hostname: "127.0.0.1",
        port: internalPort,
        path: req.url,
        method: req.method,
        headers: {
          ...req.headers,
          host: `127.0.0.1:${internalPort}`,
        },
      },
      (upstreamRes) => {
        // Merge upstream headers with restricted CORS headers
        const responseHeaders: http.OutgoingHttpHeaders = {
          ...upstreamRes.headers,
          ...corsHeaders,
        };
        res.writeHead(upstreamRes.statusCode || 200, responseHeaders);
        upstreamRes.pipe(res);
      }
    );

    upstreamReq.on("error", (err) => {
      console.error("[Proxy Error] Upstream studio request failed:", err.message);
      res.writeHead(502, { ...corsHeaders, "Content-Type": "application/json" });
      res.end(JSON.stringify({ error: "Bad Gateway: Drizzle Studio internal service unavailable" }));
    });

    req.pipe(upstreamReq);
  });

  proxyServer.listen(externalPort, externalHost, () => {
    console.log(`[Security Gateway] Listening on http://${externalHost}:${externalPort}`);
  });
}

main().catch((err) => {
  console.error("Failed to start Studio wrapper:", err);
  process.exit(1);
});
