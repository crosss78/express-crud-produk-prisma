import { prisma } from '../src/lib/prisma';

const products = [
  { name: 'Buku Tulis 58 Lembar', category: 'Buku', price: 15000, stock: 40 },
  { name: 'Pulpen Gel Hitam', category: 'Alat Tulis', price: 5000, stock: 120 },
  { name: 'Pensil 2B', category: 'Alat Tulis', price: 3500, stock: 75 },
  { name: 'Penggaris Besi 30 cm', category: 'Perlengkapan', price: 12000, stock: 18 },
];

async function main() {
  const count = await prisma.product.count();
  if (count > 0) {
    console.log(`Tabel products sudah berisi ${count} data, seed dilewati.`);
    return;
  }
  await prisma.product.createMany({ data: products });
  console.log(`${products.length} produk awal berhasil ditambahkan.`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
