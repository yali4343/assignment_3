<template>
  <div id="app">
    <nav class="navbar navbar-expand-lg navbar-dark bg-primary">
      <div class="container">
        <router-link :to="{ name: 'main' }" class="navbar-brand">
          <i class="fas fa-utensils"></i> Recipes Main Page
        </router-link>

        <button
          class="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
        >
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="navbarNav">
          <!-- Common Links for Everyone -->
          <ul class="navbar-nav me-auto">
            <li class="nav-item">
              <router-link :to="{ name: 'main' }" class="nav-link">
                <i class="fas fa-home"></i> Home
              </router-link>
            </li>
            <li class="nav-item">
              <router-link :to="{ name: 'search' }" class="nav-link">
                <i class="fas fa-search"></i> Search
              </router-link>
            </li>
            <li class="nav-item">
              <router-link :to="{ name: 'about' }" class="nav-link">
                <i class="fas fa-info-circle"></i> About
              </router-link>
            </li>
            <!-- Create Recipe Link (Logged-in users only) -->
            <li v-if="store.username" class="nav-item">
              <router-link
                :to="{ name: 'myRecipes', query: { openModal: 'true' } }"
                class="nav-link"
              >
                <i class="fas fa-plus-circle"></i> Create Recipe
              </router-link>
            </li>
          </ul>

          <!-- Right Side Navigation -->
          <ul class="navbar-nav">
            <!-- Non-logged-in user section -->
            <template v-if="!store.username">
              <li class="nav-item">
                <span class="nav-link text-light">
                  <i class="fas fa-user-times"></i> Hello Guest
                </span>
              </li>
              <li class="nav-item">
                <router-link :to="{ name: 'login' }" class="nav-link">
                  <i class="fas fa-sign-in-alt"></i> Login
                </router-link>
              </li>
              <li class="nav-item">
                <router-link :to="{ name: 'register' }" class="nav-link">
                  <i class="fas fa-user-plus"></i> Register
                </router-link>
              </li>
            </template>

            <!-- Logged-in user section -->
            <template v-if="store.username">
              <!-- User name display -->
              <li class="nav-item">
                <span class="nav-link text-light">
                  <i class="fas fa-user"></i> {{ store.username }}
                </span>
              </li>

              <!-- Personal Area Dropdown -->
              <li class="nav-item dropdown">
                <a
                  class="nav-link dropdown-toggle"
                  href="#"
                  role="button"
                  data-bs-toggle="dropdown"
                  aria-expanded="false"
                >
                  <i class="fas fa-user-circle"></i> Personal Area
                </a>
                <ul class="dropdown-menu">
                  <li>
                    <router-link
                      :to="{ name: 'favorites' }"
                      class="dropdown-item"
                    >
                      <i class="fas fa-heart text-danger"></i> My Favorite
                      Recipes
                    </router-link>
                  </li>
                  <li>
                    <router-link
                      :to="{ name: 'myRecipes' }"
                      class="dropdown-item"
                    >
                      <i class="fas fa-book text-primary"></i> My Recipes
                    </router-link>
                  </li>
                  <li>
                    <router-link
                      :to="{ name: 'familyRecipes' }"
                      class="dropdown-item"
                    >
                      <i class="fas fa-users text-success"></i> My Family
                      Recipes
                    </router-link>
                  </li>
                </ul>
              </li>

              <!-- Logout Button -->
              <li class="nav-item">
                <a
                  @click="logout"
                  class="nav-link"
                  href="#"
                  style="cursor: pointer"
                >
                  <i class="fas fa-sign-out-alt"></i> Logout
                </a>
              </li>
            </template>
          </ul>
        </div>
      </div>
    </nav>

    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script>
import { getCurrentInstance } from "vue";
import { useRouter } from "vue-router";

export default {
  name: "App",
  setup() {
    const internalInstance = getCurrentInstance();
    const store = internalInstance.appContext.config.globalProperties.store;
    const toast = internalInstance.appContext.config.globalProperties.toast;
    const router = useRouter();
    const axios = internalInstance.appContext.config.globalProperties.axios;

    const logout = async () => {
      try {
        await axios.post("/Logout");
        store.logout();
        toast("Logout", "User logged out successfully", "success");
        router.push("/").catch(() => {});
      } catch (error) {
        console.error("Logout error:", error);
        // Even if server logout fails, clear local session
        store.logout();
        toast("Logout", "Logged out locally", "warning");
        router.push("/").catch(() => {});
      }
    };

    return { store, logout };
  },
};
</script>

<style lang="scss">
@import "@/scss/form-style.scss";

#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
  min-height: 100vh;
}

.main-content {
  padding-top: 20px;
  min-height: calc(100vh - 76px);
}

.navbar-brand {
  font-weight: bold;
  font-size: 1.5rem;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
}

.nav-link.router-link-active {
  color: #fff !important;
  font-weight: bold;
}

.dropdown-item i {
  margin-right: 8px;
}

.nav-link i {
  margin-right: 5px;
}

/* Guest greeting styling */
.nav-link.text-light {
  pointer-events: none;
  opacity: 0.9;
}

/* Logout button styling */
.nav-link[href="#"] {
  transition: color 0.3s ease;
}

.nav-link[href="#"]:hover {
  color: #ffc107 !important;
}
</style>
