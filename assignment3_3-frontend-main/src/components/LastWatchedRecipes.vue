<template>
  <div class="container">
    <h3 v-if="title" class="watched-recipes-title">
      <i class="fas fa-history me-2 text-info"></i>
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
        <i class="fas fa-clock text-muted mb-3" style="font-size: 3rem"></i>
        <p class="text-muted">No recipes watched yet</p>
        <small class="text-muted"
          >Start exploring recipes to see them here!</small
        >
      </div>
    </div>
    <div v-if="loading" class="text-center mt-3">
      <div class="loading-state">
        <div class="spinner-border text-info mb-3" role="status">
          <span class="visually-hidden">Loading...</span>
        </div>
        <p class="text-muted">Loading your viewing history...</p>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, getCurrentInstance } from "vue";
import RecipePreview from "./RecipePreview.vue";

export default {
  name: "LastWatchedRecipes",
  components: {
    RecipePreview,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
  },
  setup() {
    const internalInstance = getCurrentInstance();
    const axios = internalInstance.appContext.config.globalProperties.axios;

    const recipes = ref([]);
    const loading = ref(false);

    const loadLastWatchedRecipes = async () => {
      loading.value = true;
      try {
        const response = await axios.get("/users/lastWatchedRecipes");
        recipes.value = response.data || [];
        console.log("Last watched recipes:", recipes.value);
      } catch (error) {
        console.error("Error fetching last watched recipes:", error);
        recipes.value = [];
      } finally {
        loading.value = false;
      }
    };

    onMounted(() => {
      loadLastWatchedRecipes();
    });

    return { recipes, loading };
  },
};
</script>

<style lang="scss" scoped>
.container {
  min-height: 400px;
}

.watched-recipes-title {
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
    background: linear-gradient(90deg, #0dcaf0, #6f42c1);
    border-radius: 2px;
  }

  i {
    background: linear-gradient(45deg, #0dcaf0, #6f42c1);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
    animation: historyPulse 2s infinite;
  }
}

@keyframes historyPulse {
  0%,
  100% {
    transform: rotate(0deg) scale(1);
  }
  50% {
    transform: rotate(5deg) scale(1.1);
  }
}

.empty-state,
.loading-state {
  padding: 3rem 2rem;

  i {
    animation: clockTick 2s infinite;
  }

  .spinner-border {
    width: 3rem;
    height: 3rem;
  }
}

@keyframes clockTick {
  0% {
    transform: rotate(0deg);
  }
  25% {
    transform: rotate(90deg);
  }
  50% {
    transform: rotate(180deg);
  }
  75% {
    transform: rotate(270deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.row {
  animation: slideInFromRight 0.8s ease-out;
}

@keyframes slideInFromRight {
  from {
    opacity: 0;
    transform: translateX(30px);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

// Responsive design
@media (max-width: 768px) {
  .watched-recipes-title {
    font-size: 1.5rem;
  }
}
</style>
