import { createRouter, createWebHistory } from 'vue-router';

// Buyer Pages
import Dashboard from '../views/Dashboard.vue';
import NewRequest from '../views/NewRequest.vue';
import RequestDetail from '../views/RequestDetail.vue';

// Admin Pages
import AdminDashboard from '../views/AdminDashboard.vue';
import AdminRequests from '../views/AdminRequests.vue';
import AdminSuppliers from '../views/AdminSuppliers.vue';

// Auth Pages
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/request/new', component: NewRequest, meta: { requiresAuth: true } },
  { path: '/request/:id', component: RequestDetail, meta: { requiresAuth: true } },
  
  // Admin Routes
  { path: '/admin', component: AdminDashboard, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/requests', component: AdminRequests, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/suppliers', component: AdminSuppliers, meta: { requiresAuth: true, requiresAdmin: true } },
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
  } else if ((to.path === '/login' || to.path === '/register') && token) {
    next(user.role === 'admin' ? '/admin' : '/dashboard');
  } else {
    next();
  }
});

export default router;