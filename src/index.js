import VueScrollbar from './components/VueScrollbar.vue'

VueScrollbar.install = function (Vue, options) {
  Vue.component('vue-scrollbar', VueScrollbar)
}

export default VueScrollbar
