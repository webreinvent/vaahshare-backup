// import { createApp } from 'vue'
// import App from './App.vue';
// import { createPinia } from 'pinia'
//
//
// const pinia = createPinia()
//
//
// app.use(pinia)
// createApp(App).mount('#app')

import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import 'vue-final-modal/style.css'

import { createVfm } from 'vue-final-modal'

const vfm = createVfm()
const pinia = createPinia()
const app = createApp(App)

app.use(pinia)
app.use(vfm)
app.mount('#app')
