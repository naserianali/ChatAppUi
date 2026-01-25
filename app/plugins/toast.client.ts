import toast, {POSITION} from "vue-toastification";
import "vue-toastification/dist/index.css";

export default defineNuxtPlugin(nuxtApp => {
  const options = {
    timeout: 3000,
    position: POSITION.BOTTOM_RIGHT,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: false,
    hideProgressBar: false,
    closeButton: 'button',
    icon: true,
    rtl: false,
  }
  nuxtApp.vueApp.use(toast, options)
})
