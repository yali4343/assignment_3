<template>
  <div class="container">
    <!-- Main Page Header -->
    <div class="page-header text-center mb-4">
      <h1 class="display-4 fw-bold text-primary mb-3">
        <i class="fas fa-utensils me-3"></i>
        Welcome to Recipe World
      </h1>
      <p class="lead text-muted">
        Discover amazing recipes and culinary adventures
      </p>
      <hr class="hr-primary mx-auto" style="width: 100px" />
    </div>

    <!-- Two Column Layout -->
    <div class="row g-4">
      <!-- Left Column - Random Recipes -->
      <div class="col-lg-6">
        <div class="recipe-column">
          <div class="section-header text-center mb-4">
            <h2 class="section-title">
              <i class="fas fa-dice me-2 text-warning"></i>
              Explore this recipes
            </h2>
          </div>

          <!-- Random Recipes Display -->
          <div v-if="randomRecipes.length > 0" class="recipes-list">
            <div v-for="recipe in randomRecipes" :key="recipe.id" class="mb-3">
              <RecipePreview :recipe="recipe" />
            </div>
          </div>

          <!-- Loading State -->
          <div v-else-if="loadingRandom" class="text-center py-4">
            <div class="spinner-border text-primary" role="status">
              <span class="visually-hidden">Loading...</span>
            </div>
            <p class="mt-2 text-muted">Loading random recipes...</p>
          </div>

          <!-- Refresh Button -->
          <div class="text-center mt-4">
            <button
              @click="loadRandomRecipes"
              :disabled="loadingRandom"
              class="btn btn-outline-primary btn-lg px-4"
            >
              <i class="fas fa-sync-alt me-2"></i>
              {{ loadingRandom ? "Loading..." : "More Recipes" }}
            </button>
          </div>
        </div>
      </div>

      <!-- Right Column - User-specific content -->
      <div class="col-lg-6">
        <div class="recipe-column">
          <!-- For Logged-in Users: Last Watched Recipes -->
          <div v-if="store.username" class="logged-in-section">
            <LastWatchedRecipes title="Last watched recipes" />
          </div>

          <!-- For Non-logged-in Users: Login Prompt -->
          <div v-else class="login-section">
            <div
              class="login-prompt p-4 bg-light rounded-3 border border-primary border-opacity-25 text-center"
            >
              <div class="login-icon mb-3">
                <i
                  class="fas fa-user-circle text-primary"
                  style="font-size: 4rem"
                ></i>
              </div>
              <h3 class="text-primary mb-3">Sign In</h3>
              <p class="text-muted mb-4">
                Login to access your personalized recipe collection and track
                your favorite dishes
              </p>

              <!-- Login Button -->
              <router-link :to="{ name: 'login' }" class="d-block mb-3">
                <button class="btn btn-primary btn-lg w-100 mb-3">
                  <i class="fas fa-sign-in-alt me-2"></i>
                  Login
                </button>
              </router-link>

              <!-- Register Link -->
              <p class="text-muted">
                Don't have an account?
                <router-link
                  :to="{ name: 'register' }"
                  class="text-primary text-decoration-none fw-bold"
                >
                  Register here
                </router-link>
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getCurrentInstance, ref, onMounted } from "vue";
import RecipePreview from "../components/RecipePreview.vue";
import LastWatchedRecipes from "../components/LastWatchedRecipes.vue";

export default {
  components: {
    RecipePreview,
    LastWatchedRecipes,
  },
  setup() {
    const internalInstance = getCurrentInstance();
    const store = internalInstance.appContext.config.globalProperties.store;
    const axios = internalInstance.appContext.config.globalProperties.axios;
    const toast = internalInstance.appContext.config.globalProperties.toast;

    const randomRecipes = ref([]);
    const loadingRandom = ref(false);

    const loadRandomRecipes = async () => {
      loadingRandom.value = true;
      try {
        const response = await axios.get("/recipes/random");
        if (response.data && Array.isArray(response.data)) {
          randomRecipes.value = response.data.slice(0, 3);
        } else {
          // This case might not be hit if the backend throws an error for empty/non-array responses
          toast("Info", "No random recipes available at the moment.", "info");
          randomRecipes.value = [];
        }
      } catch (error) {
        console.error("Error loading random recipes:", error);
        if (error.response && error.response.status === 402) {
          // Specific message for API limit reached
          toast(
            "API Limit Reached",
            error.response.data.message ||
              "The daily Spoonacular API request limit has been reached. Random recipes cannot be loaded. Please try again later.",
            "warning"
          );
        } else {
          // Generic error message
          toast(
            "Error",
            error.response?.data?.message ||
              "Failed to load random recipes. Please check your connection or try again later.",
            "danger"
          );
        }
        randomRecipes.value = []; // Clear recipes on error
      } finally {
        loadingRandom.value = false;
      }
    };

    // Load random recipes when component mounts
    onMounted(() => {
      loadRandomRecipes();
    });

    return {
      store,
      randomRecipes,
      loadingRandom,
      loadRandomRecipes,
    };
  },
};
</script>

<style lang="scss" scoped>
// Page Header Styles
.page-header {
  padding: 2rem 0;
  background: linear-gradient(
    135deg,
    rgba(13, 110, 253, 0.05) 0%,
    rgba(255, 193, 7, 0.05) 100%
  );
  border-radius: 15px;
  margin-bottom: 3rem;

  .display-4 {
    background: linear-gradient(45deg, #0d6efd, #ffc107);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
  }
}

.hr-primary {
  height: 4px;
  background: linear-gradient(90deg, #0d6efd, #ffc107);
  border: none;
  border-radius: 2px;
  opacity: 1;
}

// Section Styles
.recipe-section {
  position: relative;

  .section-header {
    position: relative;
    padding: 1.5rem 0;
  }

  .section-title {
    font-size: 2.5rem;
    font-weight: 700;
    margin-bottom: 0.5rem;
    position: relative;

    &::after {
      content: "";
      position: absolute;
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 3px;
      background: linear-gradient(90deg, #0d6efd, #ffc107);
      border-radius: 2px;
    }
  }

  .section-subtitle {
    font-size: 1.1rem;
    font-style: italic;
    margin-bottom: 0;
  }
}

// Decorative Divider
.section-divider {
  position: relative;
  text-align: center;

  .hr-decorative {
    border: none;
    height: 2px;
    background: linear-gradient(90deg, transparent, #dee2e6, transparent);
    margin: 0;
  }

  .divider-icon {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: white;
    padding: 0 1rem;
    font-size: 1.5rem;

    i {
      filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
    }
  }
}

// Login Prompt Styles
.login-prompt {
  position: relative;
  overflow: hidden;

  &::before {
    content: "";
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(13, 110, 253, 0.1),
      transparent
    );
    animation: shimmer 3s infinite;
  }

  @keyframes shimmer {
    0% {
      left: -100%;
    }
    100% {
      left: 100%;
    }
  }

  .btn {
    position: relative;
    overflow: hidden;
    transition: all 0.3s ease;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 25px rgba(13, 110, 253, 0.3);
    }

    &::before {
      content: "";
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.2),
        transparent
      );
      transition: left 0.5s;
    }

    &:hover::before {
      left: 100%;
    }
  }
}

// Recipe Cards Styles
.RandomRecipes {
  margin: 2rem 0;

  ::v-deep .container h3 {
    display: none; // Hide the title since we're using custom headers
  }
}

.blur {
  -webkit-filter: blur(5px);
  filter: blur(2px);
  transition: filter 0.3s ease;
}

::v-deep .blur .recipe-preview {
  pointer-events: none;
  cursor: default;
}

// Responsive Design
@media (max-width: 768px) {
  .page-header {
    padding: 1.5rem 0;
    margin-bottom: 2rem;

    .display-4 {
      font-size: 2rem;
    }
  }

  .section-title {
    font-size: 2rem !important;
  }

  .section-divider {
    margin: 2rem 0 !important;
  }
}

// Hover Effects for Recipe Sections
.recipe-section {
  transition: all 0.3s ease;

  &:hover {
    .section-title i {
      transform: scale(1.1);
      transition: transform 0.3s ease;
    }
  }
}

// Custom Animations
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(30px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.recipe-section {
  animation: fadeInUp 0.6s ease-out;
}

.recipe-section:nth-child(2) {
  animation-delay: 0.1s;
}

.recipe-section:nth-child(4) {
  animation-delay: 0.2s;
}

// Two-Column Layout Styles
.recipe-column {
  background: #fff;
  border-radius: 15px;
  padding: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: 1px solid rgba(0, 0, 0, 0.05);
  height: 100%;
  min-height: 600px;
}

// Recipes List Styling
.recipes-list {
  max-height: 450px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: #f1f1f1;
    border-radius: 3px;
  }

  &::-webkit-scrollbar-thumb {
    background: #007bff;
    border-radius: 3px;
  }
}

// Login Section Styling
.login-section {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 500px;
}

.login-prompt {
  max-width: 400px;
  width: 100%;
  transition: transform 0.3s ease, box-shadow 0.3s ease;

  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(13, 110, 253, 0.2);
  }
}

.login-icon {
  animation: pulse 2s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
  100% {
    transform: scale(1);
  }
}

// Button Enhancements
.btn {
  border-radius: 25px;
  font-weight: 600;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
}

.btn-outline-primary {
  border: 2px solid #007bff;

  &:hover {
    background: #007bff;
    border-color: #007bff;
  }
}

// Loading State
.spinner-border {
  width: 3rem;
  height: 3rem;
}

// Responsive Design
@media (max-width: 768px) {
  .recipe-column {
    padding: 1.5rem;
    margin-bottom: 2rem;
    min-height: 400px;
  }

  .section-title {
    font-size: 1.8rem;
  }

  .login-section {
    min-height: 300px;
  }
}
</style>
