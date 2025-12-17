<template>
  <nav class="navbar">
    <router-link to="/management">Manajemen Data</router-link> |
    <router-link to="/dashboard">Dashboard Analitik</router-link>
  </nav>
  <router-view />
</template>

<style>
  .navbar { 
    padding: 20px; background: #35495e; color: white; margin-bottom: 20px; 
  }
  .navbar a { 
    color: white; text-decoration: none; font-weight: bold; margin: 0 10px; 
  }
  .navbar a.router-link-active { 
    color: #42b983; 
  }
  body { 
    margin: 0; font-family: sans-serif; 
  }
</style>