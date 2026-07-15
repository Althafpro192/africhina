import { createRouter, createWebHistory } from 'vue-router'

// Import halaman dari folder views
import LoginView from '../views/Login.vue'
import DashboardView from '../views/Dashboard.vue'
import RequestDetailsView from '../views/RequestDetails.vue'
import AdminDashboardView from '../views/AdminDashboard.vue'
import OrderDetailView from '../views/OrderDetail.vue'

const routes = [
  {
    path: '/',
    name: 'Login',
    component: LoginView
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView
  },
  {
    path: '/requests', // :id adalah parameter dinamis (misal: /requests/123)
    name: 'RequestDetails',
    component: RequestDetailsView
  },
  {
    path: '/orderdetail', // :id adalah parameter dinamis (misal: /requests/123)
    name: 'OrderDetail',
    component: OrderDetailView
  },
  {
    path: '/admin',
    name: 'AdminDashboard',
    component: AdminDashboardView
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router