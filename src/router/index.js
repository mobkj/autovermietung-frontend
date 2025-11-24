import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'

// VIEWS
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import ContactView from '@/views/ContactView.vue'
import FaqView from '@/views/FaqView.vue'
import ProfileView from '@/views/ProfileView.vue'
import AccountDetailsView from '@/views/AccountDetailsView.vue'
import AdminUserView from '@/views/AdminUserView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { guestOnly: true, hideFooter: true },
    },
    {
      path: '/register',
      name: 'register',
      component: RegisterView,
      meta: { guestOnly: true, hideFooter: true },
    },
    {
      path: '/contact',
      name: 'contact',
      component: ContactView,
    },
    {
      path: '/faq',
      name: 'FAQ',
      component: FaqView,
    },
    {
      path: '/meinprofil',
      name: 'meinprofil',
      component: ProfileView,
      meta: { requiresAuth: true },
    },
    {
      path: '/account-details',
      name: 'AccountDetails',
      component: AccountDetailsView,
      meta: { requiresAuth: true },
    },
    {
      path: '/account-user-view',
      name: 'AdminUserView',
      component: AdminUserView,
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    // CATCH-ALL → HOME
    {
      path: '/:catchAll(.*)',
      redirect: '/',
    },
  ],
})

/* ##################################################################################
   🔐 Router Guard – Profi Version
   - requiresAuth: nur eingeloggt
   - guestOnly: z. B. Login/Register, wenn eingeloggt → redirect zu /
   - requiresAdmin: nur Admins
##################################################################################### */

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  // Benutzer nicht eingeloggt
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return next('/login')
  }

  // Eingeloggte Nutzer sollen nicht auf Login/Register
  if (to.meta.guestOnly && auth.isLoggedIn) {
    return next('/')
  }

  // Adminroute → Admin nötig
  if (to.meta.requiresAdmin && auth.user.role !== 'ADMIN') {
    return next('/')
  }

  next()
})

export default router
