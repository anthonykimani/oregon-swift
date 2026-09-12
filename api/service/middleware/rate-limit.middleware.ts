import { Request, Response, NextFunction } from "express";

export interface RateLimitOptions {
  windowMs: number;
  max: number;
  message?: string;
  scope?: string;
}

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();
const MAX_BUCKETS = 10_000;

function clientKey(req: Request, scope: string): string {
  const ip = req.ip || req.socket.remoteAddress || "unknown";
  return `${scope}:${ip}`;
}

function prune(now: number) {
  if (buckets.size <= MAX_BUCKETS) return;
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

/**
 * Small in-memory fixed-window rate limiter for public/unauthenticated
 * endpoints. Sufficient for a single API instance; swap for a shared store
 * (e.g. Redis) before running multiple replicas.
 */
export function rateLimit(options: RateLimitOptions) {
  const { windowMs, max, message = "Too many requests", scope = "default" } = options;

  return (req: Request, res: Response, next: NextFunction) => {
    const now = Date.now();
    const key = clientKey(req, scope);
    const bucket = buckets.get(key);

    if (!bucket || bucket.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      prune(now);
      next();
      return;
    }

    if (bucket.count >= max) {
      res.status(429).json({
        status: 429,
        message,
        data: null,
        errors: ["Rate limit exceeded"],
      });
      return;
    }

    bucket.count += 1;
    next();
  };
}
