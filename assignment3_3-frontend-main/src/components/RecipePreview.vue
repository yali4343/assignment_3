<template>
  <div class="card h-100 recipe-card">
    <!-- Recipe Status Indicators -->
    <div class="status-indicators">
      <!-- Viewed Indicator -->
      <div
        v-if="isViewed"
        class="status-badge viewed-badge"
        title="Already viewed"
      >
        <i class="fas fa-eye"></i>
      </div>
      <!-- Favorite Button -->
      <button
        v-if="isLoggedIn"
        @click.stop="toggleFavorite"
        class="status-badge favorite-btn"
        :class="{ 'is-favorite': isFavorite }"
        :title="isFavorite ? 'Remove from favorites' : 'Add to favorites'"
        :disabled="favoriteLoading"
      >
        <i class="fas fa-heart" v-if="!favoriteLoading"></i>
        <i class="fas fa-spinner fa-spin" v-else></i>
      </button>
    </div>

    <!-- Image Container with Click Indicator -->
    <div class="image-container" @click="viewRecipe">
      <img
        v-if="imageAvailable && imageLoaded"
        :src="recipe.image"
        class="card-img-top recipe-image"
        alt="Recipe image"
        @error="onImageError"
        @load="onImageLoad"
      />
      <div v-if="!imageAvailable || !imageLoaded" class="no-image-placeholder">
        <i class="fas fa-utensils"></i>
        <p>No Image Available</p>
      </div>
      <!-- Click indicator overlay -->
      <div class="click-overlay">
        <div class="click-indicator">
          <i class="fas fa-mouse-pointer"></i>
          <span>Click to view recipe</span>
        </div>
      </div>
    </div>

    <!-- Recipe Details -->
    <div class="card-body text-center">
      <h5 class="card-title">{{ recipe.title }}</h5>

      <!-- Time and Popularity Row -->
      <div class="recipe-info-row">
        <div class="info-item">
          <i class="fas fa-clock text-primary"></i>
          <span>{{ recipe.readyInMinutes || "N/A" }} min</span>
        </div>
        <div class="info-item">
          <i class="fas fa-heart text-danger"></i>
          <span
            >{{
              recipe.popularity || recipe.aggregateLikes || recipe.likes || 0
            }}
            likes</span
          >
        </div>
      </div>

      <!-- Dietary Badges -->
      <div
        v-if="recipe.vegan || recipe.vegetarian || recipe.glutenFree"
        class="recipe-badges"
      >
        <span v-if="recipe.vegan" class="badge bg-success me-1">
          <i class="fas fa-leaf"></i> Vegan
        </span>
        <span v-if="recipe.vegetarian" class="badge bg-primary me-1">
          <i class="fas fa-seedling"></i> Vegetarian
        </span>
        <span v-if="recipe.glutenFree" class="badge bg-warning text-dark">
          <i class="fas fa-wheat"></i> Gluten Free
        </span>
      </div>
    </div>
  </div>
</template>

<script>
import { getCurrentInstance, ref, computed, onMounted } from "vue";
import store from "../store.js";

export default {
  name: "RecipePreview",
  props: {
    recipe: {
      type: Object,
      required: true,
    },
  },
  setup(props) {
    const internalInstance = getCurrentInstance();
    const router = internalInstance.appContext.config.globalProperties.$router;
    const axios = internalInstance.appContext.config.globalProperties.axios;
    const toast = internalInstance.appContext.config.globalProperties.toast;

    const imageLoaded = ref(false);
    const imageAvailable = ref(!!props.recipe.image);
    const favoriteLoading = ref(false);
    const isFavorite = ref(false);
    const isViewed = ref(false);

    // Computed properties
    const isLoggedIn = computed(() => !!store.username);

    // Methods
    const viewRecipe = async () => {
      // Mark as watched if user is logged in
      if (isLoggedIn.value) {
        try {
          await axios.post(`/users/markwatched/${props.recipe.id}`);
          isViewed.value = true;
        } catch (error) {
          console.error("Error marking recipe as watched:", error);
        }
      }
      router.push({ name: "recipe", params: { recipeId: props.recipe.id } });
    };

    const toggleFavorite = async () => {
      if (!isLoggedIn.value) return;

      favoriteLoading.value = true;
      try {
        if (isFavorite.value) {
          await axios.delete(`/users/favorites?recipeId=${props.recipe.id}`);
          isFavorite.value = false;
          toast("Success", "Recipe removed from favorites", "success");
        } else {
          await axios.post("/users/favorites", { recipeId: props.recipe.id });
          isFavorite.value = true;
          toast("Success", "Recipe added to favorites", "success");
        }
      } catch (error) {
        console.error("Error toggling favorite:", error);
        const message =
          error.response?.data?.message || "Failed to update favorites";
        toast("Error", message, "danger");
      } finally {
        favoriteLoading.value = false;
      }
    };
    const checkUserStatus = async () => {
      if (!isLoggedIn.value) return;

      try {
        // Check if recipe is in favorites
        const favoritesResponse = await axios.get("/users/favorites");
        const favorites = favoritesResponse.data || [];
        isFavorite.value = favorites.some((fav) => fav.id == props.recipe.id);

        // Check if recipe was viewed (using allWatchedRecipes endpoint)
        const watchedResponse = await axios.get("/users/allWatchedRecipes");
        const watched = watchedResponse.data || [];
        isViewed.value = watched.some((w) => w.id == props.recipe.id);
      } catch (error) {
        console.error("Error checking user status for recipe:", error);
      }
    };

    const onImageError = () => {
      console.error("Image failed to load:", props.recipe.image);
      imageAvailable.value = false; // Mark image as unavailable
      imageLoaded.value = false; // Ensure loader/placeholder logic triggers
    };

    const onImageLoad = () => {
      if (props.recipe.image) {
        // Only set to true if an image src was present
        imageLoaded.value = true;
        imageAvailable.value = true;
      }
    };

    // Lifecycle
  onMounted(() => {
    checkUserStatus();
    
    // If we have an image URL, set it as available
    if (props.recipe.image && props.recipe.image.trim() !== '') {
      imageAvailable.value = true;
      imageLoaded.value = true; // Force to true to test if images show
      // imageLoaded will be set to true by the @load event handler
    } else {
      imageAvailable.value = false;
      imageLoaded.value = false;
    }
  });

    return {
      viewRecipe,
      toggleFavorite,
      onImageError,
      onImageLoad,
      imageLoaded,
      imageAvailable,
      favoriteLoading,
      isFavorite,
      isViewed,
      isLoggedIn,
    };
  },
};
</script>

<style scoped>
/* Recipe Card */
.recipe-card {
  position: relative;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid #dee2e6;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.recipe-card:hover {
  transform: translateY(-8px);
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  border-color: #007bff;
}

/* Status Indicators */
.status-indicators {
  position: absolute;
  top: 10px;
  right: 10px;
  z-index: 10;
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.status-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.viewed-badge {
  background-color: #28a745;
  color: white;
}

.favorite-btn {
  background-color: #fff;
  color: #dc3545;
  border: 2px solid #dc3545;
}

.favorite-btn:hover {
  background-color: #dc3545;
  color: white;
  transform: scale(1.1);
}

.favorite-btn.is-favorite {
  background-color: #dc3545;
  color: white;
}

.favorite-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Image Container */
.image-container {
  position: relative;
  height: 200px;
  overflow: hidden;
  cursor: pointer;
}

.recipe-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.image-container:hover .recipe-image {
  transform: scale(1.05);
}

/* Click Overlay */
.click-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.image-container:hover .click-overlay {
  opacity: 1;
}

.click-indicator {
  color: white;
  text-align: center;
  font-size: 14px;
}

.click-indicator i {
  display: block;
  font-size: 24px;
  margin-bottom: 5px;
}

/* No Image Placeholder */
.no-image-placeholder {
  width: 100%;
  height: 200px;
  background-color: #f8f9fa;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #6c757d;
  border-bottom: 1px solid #dee2e6;
}

.no-image-placeholder i {
  font-size: 3rem;
  margin-bottom: 10px;
}

.no-image-placeholder p {
  margin: 0;
  font-size: 0.9rem;
}

/* Card Body */
.card-body {
  padding: 16px;
}

.card-title {
  font-size: 1.1rem;
  font-weight: 600;
  margin-bottom: 12px;
  color: #333;
  line-height: 1.3;
  height: 2.6em;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  line-clamp: 2;
  -webkit-box-orient: vertical;
}

/* Recipe Info Row */
.recipe-info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  padding: 8px 0;
  border-top: 1px solid #f0f0f0;
  border-bottom: 1px solid #f0f0f0;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  color: #666;
}

.info-item i {
  font-size: 16px;
}

/* Recipe Badges */
.recipe-badges {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}

.badge {
  font-size: 0.75rem;
  padding: 4px 8px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.badge i {
  font-size: 12px;
}

/* Responsive Design */
@media (max-width: 768px) {
  .recipe-info-row {
    flex-direction: column;
    gap: 8px;
  }

  .status-indicators {
    top: 5px;
    right: 5px;
  }

  .status-badge {
    width: 28px;
    height: 28px;
    font-size: 12px;
  }
}
</style>
