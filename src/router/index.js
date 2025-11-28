import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/AuthStore'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    // ======================
    // PUBLIC
    // ======================
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/public/HomeView.vue'),
    },
    {
      path: '/contact',
      name: 'contact',
      component: () => import('@/views/public/ContactView.vue'),
    },
    {
      path: '/faq',
      name: 'faq',
      component: () => import('@/views/public/FaqView.vue'),
    },
    {
      path: '/fahrzeuge/:id',
      name: 'fahrzeug-details',
      component: () => import('../views/public/FahrzeugDetailsView.vue'),
    },
    {
      path: '/impressum',
      name: 'Impressum',
      component: () => import('@/views/public/ImpressumView.vue'),
    },
    {
      path: '/datenschutz',
      name: 'Datenschutz',
      component: () => import('@/views/public/DatenschutzView.vue'),
    },

    // ======================
    // AUTH
    // ======================
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/auth/LoginView.vue'),
      meta: { guestOnly: true, hideFooter: true },
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue'),
      meta: { guestOnly: true, hideFooter: true },
    },

    // ======================
    // USER / PROFILE (requiresAuth)
    // ======================
    {
      path: '/meinprofil',
      name: 'meinprofil',
      component: () => import('@/views/public/ProfileView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/account-details',
      name: 'account-details',
      component: () => import('@/views/admin/AccountDetailsView.vue'),
      meta: { requiresAuth: true },
    },
    {
      path: '/meine-buchungen',
      name: 'my-bookings',
      component: () => import('@/views/BuchungsUebersichtView.vue'),
      meta: { requiresAuth: true },
    },

    // ======================
    // ADMIN
    // ======================
    {
      path: '/account-user-view',
      name: 'admin-users',
      component: () => import('@/views/admin/AdminUserView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/buchungen/user/:userId',
      name: 'admin-bookings-by-user',
      component: () => import('@/views/BuchungsUebersichtView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },

    // neue Admin-Route fürs Fahrzeuge anlegen
    {
      path: '/admin/fahrzeuge/neu',
      name: 'admin-fahrzeug-create',
      component: () => import('@/views/admin/FahrzeugCreateView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },
    {
      path: '/admin/fahrzeuge',
      name: 'admin-fahrzeuge',
      component: () => import('../views/admin/AdminFahrzeugeView.vue'),
      meta: { requiresAuth: true, requiresAdmin: true },
    },

    // ======================
    // CATCH ALL
    // ======================
    {
      path: '/:catchAll(.*)',
      redirect: '/',
    },
  ],
  scrollBehavior(to, from, savedPosition) {
    // Browser-Zurück/Vorwärts -> alte Position wiederherstellen
    if (savedPosition) {
      return savedPosition
    }

    // sonst immer nach oben
    return { left: 0, top: 0 }
  },
})

/* ##################################################################################
   🔐 Router Guard – stabil & sicher
   - requiresAuth: nur eingeloggt
   - guestOnly: Login/Register nur für Gäste
   - requiresAdmin: nur Admins
##################################################################################### */

router.beforeEach((to, from, next) => {
  const auth = useAuthStore()

  // 1) Route braucht Login
  if (to.meta.requiresAuth && !auth.isLoggedIn) {
    return next('/login')
  }

  // 2) Gäste-Routen: wenn eingeloggt -> Home
  if (to.meta.guestOnly && auth.isLoggedIn) {
    return next('/')
  }

  // 3) Admin nötig -> check sicher (user kann null sein)
  if (to.meta.requiresAdmin && auth.user?.role !== 'ADMIN') {
    return next('/')
  }

  next()
})

export default router
