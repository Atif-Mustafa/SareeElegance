import "dotenv/config";
import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().min(1).max(65535).default(3001),
  CLIENT_ORIGIN: z.string().url().default('http://localhost:3000'),
  DATABASE_URL: z.string().url().default('postgresql://user:password@localhost:5432/saree_elegance?schema=public'),
  TEST_DATABASE_URL: z.string().url().optional(),
  INVENTORY_HOLD_MINUTES: z.coerce.number().int().positive().default(15),
});

export type ServerEnv = z.infer<typeof envSchema>;

function parseEnv(): ServerEnv {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    console.error('❌ Invalid server environment variables:', result.error.format());
    throw new Error('Invalid server environment configuration');
  }
  return result.data;
}

export const env = parseEnv();
