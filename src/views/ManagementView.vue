<template>
  <div class="management-container">
    <div class="header-section">
      <h1>Manajemen Data</h1>
      <button @click="openModal()" class="btn-create">+ Tambah Data Manual</button>
    </div>

    <div class="sync-section">
      <button @click="handleSync" :disabled="isSyncing" class="btn-sync">
        {{ isSyncing ? 'Sedang Sinkronisasi...' : 'Sync Data Terbaru' }}
      </button>
      <p v-if="lastSyncTime" class="sync-time">
        Terakhir Sinkronisasi: {{ formatDate(lastSyncTime) }}
      </p>
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
          <th @click="setSort('id')">ID {{ sortKey === 'id' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕' }}</th>
          <th @click="setSort('name')">Nama Produk {{ sortKey === 'name' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕' }}</th>
          <th @click="setSort('category')">Kategori {{ sortKey === 'category' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕' }}</th>
          <th @click="setSort('value')">Harga/Nilai {{ sortKey === 'value' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕' }}</th>
          <th @click="setSort('updatedAt')">Terakhir Update {{ sortKey === 'updatedAt' ? (sortOrder === 'asc' ? '▲' : '▼') : '↕' }}</th>
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
            <button @click="openModal(item)" class="btn-edit">Edit</button>
            <button @click="deleteItem(item.id)" class="btn-delete">Hapus</button>
          </td>
        </tr>
        <tr v-if="filteredAndSortedItems.length === 0">
          <td colspan="6" style="text-align: center;">Tidak ada data ditemukan</td>
        </tr>
      </tbody>
    </table>

    <div v-if="showModal" class="modal-overlay">
      <div class="modal-content">
        <h3>{{ isEdit ? 'Edit Data' : 'Tambah Data Baru' }}</h3>
        <form @submit.prevent="saveData">
          <div class="form-group">
            <label>Nama Produk:</label>
            <input v-model="form.name" required placeholder="Masukkan nama produk">
          </div>
          
          <div class="form-group">
            <label>Kategori:</label>
            <input v-model="form.category" required placeholder="Masukkan kategori">
          </div>
          
          <div class="form-group">
            <label>Nilai/Harga:</label>
            <input type="number" v-model="form.value" required>
          </div>
          
          <div class="form-group">
            <label>Tanggal:</label>
            <input type="date" v-model="form.date" required>
          </div>
          
          <div class="modal-footer">
            <button type="button" @click="showModal = false" class="btn-cancel">Batal</button>
            <button type="submit" class="btn-save">
              {{ isEdit ? 'Update' : 'Simpan' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue';
import axios from 'axios';

// --- STATE ---
const items = ref([]);
const isSyncing = ref(false);
const lastSyncTime = ref(null);
const searchQuery = ref('');
const sortKey = ref('updatedAt');
const sortOrder = ref('desc');
const filters = ref({ name: '', category: '' });

// State Modal
const showModal = ref(false);
const isEdit = ref(false);
const currentId = ref(null);
const form = ref({ name: '', category: '', value: 0, date: '' });

// --- METHODS ---

const fetchData = async () => {
  try {
    const response = await axios.get('http://localhost:3000/api/items');
    items.value = response.data;
    
    const syncStatus = await axios.get('http://localhost:3000/api/sync/status');
    lastSyncTime.value = syncStatus.data.last_sync;
  } catch (err) {
    console.error('Gagal mengambil data:', err);
  }
};

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

const openModal = (item = null) => {
  if (item) {
    isEdit.value = true;
    currentId.value = item.id;
    form.value = { 
      name: item.name, 
      category: item.category, 
      value: item.value, 
      date: item.date 
    };
  } else {
    isEdit.value = false;
    form.value = { 
      name: '', 
      category: '', 
      value: 0, 
      date: new Date().toISOString().split('T')[0] 
    };
  }
  showModal.value = true;
};

const saveData = async () => {
  try {
    if (isEdit.value) {
      await axios.put(`http://localhost:3000/api/items/${currentId.value}`, form.value);
    } else {
      await axios.post('http://localhost:3000/api/items', form.value);
    }
    showModal.value = false;
    await fetchData();
  } catch (err) {
    alert('Gagal menyimpan data');
  }
};

const setSort = (key) => {
  if (sortKey.value === key) {
    sortOrder.value = sortOrder.value === 'asc' ? 'desc' : 'asc';
  } else {
    sortKey.value = key;
    sortOrder.value = 'asc';
  }
};

const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleString('id-ID');
};

// --- COMPUTED (Filtering & Sorting) ---
const filteredAndSortedItems = computed(() => {
  let result = [...items.value];

  if (searchQuery.value) {
    const q = searchQuery.value.toLowerCase();
    result = result.filter((i) => 
      i.name.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)
    );
  }

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

  result.sort((a, b) => {
    let modifier = sortOrder.value === 'asc' ? 1 : -1;
    if (a[sortKey.value] < b[sortKey.value]) return -1 * modifier;
    if (a[sortKey.value] > b[sortKey.value]) return 1 * modifier;
    return 0;
  });

  return result;
});

onMounted(fetchData);
</script>

<style scoped>
.management-container { 
  padding: 20px; font-family: sans-serif; 
}
.header-section { 
  display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px; 
}

.sync-section { 
  margin-bottom: 20px; background: #f9f9f9; padding: 15px; border-radius: 8px; 
}
.sync-time { 
  font-size: 0.9em; color: #666; margin-top: 5px; 
}

.table-controls { 
  margin-bottom: 15px; 
}
.input-search { 
  padding: 10px; width: 300px; border: 1px solid #ddd; border-radius: 4px; 
}

.data-table { 
  width: 100%; border-collapse: collapse; 
}
.data-table th, .data-table td { 
  border: 1px solid #ddd; padding: 12px; text-align: left; 
}
.data-table th { 
  background-color: #f4f4f4; cursor: pointer; user-select: none; 
}
.filter-row input { 
  width: 100%; padding: 6px; box-sizing: border-box; border: 1px solid #eee; 
}

.badge { 
  background: #e0f2f1; color: #00796b; padding: 4px 10px; border-radius: 20px; font-size: 0.85em; 
}

.btn-sync { 
  background: #42b983; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; 
}
.btn-create { 
  background: #2196F3; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; font-weight: bold; 
}
.btn-edit { 
  background: #ffc107; color: #000; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; margin-right: 5px; 
}
.btn-delete { 
  background: #ff5252; color: white; border: none; padding: 6px 12px; border-radius: 4px; cursor: pointer; 
}

/* Modal Styles */
.modal-overlay { 
  position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.6); display: flex; justify-content: center; align-items: center; z-index: 1000; 
}
.modal-content { 
  background: white; padding: 30px; border-radius: 12px; width: 450px; box-shadow: 0 5px 15px rgba(0,0,0,0.3); 
}
.form-group { 
  margin-bottom: 15px; 
}
.form-group label { 
  display: block; margin-bottom: 5px; font-weight: bold; 
}
.form-group input { 
  width: 100%; padding: 10px; border: 1px solid #ddd; border-radius: 4px; 
}
.modal-footer { 
  display: flex; justify-content: flex-end; gap: 10px; margin-top: 20px; 
}
.btn-cancel { 
  background: #eee; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; 
}
.btn-save { 
  background: #42b983; color: white; border: none; padding: 10px 20px; border-radius: 4px; cursor: pointer; 
}
</style>