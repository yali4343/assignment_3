<template>
  <div class="container">
    <h3 v-if="title" class="recipe-list-title">
      <i class="fas fa-utensils me-2 text-primary"></i>
      {{ title }}
      <slot></slot>
    </h3>
    <div class="row">
      <div v-for="r in recipes" :key="r.id" class="col-md-4 mb-3">
        <RecipePreview class="recipePreview" :recipe="r" />
      </div>
    </div>
    <div v-if="recipes.length === 0 && !loading" class="text-center mt-3">
      <div class="empty-state">
        <i
          class="fas fa-exclamation-triangle text-warning mb-3"
          style="font-size: 3rem"
        ></i>
        <h5 class="text-muted mb-2">Recipes Currently Unavailable</h5>
        <p class="text-muted">
          The recipe service has reached its daily API limit (150 requests).<br />
          Please try again tomorrow for fresh recipe discoveries!
        </p>
        <small class="text-muted">
          <i class="fas fa-clock me-1"></i>
          API limits reset daily at midnight UTC
        </small>
      </div>
    </div>
    <div v-if="loading" class="text-center mt-3">
      <div class="loading-state">
        <div class="spinner-border text-primary mb-3" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-muted">Loading delicious recipes...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, getCurrentInstance } from "vue";
import RecipePreview from "./RecipePreview.vue";

export default {
  name: "RecipePreviewList",
  components: {
    RecipePreview,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    disabled: {
      type: Boolean,
      default: false,
    },
  },
  setup(props) {
    const internalInstance = getCurrentInstance();
    const axios = internalInstance.appContext.config.globalProperties.axios;

    const recipes = ref([]);
    const loading = ref(false);
    const updateRecipes = async () => {
      if (props.disabled) {
        // For demonstration, show some placeholder data when disabled
        recipes.value = [
          {
            id: 1,
            title: "Sample Recipe 1",
            readyInMinutes: 30,
            image: "",
            aggregateLikes: 0,
          },
          {
            id: 2,
            title: "Sample Recipe 2",
            readyInMinutes: 45,
            image: "",
            aggregateLikes: 0,
          },
          {
            id: 3,
            title: "Sample Recipe 3",
            readyInMinutes: 60,
            image: "",
            aggregateLikes: 0,
          },
        ];
        return;
      }

      loading.value = true;
      try {
        console.log(
          "Fetching random recipes from:",
          axios.defaults.baseURL + "/recipes/random"
        );
        const response = await axios.get("/recipes/random");
        console.log("Random recipes response:", response.data);
        console.log("Response status:", response.status);

        if (response.data && Array.isArray(response.data)) {
          recipes.value = response.data;
          console.log("Successfully loaded", response.data.length, "recipes");
        } else {
          console.warn("Unexpected response format:", response.data);
          recipes.value = [];
        }
      } catch (error) {
        console.error("Error fetching recipes:", error);
        console.error("Error details:", {
          message: error.message,
          status: error.response?.status,
          statusText: error.response?.statusText,
          url: error.config?.url,
          baseURL: error.config?.baseURL,
        });
        recipes.value = [];
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      updateRecipes();
    });

    return { recipes, loading, updateRecipes };
  },
};
</script>

<style lang="scss" scoped>
.container {
  min-height: 400px;
}

.recipe-list-title {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 2rem;
  text-align: center;
  position: relative;
  color: #495057;

  &::after {
    content: "";
    position: absolute;
    bottom: -10px;
    left: 50%;
    transform: translateX(-50%);
    width: 50px;
    height: 3px;
    background: linear-gradient(90deg, #0d6efd, #20c997);
    border-radius: 2px;
  }

  i {
    background: linear-gradient(45deg, #0d6efd, #20c997);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }
}

.empty-state,
.loading-state {
  padding: 3rem 2rem;

  i {
    animation: pulse 2s infinite;
  }

  .spinner-border {
    width: 3rem;
    height: 3rem;
  }
}

@keyframes pulse {
  0% {
    opacity: 1;
    transform: scale(1);
  }
  50% {
    opacity: 0.7;
    transform: scale(1.05);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.row {
  animation: fadeInUp 0.8s ease-out;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

// Responsive design
@media (max-width: 768px) {
  .recipe-list-title {
    font-size: 1.5rem;
  }
}
</style>
