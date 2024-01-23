import { createWebHistory, createRouter } from 'vue-router';
import Home from '../pages/Home.vue';
import About from '../pages/About.vue';
import Default from '../layouts/Default.vue';

const routes = [
    {
        path: '/',
        component: Default,
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
