import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  // Perintah CLI (migrate, studio) memakai koneksi langsung / tanpa pooler
  datasource: {
    url: env('DATABASE_URL_UNPOOLED'),
  },
});
