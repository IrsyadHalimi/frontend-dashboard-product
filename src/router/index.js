import { createRouter, createWebHistory } from 'vue-router';
import ManagementView from '../views/ManagementView.vue';

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      redirect: '/management',
    },
    {
      path: '/management',
      name: 'management',
      component: ManagementView,
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: () => import('../views/DashboardView.vue'),
    },
  ],
});

export default router;