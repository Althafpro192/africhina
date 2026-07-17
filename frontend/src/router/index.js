import { createRouter, createWebHistory } from 'vue-router';

// Buyer Pages
const Dashboard = () => import('../views/buyer/Dashboard.vue');
const RFQCreate = () => import('../views/buyer/RFQCreate.vue');
const RequestDetail = () => import('../views/buyer/RequestDetail.vue');

// Admin Pages
const AdminDashboard = () => import('../views/admin/Dashboard.vue');
const AdminSuppliers = () => import('../views/admin/Suppliers.vue');

// Auth Pages
const Login = () => import('../views/auth/Login.vue');

const routes = [
  { path: '/', redirect: '/buyer/dashboard' },
  { path: '/login', component: Login },
  { path: '/buyer/dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { path: '/buyer/rfq/create', component: RFQCreate, meta: { requiresAuth: true } },
  { path: '/buyer/rfq/:id', component: RequestDetail, meta: { requiresAuth: true } },
  
  // Admin Routes
  { path: '/admin/dashboard', component: AdminDashboard, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/suppliers', component: AdminSuppliers, meta: { requiresAuth: true, requiresAdmin: true } }
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

router.beforeEach((to, from, next) => {
  const userString = localStorage.getItem('user');
  const user = userString ? JSON.parse(userString) : null;
  const isAuthenticated = !!user;
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login');
  } else if (to.meta.requiresAdmin && user?.role !== 'admin') {
    next('/buyer/dashboard');
  } else if (to.path === '/login' && isAuthenticated) {
    next(user.role === 'admin' ? '/admin/dashboard' : '/buyer/dashboard');
  } else {
    next();
  }
});

export default router;