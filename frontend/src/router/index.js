import { createRouter, createWebHistory } from 'vue-router';

// Buyer Pages
import Dashboard from '../views/Dashboard.vue';
import RequestDetails from '../views/RequestDetails.vue';
import OrderDetail from '../views/OrderDetail.vue';

// Admin Pages
import AdminDashboard from '../views/AdminDashboard.vue';

// Auth Pages
import Login from '../views/Login.vue';

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', component: Login },
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/request/new', component: RequestDetails, meta: { requiresAuth: true } },
  { path: '/request/:id', component: OrderDetail, meta: { requiresAuth: true } },
  
  // Admin Routes
  { path: '/admin', component: AdminDashboard, meta: { requiresAuth: true, requiresAdmin: true } }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  
  if (to.meta.requiresAuth && !token) {
    next('/login');
  } else if (to.meta.requiresAdmin && user.role !== 'admin') {
    next('/dashboard');
  } else if (to.path === '/login' && token) {
    next(user.role === 'admin' ? '/admin' : '/dashboard');
  } else {
    next();
  }
});

export default router;