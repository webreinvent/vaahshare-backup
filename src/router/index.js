import { createWebHistory, createRouter } from 'vue-router';
import Default from '../layouts/Default.vue';
import Home from '../pages/Home.vue';
import About from '../pages/About.vue';

const routes = [
  {
    path: '/',
    component: Default,
    props: true,
    children: [
      {
        path: '/',
        name: 'entry',
        redirect: 'home',
      },
      {
        path: '/home',
        name: 'home',
        component: Home,
      },
      {
        path: '/about',
        name: 'about',
        component: About,
      },
    ]
  }


];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
