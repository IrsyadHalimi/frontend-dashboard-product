# Frontend Vue – Item Management Dashboard

## Deskripsi

Frontend ini dibangun menggunakan **Vue 3 (Composition API)** untuk mengelola data yang berasal dari **API Backend**. Aplikasi menyediakan fitur manajemen data (CRUD), sinkronisasi data dari API publik, serta tabel interaktif dengan pencarian, filter, dan sorting.

## Fitur Utama

### 1. Manajemen Data Item

* Menampilkan daftar item dari backend
* Tambah, edit, dan hapus data item (CRUD)
* Sinkronisasi data dari Public API
* Menampilkan waktu sinkronisasi terakhir
* Pencarian global (nama & kategori)
* Filter per kolom (nama & kategori)
* Sorting kolom (ASC / DESC)

### 2. Dashboard Analitik

* Ringkasan data (Total Item, Total Nilai, Kategori Terbanyak, Data Terbaru)
* Filter rentang tanggal (default 1 bulan terakhir)
* Pie Chart distribusi item per kategori
* Column Chart agregasi total nilai per tanggal
* Data dashboard bersumber dari API backend

## Alur Aplikasi
1. Frontend mengambil data item dari API backend
2. User dapat melakukan CRUD dan sinkronisasi data
3. Dashboard mengambil data agregasi berdasarkan rentang tanggal
4. Data ditampilkan dalam bentuk summary dan grafik

## Integrasi API

* `GET /api/items` → Ambil data item
* `POST /api/items` → Tambah data manual
* `PUT /api/items/:id` → Update data
* `DELETE /api/items/:id` → Hapus data
* `POST /api/sync` → Sinkronisasi data API publik
* `GET /api/sync/status` → Cek waktu sinkronisasi
* `GET /api/dashboard/stats` → Data dashboard analitik


# frontend-dashboard

This template should help get you started developing with Vue 3 in Vite.

## Recommended IDE Setup

[VS Code](https://code.visualstudio.com/) + [Vue (Official)](https://marketplace.visualstudio.com/items?itemName=Vue.volar) (and disable Vetur).

## Recommended Browser Setup

- Chromium-based browsers (Chrome, Edge, Brave, etc.):
  - [Vue.js devtools](https://chromewebstore.google.com/detail/vuejs-devtools/nhdogjmejiglipccpnnnanhbledajbpd) 
  - [Turn on Custom Object Formatter in Chrome DevTools](http://bit.ly/object-formatters)
- Firefox:
  - [Vue.js devtools](https://addons.mozilla.org/en-US/firefox/addon/vue-js-devtools/)
  - [Turn on Custom Object Formatter in Firefox DevTools](https://fxdx.dev/firefox-devtools-custom-object-formatters/)

## Customize configuration

See [Vite Configuration Reference](https://vite.dev/config/).

## Project Setup

```sh
npm install
```

### Compile and Hot-Reload for Development

```sh
npm run dev
```

### Compile and Minify for Production

```sh
npm run build
```

### Lint with [ESLint](https://eslint.org/)

```sh
npm run lint
```
