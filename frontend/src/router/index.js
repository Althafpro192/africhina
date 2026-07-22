import { createRouter, createWebHistory } from 'vue-router';

// Buyer Pages
const Dashboard = () => import('../views/buyer/Dashboard.vue');
const Requests = () => import('../views/buyer/Requests.vue');
const Orders = () => import('../views/buyer/Orders.vue');
const Suppliers = () => import('../views/buyer/Suppliers.vue');
const Logistics = () => import('../views/buyer/Logistics.vue');
const Settings = () => import('../views/buyer/Settings.vue');
const Sourcing = () => import('../views/buyer/Sourcing.vue');
const RFQCreate = () => import('../views/buyer/RFQCreate.vue');
const RequestDetail = () => import('../views/buyer/RequestDetail.vue');

const BuyerMessages = () => import('../views/buyer/Messages.vue');

// Admin Pages
const AdminDashboard = () => import('../views/admin/Dashboard.vue');
const AdminSuppliers = () => import('../views/admin/Suppliers.vue');
const AdminRequestDetail = () => import('../views/admin/RequestDetail.vue');
const AdminRatingsModeration = () => import('../views/admin/RatingsModeration.vue');
const PasswordResets = () => import('../views/admin/PasswordResets.vue');
const AdminMessages = () => import('../views/admin/Messages.vue');

// Auth Pages
const Login = () => import('../views/auth/Login.vue');
const ResetPassword = () => import('../views/auth/ResetPassword.vue');

const LandingPage = () => import('../views/LandingPage.vue');

const routes = [
  { path: '/', component: LandingPage, meta: { public: true } },
  { path: '/login', component: Login },
  { path: '/buyer/dashboard', component: Dashboard, meta: { requiresAuth: true } },
  { 
    path: '/buyer/requests', 
    component: Requests, 
    meta: { requiresAuth: true },
    children: [
      { path: '/buyer/rfq/:id', component: RequestDetail, meta: { requiresAuth: true } }
    ]
  },
  { path: '/buyer/orders', component: Orders, meta: { requiresAuth: true } },
  { path: '/buyer/suppliers', component: Suppliers, meta: { requiresAuth: true } },
  { path: '/buyer/logistics', component: Logistics, meta: { requiresAuth: true } },
  { path: '/buyer/settings', component: Settings, meta: { requiresAuth: true } },
  { path: '/buyer/sourcing', component: Sourcing, meta: { requiresAuth: true } },
  { path: '/buyer/rfq/create', component: RFQCreate, meta: { requiresAuth: true } },
  { path: '/buyer/messages', component: BuyerMessages, meta: { requiresAuth: true } },
  // Admin Routes
  { path: '/admin/dashboard', component: AdminDashboard, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/suppliers', component: AdminSuppliers, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/request/:id', component: AdminRequestDetail, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/ratings', component: AdminRatingsModeration, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/security/password-resets', component: PasswordResets, meta: { requiresAuth: true, requiresAdmin: true } },
  { path: '/admin/messages', component: AdminMessages, meta: { requiresAuth: true, requiresAdmin: true } },
  
  // Public Password Reset
  { path: '/reset-password', component: ResetPassword }
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