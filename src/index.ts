// server.ts
import { Elysia } from "elysia";
import { cors } from "@elysiajs/cors";

// Load environment variables
const API_KEY = process.env.API_KEY || "your_secure_key";
const ALLOWED_ORIGINS = process.env.ALLOWED_ORIGINS?.split(",") || [];
const RATE_LIMIT = process.env.RATE_LIMIT
  ? Number(process.env.RATE_LIMIT)
  : 100;

const app = new Elysia()
  // Security headers
  // .use(staticPlugin())
  // .use(
  //   cors({
  //     origin: ALLOWED_ORIGINS,
  //     allowedHeaders: ['Content-Type', 'X-API-KEY'],
  //     methods: ['POST']
  //   })
  // )
  .use(cors())
  // .use(
  //   rateLimit({
  //     duration: 60_000, // 1 minute
  //     max: RATE_LIMIT,
  //     generator: (req) => req.headers.get('cf-connecting-ip') || req.ip
  //   })
  // )
  // API key validation
  // .derive(({ headers, error }) => {
  //   const apiKey = headers['x-api-key'];

  //   if (apiKey !== API_KEY) {
  //     return error(403, {
  //       error: 'Unauthorized',
  //       message: 'Invalid API key'
  //     });
  //   }
  // })
  // Proxy endpoint
  .post("/proxy/expo-push-token", async ({ body, error }) => {
    try {
      const expoResponse = await fetch(
        "https://exp.host/--/api/v2/push/getExpoPushToken",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept-Encoding": "gzip, deflate",
          },
          body: JSON.stringify(body),
        }
      );
      console.log("res", expoResponse);

      if (!expoResponse.ok) {
        return error(expoResponse.status, {
          error: "Expo Service Error",
          details: await expoResponse.text(),
        });
      }

      return expoResponse.json();
    } catch (err) {
      console.error(err);
      return error(500, {
        error: "Proxy Error",
        details: err instanceof Error ? err.message : "Unknown error",
      });
    }
  })
  // Health check
  .get("/health", () => ({ status: "ok" }))
  .listen(process.env.PORT || 3000);

console.log(
  `🦊 Proxy server running at ${app.server?.hostname}:${app.server?.port}`
);

export type App = typeof app;
