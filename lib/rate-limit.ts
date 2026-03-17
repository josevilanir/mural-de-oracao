import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

// Redis é opcional — sem as env vars o rate limiting é desabilitado (útil em dev)
const redis =
  process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN
    ? Redis.fromEnv()
    : null;

function makeLimiter(requests: number, window: Parameters<typeof Ratelimit.slidingWindow>[1]) {
  if (!redis) return null;
  return new Ratelimit({ redis, limiter: Ratelimit.slidingWindow(requests, window) });
}

// Limites por tipo de ação
const limiters = {
  pray:    makeLimiter(20, "1 m"),   // 20 orações por minuto
  comment: makeLimiter(10, "1 m"),   // 10 comentários por minuto
  prayer:  makeLimiter(5,  "1 h"),   // 5 pedidos por hora
  join:    makeLimiter(10, "1 m"),   // 10 solicitações de entrada por minuto
} as const;

/**
 * Verifica o rate limit para um tipo de ação e um identificador (userId ou IP).
 * Retorna { success: true } quando dentro do limite, ou { success: false, error } quando excedido.
 * Quando Redis não está configurado, sempre retorna { success: true }.
 */
export async function checkRateLimit(
  type: keyof typeof limiters,
  identifier: string
): Promise<{ success: boolean; error?: string }> {
  const limiter = limiters[type];
  if (!limiter) return { success: true };

  const result = await limiter.limit(identifier);
  if (!result.success) {
    return { success: false, error: "Muitas requisições. Tente novamente em instantes." };
  }
  return { success: true };
}
