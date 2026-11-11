import path from 'path';
import express, { NextFunction, Request, Response } from 'express';
import { requestLogger } from './middleware/request-logger';
import productRouter from './routes/product.routes';

const app = express();

// Middleware: parser JSON harus dipasang sebelum router agar req.body terisi
app.use(express.json());
app.use(requestLogger);

// Front-end (HTML, CSS, JS) disajikan dari folder public/
app.use(express.static(path.join(__dirname, '..', 'public')));

// Router API produk
app.use('/api/products', productRouter);

// 404 untuk alamat API yang tidak memiliki handler
app.use((req: Request, res: Response) => {
  res.status(404).json({ message: `Route ${req.method} ${req.originalUrl} tidak ditemukan` });
});

// 500 untuk error tak terduga, misalnya database tidak bisa dihubungi.
// Express 5 meneruskan error dari handler async ke sini secara otomatis.
app.use((err: unknown, req: Request, res: Response, _next: NextFunction) => {
  console.error(err);
  res.status(500).json({ message: 'Terjadi kesalahan pada server' });
});

export default app;
