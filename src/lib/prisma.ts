import 'dotenv/config';
import { PrismaNeon } from '@prisma/adapter-neon';
import { PrismaClient } from '../../generated/prisma';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL belum diisi. Salin .env.example menjadi .env lalu isi connection string Neon.');
}

// Aplikasi memakai pooled connection Neon melalui driver adapter
const adapter = new PrismaNeon({ connectionString: process.env.DATABASE_URL });

export const prisma = new PrismaClient({ adapter });
