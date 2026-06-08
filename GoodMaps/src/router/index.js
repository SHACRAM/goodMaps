import { createRouter, createWebHashHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    name: 'splash',
    component: () => import('@/views/SplashView.vue'),
    meta: { transition: 'fade' }
  },
  {
    path: '/onboarding',
    name: 'onboarding',
    component: () => import('@/views/OnboardingView.vue'),
    meta: { transition: 'slide-left' }
  },
  {
    path: '/map',
    name: 'map',
    component: () => import('@/views/MapView.vue'),
    meta: { transition: 'slide-left' }
  },
  {
    path: '/place/:id',
    name: 'place-detail',
    component: () => import('@/views/PlaceDetailView.vue'),
    meta: { transition: 'slide-up' }
  },
  {
    path: '/preferences',
    name: 'preferences',
    component: () => import('@/views/PreferencesView.vue'),
    meta: { transition: 'slide-left' }
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: () => import('@/views/FavoritesView.vue'),
    meta: { transition: 'slide-left' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
