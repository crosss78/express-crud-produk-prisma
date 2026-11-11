# Katalog Toko Alat Tulis — Express + Prisma + Neon PostgreSQL

**Laporan Evidence Tugas Express API: Prisma & Neon PostgreSQL**

| | |
| --- | --- |
| Nama | Muhamad Sabilil Haq |
| NRP | 5027251041 |
| Mata kuliah | Pemrograman Web |

Proyek ini melanjutkan tugas sebelumnya (CRUD Express dengan data di array/memori).
Sekarang data produk disimpan di **PostgreSQL (Neon)** dan diakses melalui **Prisma ORM**,
sehingga data tetap ada walaupun server dijalankan ulang.

---

## Evidence skenario & perubahan database

Setiap skenario menampilkan aksi di aplikasi serta kondisi tabel `products` di Neon
**sebelum** dan **sesudah** aksi dilakukan.

### 1. Migrasi: membuat tabel di Neon

Perintah `npx prisma migrate dev --name init` membaca `schema.prisma` lalu membuat tabel `products` di database Neon.

![Migrasi berhasil](docs/screenshots/01-migrate.png)

| Sebelum | Sesudah |
| --- | --- |
| ![Neon sebelum migrate](docs/screenshots/02-neon-before-migrate.png) | ![Neon sesudah migrate](docs/screenshots/03-neon-after-migrate.png) |

### 2. Seed: mengisi data awal

`npx prisma db seed` menjalankan `prisma/seed.ts` dan memasukkan 4 produk.

| Sebelum | Sesudah |
| --- | --- |
| Tabel kosong (lihat gambar sesudah migrasi di atas) | ![Neon sesudah seed](docs/screenshots/04-neon-after-seed.png) |

### 3. GET: menampilkan semua data

Ketika halaman dibuka, front-end mengirim `GET /api/products`. Controller menjalankan `prisma.product.findMany()`, dan data dari Neon tampil di tabel.

![GET semua produk](docs/screenshots/05-get-web.png)

<!-- SS: terminal log "GET /api/products -> 200" -->
![Log GET di terminal](docs/screenshots/06-get-terminal.png)

### 4. GET dengan pencarian (`?q=`)

Kolom pencarian mengirim `GET /api/products?q=pen`, lalu Prisma memfilter dengan `contains` (tidak membedakan huruf besar/kecil).

![GET pencarian](docs/screenshots/07-get-search.png)

### 5. POST: menambah produk

Form diisi **Penghapus Putih**, kategori Alat Tulis, harga 3000, stok 60. Front-end mengirim `POST /api/products`, server menjalankan `prisma.product.create()` dan membalas **201 Created**.

![Hasil POST di web](docs/screenshots/09-post-web.png)

| Database sebelum | Database sesudah |
| --- | --- |
| ![Neon sebelum POST](docs/screenshots/10-post-db-before.png) | ![Neon sesudah POST](docs/screenshots/11-post-db-after.png) |

### 6. PUT: mengubah produk

Tombol **Edit** pada *Pulpen Gel Hitam* mengisi form lewat `GET /api/products/2`. Harga diubah dari 5000 menjadi 6000 dan stok dari 120 menjadi 100. Front-end mengirim `PUT /api/products/2`, lalu `prisma.product.update()` dijalankan.

![Form PUT](docs/screenshots/12-put-form.png)

![Hasil PUT di web](docs/screenshots/13-put-web.png)

| Database sebelum | Database sesudah |
| --- | --- |
| ![Neon sebelum PUT](docs/screenshots/14-put-db-before.png) | ![Neon sesudah PUT](docs/screenshots/15-put-db-after.png) |

### 7. DELETE: menghapus produk

Tombol **Hapus** pada *Penggaris Besi 30 cm* (id 4) mengirim `DELETE /api/products/4`, lalu `prisma.product.delete()` dijalankan.

![Hasil DELETE di web](docs/screenshots/16-delete-web.png)

| Database sebelum | Database sesudah |
| --- | --- |
| ![Neon sebelum DELETE](docs/screenshots/17-delete-db-before.png) |  ![Neon sesudah DELETE](docs/screenshots/18-delete-db-after.png) |

### 8. Data tetap ada setelah server di-restart

Server dihentikan (`Ctrl + C`) lalu dijalankan lagi dengan `npm run dev`. Setelah halaman di-refresh, data hasil POST, PUT, dan DELETE tetap ada. Ini membuktikan data tersimpan di database, bukan di memori seperti pada tugas sebelumnya.

![Data tetap setelah restart](docs/screenshots/19-restart.png)

### 9. Skenario error

| Skenario | Request | Respons |
| --- | --- | --- |
| Body tidak valid | `POST /api/products` dengan `name` kosong | `400` `{"message":"name wajib diisi"}` |
| Produk tidak ada | `GET /api/products/999` | `404` `{"message":"Produk dengan id 999 tidak ditemukan"}` |
| Route tidak ada | `GET /alamat-lain` | `404` `{"message":"Route GET /alamat-lain tidak ditemukan"}` |

![Error 400](docs/screenshots/20-error-400.png)

![Error 404](docs/screenshots/21-error-404.png)
