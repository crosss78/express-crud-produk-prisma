import type { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

interface ProductInput {
  name: string;
  category: string;
  price: number;
  stock: number;
}

// Memeriksa body request; mengembalikan pesan error atau data yang sudah bersih
function validate(body: unknown): { error: string } | { data: ProductInput } {
  const b = (body ?? {}) as Record<string, unknown>;
  const name = typeof b.name === 'string' ? b.name.trim() : '';
  const category = typeof b.category === 'string' ? b.category.trim() : '';
  const price = Number(b.price);
  const stock = Number(b.stock);

  if (!name) return { error: 'name wajib diisi' };
  if (!category) return { error: 'category wajib diisi' };
  if (!Number.isInteger(price) || price < 0) return { error: 'price harus bilangan bulat >= 0' };
  if (!Number.isInteger(stock) || stock < 0) return { error: 'stock harus bilangan bulat >= 0' };

  return { data: { name, category, price, stock } };
}

// Mengambil id dari URL; null jika bukan bilangan bulat positif
function parseId(req: Request): number | null {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

// Prisma melempar error P2025 ketika record yang akan diubah/dihapus tidak ada
function isNotFound(err: unknown): boolean {
  return typeof err === 'object' && err !== null && (err as { code?: string }).code === 'P2025';
}

function notFound(res: Response, id: unknown) {
  res.status(404).json({ message: `Produk dengan id ${id} tidak ditemukan` });
}

// GET /api/products  (opsional: ?q=kata untuk mencari berdasarkan nama)
export async function getAllProducts(req: Request, res: Response) {
  const q = typeof req.query.q === 'string' ? req.query.q.trim() : '';
  const products = await prisma.product.findMany({
    where: q ? { name: { contains: q, mode: 'insensitive' } } : undefined,
    orderBy: { id: 'asc' },
  });
  res.status(200).json(products);
}

// GET /api/products/:id
export async function getProductById(req: Request, res: Response) {
  const id = parseId(req);
  if (id === null) return notFound(res, req.params.id);

  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) return notFound(res, id);
  res.status(200).json(product);
}

// POST /api/products
export async function createProduct(req: Request, res: Response) {
  const result = validate(req.body);
  if ('error' in result) {
    res.status(400).json({ message: result.error });
    return;
  }
  const product = await prisma.product.create({ data: result.data });
  res.status(201).json(product);
}

// PUT /api/products/:id
export async function updateProduct(req: Request, res: Response) {
  const id = parseId(req);
  if (id === null) return notFound(res, req.params.id);

  const result = validate(req.body);
  if ('error' in result) {
    res.status(400).json({ message: result.error });
    return;
  }
  try {
    const product = await prisma.product.update({ where: { id }, data: result.data });
    res.status(200).json(product);
  } catch (err) {
    if (isNotFound(err)) return notFound(res, id);
    throw err;
  }
}

// DELETE /api/products/:id
export async function deleteProduct(req: Request, res: Response) {
  const id = parseId(req);
  if (id === null) return notFound(res, req.params.id);

  try {
    const deleted = await prisma.product.delete({ where: { id } });
    res.status(200).json({ message: 'Produk berhasil dihapus', data: deleted });
  } catch (err) {
    if (isNotFound(err)) return notFound(res, id);
    throw err;
  }
}
