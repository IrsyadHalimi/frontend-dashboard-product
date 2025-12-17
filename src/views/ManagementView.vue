<template>
  <div class="management-container">
    <h1>Manajemen Data</h1>

    <div class="sync-section">
      <button @click="handleSync" :disabled="isSyncing" class="btn-sync">
        {{ isSyncing ? 'Sedang Sinkronisasi...' : 'Sync Data Terbaru' }}
      </button>
      <p v-if="lastSyncTime">Terakhir Sinkronisasi: {{ formatDate(lastSyncTime) }}</p>
    </div>

    <div class="table-controls">
      <input 
        v-model="searchQuery" 
        placeholder="Cari data (Nama/Kategori)..." 
        class="input-search"
      />
    </div>

    <table class="data-table">
      <thead>
        <tr>
          <th @click="setSort('id')">ID ↕</th>
          <th @click="setSort('name')">Nama Produk ↕</th>
          <th @click="setSort('category')">Kategori ↕</th>
          <th @click="setSort('value')">Harga/Nilai ↕</th>
          <th @click="setSort('updatedAt')">Terakhir Update ↕</th>
          <th>Aksi</th>
        </tr>
        <tr class="filter-row">
          <td></td>
          <td><input v-model="filters.name" placeholder="Filter nama..."></td>
          <td><input v-model="filters.category" placeholder="Filter kategori..."></td>
          <td></td>
          <td></td>
          <td></td>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in filteredAndSortedItems" :key="item.id">
          <td>{{ item.id }}</td>
          <td>{{ item.name }}</td>
          <td><span class="badge">{{ item.category }}</span></td>
          <td>${{ item.value }}</td>
          <td>{{ formatDate(item.updatedAt) }}</td>
          <td>
            <button @click="deleteItem(item.id)" class="btn-delete">Hapus</button>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

// State
const items = ref([]);
const isSyncing = ref(false);
const lastSyncTime = ref(null);
const searchQuery = ref('');
const sortKey = ref('updatedAt'); // Default sorting (Poin 3)
const sortOrder = ref('desc');
const filters = ref({
  name: '',
  category: '',
});

// Fetch Data dari API Backend
const fetchData = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/items');
    items.value = response.data;
    
    const syncStatus = await axios.get('http://localhost:3000/api/sync/status');
    lastSyncTime.value = syncStatus.data.last_sync;
  } catch (err) {
    alert('Gagal mengambil data');
  }
};

// Logika Sinkronisasi (Poin 2)
const handleSync = async () => {
  isSyncing.value = true;
  try {
    await axios.post('http://localhost:3000/api/sync');
    await fetchData();
    alert('Sinkronisasi berhasil!');
  } catch (err) {
    alert('Sync Gagal');
  } finally {
    isSyncing.value = false;
  }
};

// Logika Hapus (Poin 3 - CRUD)
const deleteItem = async (id) => {
  if (confirm('Apakah Anda yakin ingin menghapus data ini?')) {
    try {
      await axios.delete(`http://localhost:3000/api/items/${id}`);
      items.value = items.value.filter((i) => i.id !== id);
    } catch (err) {
      alert('Gagal menghapus');
    }
  }
};

// Logika Sorting
const setSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};

// Poin 3: Pencarian, Sorting, dan Filtering
const filteredAndSortedItems = computed(() => {
  let result = [...items.value];

  // 1. Filter Global Search
  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter((i) => 
      i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)
    );
  }

  // 2. Filter Per Kolom
  if (filters.value.name) {
    result = result.filter((i) => 
      i.name.toLowerCase().includes(filters.value.name.toLowerCase())
    );
  }
  if (filters.value.category) {
    result = result.filter((i) => 
      i.category.toLowerCase().includes(filters.value.category.toLowerCase())
    );
  }

  // 3. Sorting
  result.sort((a, b) => {
    let modifier = sortOrder.value === 'asc' ? 1 : -1;
    if (a[sortKey.value] < b[sortKey.value]) return -1 * modifier;
    if (a[sortKey.value] > b[sortKey.value]) return 1 * modifier;
    return 0;
  });

  return result;
});

const formatDate = (dateStr) => {
  return new Date(dateStr).toLocaleString('id-ID');
};

onMounted(fetchData);
</script>

<style scoped>
.management-container { padding: 20px; font-family: 'Arial', sans-serif; }
.sync-section { margin-bottom: 20px; display: flex; align-items: center; gap: 15px; }
.btn-sync { background: #42b983; color: white; border: none; padding: 10px 15px; border-radius: 4px; cursor: pointer; }
.btn-sync:disabled { background: #ccc; }
.input-search { padding: 8px; width: 300px; margin-bottom: 15px; }
.data-table { width: 100%; border-collapse: collapse; margin-top: 10px; }
.data-table th, .data-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
.data-table th { background-color: #f4f4f4; cursor: pointer; }
.filter-row input { width: 100%; padding: 5px; box-sizing: border-box; }
.badge { background: #e0f2f1; color: #00796b; padding: 4px 8px; border-radius: 12px; font-size: 0.8em; }
.btn-delete { background: #ff5252; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer; }
</style>