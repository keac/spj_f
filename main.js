import Vue from 'vue'
import App from './App'
import cuCustom from './colorui/components/cu-custom.vue'
import uniRate from "@/components/uni-rate/uni-rate.vue";
import {uniCollapse,uniCollapseItem} from '@dcloudio/uni-ui'
Vue.config.productionTip = false
Vue.component('cu-custom',cuCustom)
Vue.component('uni-rate',uniRate)

import store from './store'
Vue.prototype.$store = store
App.mpType = 'app'
const app = new Vue({
	store,
    ...App
})
app.$mount()
