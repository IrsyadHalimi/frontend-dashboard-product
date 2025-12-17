<template>
  <div class="dashboard-container">
    <h1>Dashboard Analitik</h1>

    <div class="filter-section">
      <label>Rentang Tanggal:</label>
      <input type="date" v-model="dateRange.start" @change="fetchStats">
      <span>sampai</span>
      <input type="date" v-model="dateRange.end" @change="fetchStats">
    </div>

    <div class="summary-grid">
      <div class="card">
        <h3>Total Item</h3>
        <p>{{ summary.totalItems }}</p>
      </div>
      <div class="card">
        <h3>Total Nilai</h3>
        <p>${{ summary.totalValue.toLocaleString() }}</p>
      </div>
      <div class="card">
        <h3>Kategori Terbanyak</h3>
        <p>{{ summary.topCategory }}</p>
      </div>
      <div class="card">
        <h3>Data Terbaru</h3>
        <p>{{ summary.latestItem }}</p>
      </div>
    </div>

    <div class="charts-grid">
      <div class="chart-box">
        <highcharts :options="pieOptions"></highcharts>
      </div>

      <div class="chart-box">
        <highcharts :options="columnOptions"></highcharts>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import axios from 'axios';

// State Tanggal (Default 1 bulan terakhir - Poin 5)
const today = new Date().toISOString().split('T')[0];
const lastMonth = new Date();
lastMonth.setMonth(lastMonth.getMonth() - 1);
const lastMonthStr = lastMonth.toISOString().split('T')[0];

const dateRange = ref({ start: lastMonthStr, end: today });
const summary = ref({ totalItems: 0, totalValue: 0 });

// Konfigurasi Chart
const pieOptions = ref({
  chart: { type: 'pie' },
  title: { text: 'Distribusi Kategori' },
  series: [{ name: 'Jumlah', data: [] }],
});

const columnOptions = ref({
  chart: { type: 'column' },
  title: { text: 'Agregasi Nilai per Tanggal' },
  xAxis: { categories: [] },
  series: [{ name: 'Total Nilai', data: [] }],
});

const fetchStats = async () => {
  try {
    const { data } = await axios.get('http://localhost:3000/api/dashboard/stats', {
      params: { startDate: dateRange.value.start, endDate: dateRange.value.end },
    });

    pieOptions.value = {
      ...pieOptions.value,
      series: [{
        name: 'Jumlah',
        data: data.categoryStats.map((c) => ({
          name: c.category,
          y: parseInt(c.total, 10),
        })),
      }],
    };

    columnOptions.value = {
      ...columnOptions.value,
      // Tambahkan ini untuk mencegah error formatting otomatis yang aneh
      lang: {
        decimalPoint: '.',
        thousandsSep: ','
      },
      xAxis: {
        categories: data.timelineStats.map((t) => t.date || '-'),
        crosshair: true
      },
      series: [{
        name: 'Total Nilai',
        data: data.timelineStats.map((t) => {
          const val = parseFloat(t.totalValue);
          return isNaN(val) ? 0 : val;
        }),
        color: '#42b983'
      }],
    };

    // Update Summary
    summary.value = data.summary;
  } catch (err) {
    console.error('Gagal memuat statistik');
  }
};

onMounted(fetchStats);
</script>

<style scoped>
  .dashboard-container { 
    padding: 20px; 
  }
  .filter-section { 
    margin-bottom: 30px; display: flex; gap: 10px; align-items: center; 
  }
  .summary-grid { 
    display: grid; grid-template-columns: repeat(2, 1fr); gap: 20px; margin-bottom: 30px; 
  }
  .card { 
    padding: 20px; background: #f8f9fa; border-left: 5px solid #42b983; box-shadow: 0 2px 4px rgba(0,0,0,0.1); 
  }
  .charts-grid { 
    display: grid; grid-template-columns: 1fr 1fr; gap: 20px; 
  }
  .chart-box { 
    background: white; padding: 15px; border-radius: 8px; border: 1px solid #eee; 
  }

  @media (max-width: 768px) {
    .charts-grid { 
      grid-template-columns: 1fr; 
    }   
  }
</style>