import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

/**
 * Strips untrusted, caller-supplied forwarded headers in direct Next.js deployments
 * before handing requests to Better Auth, preventing throttle-bucket rotation (CWE-307).
 */
const secureAuthHandler = async (req: Request) => {
  const trustedProxies = process.env.TRUSTED_PROXIES;
  if (!trustedProxies) {
    const hasForwardedHeader =
      req.headers.has("x-forwarded-for") ||
      req.headers.has("x-real-ip") ||
      req.headers.has("client-ip") ||
      req.headers.has("x-client-ip") ||
      req.headers.has("cf-connecting-ip");

    if (hasForwardedHeader) {
      const sanitizedHeaders = new Headers(req.headers);
      sanitizedHeaders.delete("x-forwarded-for");
      sanitizedHeaders.delete("x-real-ip");
      sanitizedHeaders.delete("client-ip");
      sanitizedHeaders.delete("x-client-ip");
      sanitizedHeaders.delete("cf-connecting-ip");
      sanitizedHeaders.delete("true-client-ip");

      const sanitizedReq = new Request(req.url, {
        method: req.method,
        headers: sanitizedHeaders,
        body: req.body,
        // @ts-expect-error Node Fetch duplex option for streaming body
        duplex: "half",
      });
      return auth.handler(sanitizedReq);
    }
  }

  return auth.handler(req);
};

export const { GET, POST } = toNextJsHandler(secureAuthHandler);

