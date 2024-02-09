import { createWebHistory, createRouter, createWebHashHistory } from 'vue-router';
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
            {
                path: '/settings',
                name: 'settings',
                component: () => import('../pages/Settings.vue'),
            },
            {
                path: '/debug',
                name: 'debug',
                component: () => import('../pages/Debug.vue'),
                beforeEnter: (to, from, next) => {
                    if (import.meta.env.VITE_APP_ENV === 'production') {
                        next({ name: 'home' });
                    }
                    next();
                }
            }
        ]
    }
];

console.log("Creating router", import.meta.env.VITE_APP_ENV);

const router = createRouter({
    history: createWebHashHistory(),
    routes,
});

export default router;
