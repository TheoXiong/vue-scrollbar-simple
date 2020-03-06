import Vue from 'vue'
import App from './App.vue'

// dev
import VueScrollbar from '../../src/index.js'
// prod
// import VueScrollbar from '../../'

Vue.use(VueScrollbar)

Vue.config.productionTip = false

// eslint-disable-next-line no-new
new Vue({
  el: '#app',
  render: h => h(App)
})
