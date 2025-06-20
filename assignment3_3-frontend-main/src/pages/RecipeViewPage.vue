<template>
  <div class="container">
    <div v-if="loading" class="text-center mt-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading recipe...</p>
    </div>
    <div v-else-if="recipe" class="recipe-content">
      <!-- Recipe Preview Details Section -->
      <div class="recipe-preview-details bg-light p-3 rounded mb-4">
        <h6 class="text-muted mb-3">
          <i class="fas fa-eye"></i> Recipe Overview
        </h6>
        <div class="row">
          <div class="col-md-6">
            <img
              v-if="recipe.image"
              :src="recipe.image"
              class="recipe-preview-image rounded"
              alt="Recipe image"
            />
          </div>
          <div class="col-md-6">
            <h2 class="recipe-title">{{ recipe.title }}</h2>
            <div class="recipe-meta-grid">
              <div class="meta-item">
                <i class="fas fa-clock text-primary"></i>
                <span
                  ><strong>Prep Time:</strong>
                  {{ recipe.readyInMinutes }} minutes</span
                >
              </div>
              <div class="meta-item">
                <i class="fas fa-users text-success"></i>
                <span
                  ><strong>Servings:</strong>
                  {{ recipe.servings }} servings</span
                >
              </div>
              <div class="meta-item">
                <i class="fas fa-heart text-danger"></i>
                <span
                  ><strong>Popularity:</strong>
                  {{
                    recipe.popularity ||
                    recipe.aggregateLikes ||
                    recipe.likes ||
                    0
                  }}
                  likes
                </span>
              </div>
              <div class="meta-item">
                <i class="fas fa-tags text-info"></i>
                <span><strong>Dietary:</strong></span>
                <div class="dietary-badges mt-1">
                  <span v-if="recipe.vegan" class="badge bg-success me-1"
                    >Vegan</span
                  >
                  <span v-if="recipe.vegetarian" class="badge bg-primary me-1"
                    >Vegetarian</span
                  >
                  <span v-if="recipe.glutenFree" class="badge bg-warning me-1"
                    >Gluten Free</span
                  >
                  <span v-if="recipe.dairyFree" class="badge bg-secondary me-1"
                    >Dairy Free</span
                  >
                  <span
                    v-if="
                      !recipe.vegan &&
                      !recipe.vegetarian &&
                      !recipe.glutenFree &&
                      !recipe.dairyFree
                    "
                    class="text-muted"
                    >No special dietary restrictions</span
                  >
                </div>
              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons mt-3">
              <button
                v-if="store.username"
                @click="toggleFavorite"
                class="btn me-2"
                :class="isFavorite ? 'btn-danger' : 'btn-outline-danger'"
                :disabled="favoriteLoading"
              >
                <i class="fas fa-heart"></i>
                {{ isFavorite ? "Remove from Favorites" : "Add to Favorites" }}
              </button>
              <button
                v-if="store.username"
                @click="toggleLike"
                class="btn"
                :class="
                  recipe.userHasLiked ? 'btn-primary' : 'btn-outline-primary'
                "
                :disabled="likeLoading"
              >
                <i class="fas fa-thumbs-up"></i>
                {{ recipe.userHasLiked ? "Unlike" : "Like" }}
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Detailed Recipe Information -->
      <div class="recipe-details">
        <div class="row">
          <div class="col-md-6">
            <div class="recipe-section">
              <h3 class="section-title">
                <i class="fas fa-list-ul"></i> Ingredients & Quantities
              </h3>
              <div
                v-if="
                  recipe.extendedIngredients &&
                  recipe.extendedIngredients.length > 0
                "
              >
                <ul class="ingredients-list">
                  <li
                    v-for="(ingredient, index) in recipe.extendedIngredients"
                    :key="index"
                  >
                    {{ ingredient.original || ingredient.name }}
                    <span
                      v-if="ingredient.amount && ingredient.unit"
                      class="ingredient-amount"
                    >
                      ({{ ingredient.amount }} {{ ingredient.unit }})
                    </span>
                  </li>
                </ul>
              </div>
              <div
                v-else-if="recipe.ingredients && recipe.ingredients.length > 0"
              >
                <ul class="ingredients-list">
                  <li
                    v-for="(ingredient, index) in recipe.ingredients"
                    :key="index"
                  >
                    {{ ingredient.original || ingredient.name || ingredient }}
                    <span
                      v-if="ingredient.amount && ingredient.unit"
                      class="ingredient-amount"
                    >
                      ({{ ingredient.amount }} {{ ingredient.unit }})
                    </span>
                  </li>
                </ul>
              </div>
              <div v-else class="no-data-message">
                <i class="fas fa-exclamation-circle text-warning"></i>
                <p class="text-muted mt-2">
                  Ingredients information is currently unavailable due to API
                  limitations.
                  <br />
                  <small
                    >This recipe's detailed ingredients require additional API
                    calls that have reached the daily limit.</small
                  >
                </p>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="recipe-section">
              <h3 class="section-title">
                <i class="fas fa-utensils"></i> Preparation Instructions
              </h3>
              <div
                v-if="formattedInstructions && formattedInstructions.length > 0"
              >
                <ol class="instructions-list">
                  <li
                    v-for="(instruction, index) in formattedInstructions"
                    :key="index"
                  >
                    <span v-html="instruction.step || instruction"></span>
                  </li>
                </ol>
              </div>
              <div v-else-if="recipe.instructions">
                <!-- Render raw instructions as HTML if formatted instructions are not available -->
                <div
                  class="instructions-content"
                  v-html="recipe.instructions"
                ></div>
              </div>
              <div v-else class="no-data-message">
                <i class="fas fa-exclamation-circle text-warning"></i>
                <p class="text-muted mt-2">
                  Instructions are currently unavailable due to API limitations.
                  <br />
                  <small
                    >This recipe's detailed instructions require additional API
                    calls that have reached the daily limit.</small
                  >
                </p>
              </div>
            </div>
          </div>
        </div>

        <div v-if="recipe.summary" class="row mt-4">
          <div class="col-12">
            <div class="recipe-section">
              <h3><i class="fas fa-info-circle"></i> Summary:</h3>
              <div class="summary-content" v-html="recipe.summary"></div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="text-center mt-5">
      <div class="alert alert-danger">
        <h4><i class="fas fa-exclamation-triangle"></i> Recipe Not Found</h4>
        <p>The recipe you're looking for doesn't exist or has been removed.</p>
        <router-link to="/" class="btn btn-primary">Go Back Home</router-link>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, getCurrentInstance } from "vue";
import { useRoute, useRouter } from "vue-router";

export default {
  name: "RecipeViewPage",
  setup() {
    const route = useRoute();
    const router = useRouter();
    const internalInstance = getCurrentInstance();
    const store = internalInstance.appContext.config.globalProperties.store;
    const axios = internalInstance.appContext.config.globalProperties.axios;
    const toast = internalInstance.appContext.config.globalProperties.toast;

    const recipe = ref(null);
    const loading = ref(true);
    const isFavorite = ref(false);
    const favoriteLoading = ref(false);
    const likeLoading = ref(false);
    const formattedInstructions = ref([]);

    const loadRecipe = async () => {
      const recipeId = route.params.recipeId;

      try {
        const response = await axios.get(`/recipes/${recipeId}`);
        recipe.value = response.data; // Format instructions
        if (
          recipe.value.analyzedInstructions &&
          recipe.value.analyzedInstructions.length > 0
        ) {
          formattedInstructions.value = recipe.value.analyzedInstructions
            .map((instruction) => instruction.steps)
            .flat();
        } else if (recipe.value.instructions) {
          // Check if instructions contain HTML tags (indicating they're already formatted)
          if (
            typeof recipe.value.instructions === "string" &&
            recipe.value.instructions.includes("<")
          ) {
            // Instructions are already HTML formatted, don't reformat them
            formattedInstructions.value = null;
          } else if (typeof recipe.value.instructions === "string") {
            // Plain text instructions, split by sentences
            formattedInstructions.value = recipe.value.instructions
              .split(/[.!?]+/)
              .filter((step) => step.trim().length > 0)
              .map((step, index) => ({ step: step.trim(), number: index + 1 }));
          } else if (Array.isArray(recipe.value.instructions)) {
            formattedInstructions.value = recipe.value.instructions;
          }
        }

        // Mark as watched if user is logged in
        if (store.username) {
          try {
            await axios.post(`/users/markwatched/${recipeId}`);
          } catch (error) {
            console.log("Error marking as watched:", error);
          }
        }
      } catch (error) {
        console.error("Error loading recipe:", error);
        if (error.response?.status === 404) {
          router.replace("/404");
        } else {
          toast("Error", "Failed to load recipe", "danger");
        }
      } finally {
        loading.value = false;
      }
    };

    const toggleFavorite = async () => {
      if (!store.username) return;

      favoriteLoading.value = true;
      try {
        if (isFavorite.value) {
          await axios.delete(`/users/favorites?recipeId=${recipe.value.id}`);
          isFavorite.value = false;
          toast("Removed", "Recipe removed from favorites", "info");
        } else {
          await axios.post("/users/favorites", { recipeId: recipe.value.id });
          isFavorite.value = true;
          toast("Added", "Recipe added to favorites", "success");
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

    const toggleLike = async () => {
      if (!store.username) return;

      likeLoading.value = true;
      try {
        const newLikeStatus = !recipe.value.userHasLiked;
        const response = await axios.post(`/recipes/${recipe.value.id}/like`, {
          like: newLikeStatus,
        });
        recipe.value.userHasLiked = newLikeStatus;
        recipe.value.popularity = response.data.totalLikes;
        recipe.value.aggregateLikes = response.data.totalLikes; // Keep both for compatibility

        toast(
          "Success",
          `Recipe ${newLikeStatus ? "liked" : "unliked"}`,
          "success"
        );
      } catch (error) {
        console.error("Error toggling like:", error);
        const message =
          error.response?.data?.message || "Failed to update like";
        toast("Error", message, "danger");
      } finally {
        likeLoading.value = false;
      }
    };

    onMounted(() => {
      loadRecipe();
    });

    return {
      recipe,
      loading,
      isFavorite,
      favoriteLoading,
      likeLoading,
      formattedInstructions,
      toggleFavorite,
      toggleLike,
      store,
    };
  },
};
</script>

<style scoped>
.recipe-main-image {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.recipe-meta {
  margin-top: 15px;
}

.recipe-section {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  height: 100%;
}

.recipe-section h3 {
  color: #495057;
  border-bottom: 2px solid #dee2e6;
  padding-bottom: 10px;
  margin-bottom: 15px;
}

.ingredients-list {
  list-style-type: none;
  padding-left: 0;
}

.ingredients-list li {
  padding: 8px 0;
  border-bottom: 1px solid #dee2e6;
}

.ingredients-list li:before {
  content: "• ";
  color: #007bff;
  font-weight: bold;
  margin-right: 8px;
}

.ingredient-amount {
  color: #6c757d;
  font-size: 0.9em;
  font-style: italic;
}

.instructions-list {
  padding-left: 20px;
}

.instructions-list li {
  padding: 10px 0;
  border-bottom: 1px solid #dee2e6;
  line-height: 1.6;
}

.instructions-content {
  line-height: 1.6;
}

.instructions-content >>> ol {
  padding-left: 20px;
  margin: 0;
}

.instructions-content >>> li {
  padding: 10px 0;
  border-bottom: 1px solid #dee2e6;
  line-height: 1.6;
  margin-bottom: 5px;
}

/* Remove any extra spacing and ensure clean numbering */
.instructions-content >>> ol li {
  list-style-type: decimal;
  margin-left: 0;
}

/* Ensure any nested content within instructions is styled properly */
.instructions-content >>> li > * {
  margin: 0;
}

.no-data-message {
  text-align: center;
  padding: 40px 20px;
  background-color: #fff3cd;
  border: 1px solid #ffeaa7;
  border-radius: 8px;
}

.no-data-message i {
  font-size: 2rem;
  margin-bottom: 15px;
}

.summary-content {
  line-height: 1.6;
}

.summary-content >>> a {
  color: #007bff;
  text-decoration: none;
}

.summary-content >>> a:hover {
  text-decoration: underline;
}
</style>
