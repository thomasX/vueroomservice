import Vue from 'vue'
import './plugins/vuetify'
import App from './core/views/App.vue'
import router from './core/router'
import store from './core/store'

Vue.config.productionTip = false

new Vue({
  router,
  store,
  render: h => h(App)
}).$mount('#app')
