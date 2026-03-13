import path from "node:path";
import { defineConfig } from "prisma/config";
import * as dotenv from "dotenv";

// Carrega as variáveis do .env explicitamente
dotenv.config();

export default defineConfig({
  schema: path.join("prisma", "schema.prisma"),
  datasource: {
    url: process.env.DATABASE_URL as string,
  },
});
