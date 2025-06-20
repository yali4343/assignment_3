import { createApp } from "vue";
import App from "./App.vue";
import router from "./router/index";
import axios from "axios";
import VueAxios from "vue-axios";

import "bootstrap/dist/css/bootstrap.css";
import "bootstrap/dist/js/bootstrap.bundle.js";

import store from "./store";

// Global domain configuration
// For local development, use: "http://localhost:3000"
// For remote server, use your domain (e.g., "https://yourdomain.com")
const domain_server = "https://amit-and-yali-cooking-site.cs.bgu.ac.il"; // Change this according to your needs

// Configure axios
// Set baseURL to backend server (proxy will override this if configured)
axios.defaults.baseURL = domain_server;
axios.defaults.withCredentials = true;

const app = createApp(App);

app.use(router);
app.use(VueAxios, axios);

app.config.globalProperties.store = store;

// Add route guards for authentication
router.beforeEach((to, from, next) => {
  const isAuthenticated = store.username;

  if (to.matched.some((record) => record.meta.requiresAuth)) {
    if (!isAuthenticated) {
      app.config.globalProperties.toast(
        "Access Denied",
        "Please login to access this page",
        "warning"
      );
      next({ name: "login" });
    } else {
      next();
    }
  } else {
    next();
  }
});

app.config.globalProperties.toast = function (
  title,
  content,
  variant = null,
  append = false
) {
  const toastContainerId = "toast-container";
  let toastContainer = document.getElementById(toastContainerId);
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = toastContainerId;
    toastContainer.style.position = "fixed";
    toastContainer.style.top = "1rem";
    toastContainer.style.right = "1rem";
    toastContainer.style.zIndex = "1055";
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = `toast align-items-center text-bg-${
    variant || "info"
  } border-0 show`;
  toast.setAttribute("role", "alert");
  toast.setAttribute("aria-live", "assertive");
  toast.setAttribute("aria-atomic", "true");

  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">
        <strong>${title}</strong><br>${content}
      </div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  if (!append) {
    toastContainer.innerHTML = "";
  }
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
};

app.mount("#app");
