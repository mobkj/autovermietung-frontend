import { createApp } from 'vue'
import { createPinia } from 'pinia'
import '@fortawesome/fontawesome-free/css/all.min.css'
import { useAuthStore } from '@/stores/AuthStore'

import App from './App.vue'
import router from './router'

const app = createApp(App)
const auth = useAuthStore()
auth.init()

app.use(createPinia())
app.use(router)

app.mount('#app')
