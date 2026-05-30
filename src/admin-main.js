import { createApp } from 'vue'
import './style.css'
import AdminApp from './AdminApp.vue'
import adminRouter from './admin-router'
import { createPinia } from 'pinia'
import { useAuthStore } from './stores/auth'

const app = createApp(AdminApp)
const pinia = createPinia()

app.use(pinia)

const auth = useAuthStore(pinia)
await auth.init()

app.use(adminRouter)
app.mount('#app')
