import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router';
import { useAuthStore } from '@/stores/auth';
import { ROUTES } from '@/utils/constants';

const routes: RouteRecordRaw[] = [
  {
    path: ROUTES.HOME,
    redirect: '/notes',
  },
  {
    path: ROUTES.LOGIN,
    name: 'Login',
    component: () => import('@/views/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: ROUTES.REGISTER,
    name: 'Register',
    component: () => import('@/views/Register.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: ROUTES.FORGOT_PASSWORD,
    name: 'ForgotPassword',
    component: () => import('@/views/ForgotPassword.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: ROUTES.RESET_PASSWORD,
    name: 'ResetPassword',
    component: () => import('@/views/ResetPassword.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: ROUTES.NOTES,
    name: 'Notes',
    component: () => import('@/views/Notes.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: ROUTES.NOTE_DETAIL,
    name: 'NoteDetail',
    component: () => import('@/views/NoteDetail.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: ROUTES.FAVORITES,
    name: 'Favorites',
    component: () => import('@/views/Favorites.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: ROUTES.ARCHIVE,
    name: 'Archive',
    component: () => import('@/views/Archive.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: ROUTES.SHARED,
    name: 'Shared',
    component: () => import('@/views/Shared.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: ROUTES.SETTINGS,
    name: 'Settings',
    component: () => import('@/views/Settings.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: ROUTES.PROFILE,
    name: 'Profile',
    component: () => import('@/views/Profile.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: () => import('@/views/NotFound.vue'),
  },
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

router.beforeEach((to, _from, next) => {
  const authStore = useAuthStore();
  const requiresAuth = to.meta.requiresAuth !== false;

  if (requiresAuth && !authStore.isAuthenticated) {
    next({
      path: '/login',
      query: { redirect: to.fullPath },
    });
  } else if (!requiresAuth && authStore.isAuthenticated && (to.path === '/login' || to.path === '/register')) {
    next('/notes');
  } else {
    next();
  }
});

router.afterEach((to) => {
  document.title = `${to.name?.toString() || 'Notes'} - Notes App`;
});

export default router;
