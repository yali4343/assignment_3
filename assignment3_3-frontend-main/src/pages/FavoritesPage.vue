<template>
  <div class="container">
    <div class="page-header">
      <h1><i class="fas fa-heart text-danger"></i> My Favorite Recipes</h1>
      <p class="text-muted">Your collection of favorite recipes</p>
    </div>

    <div v-if="loading" class="text-center mt-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading your favorites...</p>
    </div>

    <div v-else-if="favorites.length > 0" class="favorites-grid">
      <div class="row">
        <div v-for="recipe in favorites" :key="recipe.id" class="col-md-4 mb-4">
          <div class="recipe-card-wrapper">
            <RecipePreview :recipe="recipe" />
            <button
              @click="removeFavorite(recipe.id)"
              class="btn btn-sm btn-outline-danger remove-btn"
              :disabled="removing === recipe.id"
            >
              <i class="fas fa-trash"></i>
              {{ removing === recipe.id ? "Removing..." : "Remove" }}
            </button>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state text-center mt-5">
      <div class="empty-icon">
        <i class="fas fa-heart-broken text-muted"></i>
      </div>
      <h3 class="mt-3">No Favorite Recipes Yet</h3>
      <p class="text-muted">
        Start exploring recipes and add them to your favorites!
      </p>
      <router-link :to="{ name: 'search' }" class="btn btn-primary">
        <i class="fas fa-search"></i> Search Recipes
      </router-link>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, getCurrentInstance } from "vue";
import RecipePreview from "../components/RecipePreview.vue";

export default {
  name: "FavoritesPage",
  components: {
    RecipePreview,
  },
  setup() {
    const internalInstance = getCurrentInstance();
    const axios = internalInstance.appContext.config.globalProperties.axios;
    const toast = internalInstance.appContext.config.globalProperties.toast;

    const favorites = ref([]);
    const loading = ref(true);
    const removing = ref(null);

    const loadFavorites = async () => {
      loading.value = true;
      try {
        const response = await axios.get("/users/favorites");
        favorites.value = response.data || [];
      } catch (error) {
        console.error("Error loading favorites:", error);
        toast("Error", "Failed to load favorite recipes", "danger");
        favorites.value = [];
      } finally {
        loading.value = false;
      }
    };

    const removeFavorite = async (recipeId) => {
      removing.value = recipeId;
      try {
        await axios.delete(`/users/favorites?recipeId=${recipeId}`);
        favorites.value = favorites.value.filter(
          (recipe) => recipe.id !== recipeId
        );
        toast("Removed", "Recipe removed from favorites", "success");
      } catch (error) {
        console.error("Error removing favorite:", error);
        const message =
          error.response?.data?.message || "Failed to remove favorite";
        toast("Error", message, "danger");
      } finally {
        removing.value = null;
      }
    };

    onMounted(() => {
      loadFavorites();
    });

    return { favorites, loading, removing, removeFavorite };
  },
};
</script>

<style scoped>
.page-header {
  text-align: center;
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #dee2e6;
}

.recipe-card-wrapper {
  position: relative;
}

.remove-btn {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
}

.empty-state {
  padding: 60px 20px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.favorites-grid {
  margin-top: 20px;
}
</style>
