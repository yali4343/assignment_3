<template>
  <div class="container">
    <div class="page-header">
      <h1><i class="fas fa-users text-success"></i> Family Recipes</h1>
      <p class="text-muted">
        Traditional recipes passed down through generations
      </p>
      <button @click="showAddRecipeModal" class="btn btn-success mb-4">
        <i class="fas fa-plus"></i> Add Family Recipe
      </button>
    </div>

    <div v-if="loading" class="text-center mt-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading family recipes...</p>
    </div>

    <div v-else-if="familyRecipes.length > 0" class="recipes-grid">
      <div class="row">
        <div
          v-for="recipe in familyRecipes"
          :key="recipe.recipe_id"
          class="col-md-4 mb-4"
        >
          <div class="card h-100 family-recipe-card">
            <img
              v-if="recipe.image"
              :src="recipe.image"
              class="card-img-top recipe-image"
              :alt="recipe.title || 'Family Recipe'"
              @error="handleImageError"
            />
            <div v-else class="no-image-placeholder-family">
              <i class="fas fa-camera"></i>
              <p>No Image Provided</p>
            </div>
            <div class="card-body" @click="viewRecipe(recipe.recipe_id)">
              <h5 class="card-title">{{ recipe.title }}</h5>
              <p class="card-text">
                <i class="fas fa-user"></i> By: {{ recipe.owner || "Unknown" }}
              </p>
              <p class="card-text">
                <i class="fas fa-clock"></i>
                {{
                  recipe.readyInMinutes
                    ? recipe.readyInMinutes + " minutes"
                    : "N/A"
                }}
              </p>
              <p class="card-text">
                <i class="fas fa-calendar"></i>
                When: {{ recipe.whenToMake || "Anytime" }}
              </p>
              <div class="family-info">
                <small class="text-muted">
                  <i class="fas fa-heart"></i> Family tradition
                </small>
              </div>
            </div>
            <div class="card-actions">
              <button
                @click.stop="viewRecipe(recipe.recipe_id)"
                class="btn btn-sm btn-primary view-btn"
              >
                <i class="fas fa-eye"></i> View Recipe
              </button>
              <button
                @click.stop="confirmDeleteRecipe(recipe.recipe_id)"
                class="btn btn-sm btn-danger delete-btn"
              >
                <i class="fas fa-trash"></i> Delete
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="error" class="error-state text-center mt-5">
      <div class="error-icon">
        <i class="fas fa-exclamation-triangle text-warning"></i>
      </div>
      <h3 class="mt-3">Unable to Load Family Recipes</h3>
      <p class="text-muted">{{ errorMessage }}</p>
      <button @click="loadFamilyRecipes" class="btn btn-primary">
        <i class="fas fa-redo"></i> Try Again
      </button>
    </div>

    <div v-else class="empty-state text-center mt-5">
      <div class="empty-icon">
        <i class="fas fa-family text-muted"></i>
      </div>
      <h3 class="mt-3">No Family Recipes Available</h3>
      <p class="text-muted">
        Family recipes will appear here when they are added to your account.
      </p>
      <router-link :to="{ name: 'search' }" class="btn btn-primary">
        <i class="fas fa-search"></i> Explore Other Recipes
      </router-link>
    </div>

    <!-- Recipe Detail Modal -->
    <div
      v-if="selectedRecipeId"
      class="modal d-block"
      tabindex="-1"
      style="background-color: rgba(0, 0, 0, 0.5)"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-users"></i>
              {{ recipeDetails ? recipeDetails.title : "Loading..." }}
            </h5>
            <button
              @click="closeModal"
              type="button"
              class="btn-close"
            ></button>
          </div>
          <div class="modal-body">
            <div v-if="recipeLoading" class="text-center">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading...</span>
              </div>
            </div>
            <div v-else-if="recipeDetails">
              <div class="row">
                <div class="col-md-6">
                  <img
                    v-if="recipeDetails.image"
                    :src="recipeDetails.image"
                    class="img-fluid rounded recipe-detail-image"
                    :alt="recipeDetails.title || 'Recipe Image'"
                    @error="handleDetailImageError"
                  />
                  <div v-else class="no-image-placeholder-detail">
                    <i class="fas fa-camera"></i>
                    <p>No Image Provided</p>
                  </div>
                </div>
                <div class="col-md-6">
                  <h6><i class="fas fa-user"></i> Recipe Owner:</h6>
                  <p>{{ recipeDetails.owner || "Unknown" }}</p>

                  <h6><i class="fas fa-calendar"></i> When to Make:</h6>
                  <p>{{ recipeDetails.whenToMake || "Anytime" }}</p>
                  <h6><i class="fas fa-clock"></i> Preparation Time:</h6>
                  <p>
                    {{
                      recipeDetails.readyInMinutes
                        ? recipeDetails.readyInMinutes + " minutes"
                        : "N/A"
                    }}
                  </p>

                  <h6><i class="fas fa-users"></i> Servings:</h6>
                  <p>{{ recipeDetails.servings || "N/A" }}</p>
                </div>
              </div>

              <div class="row mt-3">
                <div class="col-md-6">
                  <h6><i class="fas fa-list-ul"></i> Ingredients:</h6>
                  <ul class="list-unstyled ingredients-list">
                    <li
                      v-for="(ingredient, index) in getIngredientsList(
                        recipeDetails.ingredients
                      )"
                      :key="index"
                      class="ingredient-item"
                    >
                      <i
                        class="fas fa-circle text-primary ingredient-bullet"
                      ></i>
                      <span
                        v-if="
                          typeof ingredient === 'object' &&
                          ingredient.name !== undefined &&
                          ingredient.amount !== undefined
                        "
                      >
                        {{ ingredient.name }}: {{ ingredient.amount }}
                      </span>
                      <span
                        v-else-if="
                          typeof ingredient === 'object' &&
                          ingredient.name !== undefined
                        "
                      >
                        {{ ingredient.name }}
                      </span>
                      <span v-else>
                        {{ ingredient }}
                      </span>
                    </li>
                  </ul>
                </div>
                <div class="col-md-6">
                  <h6><i class="fas fa-utensils"></i> Instructions:</h6>
                  <div class="instructions-content">
                    <p>{{ recipeDetails.instructions }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Recipe Modal -->
    <div
      v-if="showAddModal"
      class="modal d-block"
      tabindex="-1"
      style="background-color: rgba(0, 0, 0, 0.5)"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-plus"></i> Add Family Recipe
            </h5>
            <button
              @click="closeAddModal"
              type="button"
              class="btn-close"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="submitNewRecipe">
              <div class="mb-3">
                <label for="recipe_name" class="form-label">Recipe Name*</label>
                <input
                  type="text"
                  class="form-control"
                  id="recipe_name"
                  v-model="newRecipe.recipe_name"
                  required
                />
              </div>

              <div class="mb-3">
                <label for="owner_name" class="form-label">Recipe Owner*</label>
                <input
                  type="text"
                  class="form-control"
                  id="owner_name"
                  v-model="newRecipe.owner_name"
                  required
                />
              </div>

              <div class="mb-3">
                <label for="when_to_prepare" class="form-label"
                  >When to Prepare*</label
                >
                <input
                  type="text"
                  class="form-control"
                  id="when_to_prepare"
                  v-model="newRecipe.when_to_prepare"
                  placeholder="e.g. Holidays, Weekends, Daily"
                  required
                />
              </div>

              <div class="mb-3">
                <label class="form-label">Ingredients*</label>
                <div
                  v-for="(ingredient, index) in newRecipe.ingredients"
                  :key="index"
                  class="d-flex mb-2"
                >
                  <input
                    type="text"
                    class="form-control me-2"
                    v-model="ingredient.name"
                    placeholder="Ingredient name"
                    required
                  />
                  <input
                    type="text"
                    class="form-control"
                    v-model="ingredient.amount"
                    placeholder="Amount"
                    required
                  />
                  <button
                    type="button"
                    @click="removeIngredient(index)"
                    class="btn btn-danger ms-2"
                  >
                    <i class="fas fa-times"></i>
                  </button>
                </div>
                <button
                  type="button"
                  @click="addIngredient"
                  class="btn btn-secondary"
                >
                  <i class="fas fa-plus"></i> Add Ingredient
                </button>
              </div>

              <div class="mb-3">
                <label for="instructions" class="form-label"
                  >Instructions*</label
                >
                <textarea
                  class="form-control"
                  id="instructions"
                  v-model="newRecipe.instructions"
                  rows="5"
                  required
                ></textarea>
              </div>

              <div class="mb-3">
                <label for="image_url" class="form-label"
                  >Image URL (optional)</label
                >
                <input
                  type="text"
                  class="form-control"
                  id="image_url"
                  v-model="newRecipe.image_url"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <div class="d-flex justify-content-end">
                <button
                  type="button"
                  @click="closeAddModal"
                  class="btn btn-secondary me-2"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="btn btn-primary"
                  :disabled="addingRecipe"
                >
                  <span
                    v-if="addingRecipe"
                    class="spinner-border spinner-border-sm"
                    role="status"
                    aria-hidden="true"
                  ></span>
                  Save Recipe
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteModal"
      class="modal d-block"
      tabindex="-1"
      style="background-color: rgba(0, 0, 0, 0.5)"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title text-danger">
              <i class="fas fa-exclamation-triangle"></i> Delete Recipe?
            </h5>
            <button
              @click="cancelDelete"
              type="button"
              class="btn-close"
            ></button>
          </div>
          <div class="modal-body">
            <p>
              Are you sure you want to delete this family recipe? This action
              cannot be undone.
            </p>
          </div>
          <div class="modal-footer">
            <button
              type="button"
              @click="cancelDelete"
              class="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              type="button"
              @click="deleteRecipe"
              class="btn btn-danger"
              :disabled="deleting"
            >
              <span
                v-if="deleting"
                class="spinner-border spinner-border-sm"
                role="status"
                aria-hidden="true"
              ></span>
              Delete Recipe
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, getCurrentInstance } from "vue";

export default {
  name: "FamilyRecipesPage",
  setup() {
    const internalInstance = getCurrentInstance();
    const axios = internalInstance.appContext.config.globalProperties.axios;
    const toast = internalInstance.appContext.config.globalProperties.toast;

    const familyRecipes = ref([]);
    const loading = ref(true);
    const error = ref(false);
    const errorMessage = ref("");
    const selectedRecipeId = ref(null); // Changed from selectedRecipe to selectedRecipeId
    const recipeDetails = ref(null);
    const recipeLoading = ref(false);
    const showDeleteModal = ref(false);
    const recipeIdToDelete = ref(null);
    const deleting = ref(false);
    const showAddModal = ref(false);
    const addingRecipe = ref(false);
    const newRecipe = ref({
      recipe_name: "",
      owner_name: "",
      when_to_prepare: "",
      ingredients: [{ name: "", amount: "" }],
      instructions: "",
      image_url: "",
    });

    const loadFamilyRecipes = async () => {
      loading.value = true;
      error.value = false;
      try {
        const response = await axios.get("/users/familyRecipes");
        familyRecipes.value = response.data || [];
      } catch (err) {
        console.error("Error loading family recipes:", err);
        error.value = true;

        if (err.response?.status === 204) {
          errorMessage.value =
            "You need at least 3 family recipes to view this section.";
        } else {
          errorMessage.value =
            err.response?.data?.message || "Failed to load family recipes";
        }

        familyRecipes.value = [];
      } finally {
        loading.value = false;
      }
    };

    const viewRecipe = async (recipeId) => {
      selectedRecipeId.value = recipeId;
      recipeLoading.value = true;
      recipeDetails.value = null; // Clear previous details
      try {
        const response = await axios.get(`/users/familyRecipes/${recipeId}`);
        recipeDetails.value = response.data;
      } catch (err) {
        console.error("Error loading recipe details:", err);
        toast("Error", "Failed to load recipe details.", "danger");
        recipeDetails.value = null; // Clear on error
        selectedRecipeId.value = null; // Close modal on error
      } finally {
        recipeLoading.value = false;
      }
    };

    const closeModal = () => {
      selectedRecipeId.value = null;
      recipeDetails.value = null;
    };

    const getIngredientsList = (ingredients) => {
      if (!ingredients) return [];
      if (typeof ingredients === "string") {
        try {
          return JSON.parse(ingredients);
        } catch (e) {
          console.error("Failed to parse ingredients string:", e);
          return [ingredients]; // Return as single item array if parsing fails
        }
      }
      return Array.isArray(ingredients) ? ingredients : [];
    };

    const handleImageError = (event) => {
      event.target.style.display = "none"; // Hide broken image icon
      // Optionally, replace with a placeholder sibling element if one isn't already there
      // For simplicity, this just hides the broken image.
      // The v-else for the placeholder should handle this.
    };

    const handleDetailImageError = (event) => {
      event.target.style.display = "none";
      // Similar to above, placeholder should be handled by v-else
    };

    const showAddRecipeModal = () => {
      // Reset the form
      newRecipe.value = {
        recipe_name: "",
        owner_name: "",
        when_to_prepare: "",
        ingredients: [{ name: "", amount: "" }],
        instructions: "",
        image_url: "",
      };
      showAddModal.value = true;
    };

    const closeAddModal = () => {
      showAddModal.value = false;
    };

    const addIngredient = () => {
      newRecipe.value.ingredients.push({ name: "", amount: "" });
    };

    const removeIngredient = (index) => {
      if (newRecipe.value.ingredients.length > 1) {
        newRecipe.value.ingredients.splice(index, 1);
      }
    };

    const submitNewRecipe = async () => {
      // Validate form before submission
      if (
        !newRecipe.value.recipe_name ||
        !newRecipe.value.owner_name ||
        !newRecipe.value.when_to_prepare ||
        !newRecipe.value.instructions ||
        newRecipe.value.ingredients.some((ing) => !ing.name || !ing.amount)
      ) {
        toast("Error", "Please fill in all required fields.", "danger");
        return;
      }
      addingRecipe.value = true;
      try {
        await axios.post("/users/familyRecipes", newRecipe.value);
        toast("Success", "Family recipe added successfully!", "success");
        closeAddModal();
        loadFamilyRecipes(); // Reload the recipes list
      } catch (err) {
        console.error("Error adding family recipe:", err);
        toast(
          "Error",
          err.response?.data?.message || "Failed to add family recipe",
          "danger"
        );
      } finally {
        addingRecipe.value = false;
      }
    };

    const confirmDeleteRecipe = (recipeId) => {
      recipeIdToDelete.value = recipeId;
      showDeleteModal.value = true;
    };

    const cancelDelete = () => {
      showDeleteModal.value = false;
      recipeIdToDelete.value = null;
    };

    const deleteRecipe = async () => {
      if (!recipeIdToDelete.value) return;

      deleting.value = true;
      try {
        await axios.delete(`/users/familyRecipes/${recipeIdToDelete.value}`);
        toast("Success", "Recipe deleted successfully", "success");
        // Remove recipe from list without needing to reload
        familyRecipes.value = familyRecipes.value.filter(
          (recipe) => recipe.recipe_id !== recipeIdToDelete.value
        );
        cancelDelete();
      } catch (err) {
        console.error("Error deleting family recipe:", err);
        toast(
          "Error",
          err.response?.data?.message || "Failed to delete recipe",
          "danger"
        );
      } finally {
        deleting.value = false;
      }
    };

    onMounted(() => {
      loadFamilyRecipes();
    });

    return {
      familyRecipes,
      loading,
      error,
      errorMessage,
      selectedRecipeId,
      recipeDetails,
      recipeLoading,
      loadFamilyRecipes,
      viewRecipe,
      closeModal,
      getIngredientsList,
      handleImageError,
      handleDetailImageError,
      // New properties and methods for delete functionality
      showDeleteModal,
      recipeIdToDelete,
      deleting,
      confirmDeleteRecipe,
      cancelDelete,
      deleteRecipe,
      // New properties and methods for add recipe functionality
      showAddModal,
      newRecipe,
      addingRecipe,
      showAddRecipeModal,
      closeAddModal,
      addIngredient,
      removeIngredient,
      submitNewRecipe,
    };
  },
};
</script>

<style scoped>
.family-recipe-card {
  position: relative;
  transition: transform 0.2s;
}

.family-recipe-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
}

.recipe-image {
  height: 200px;
  object-fit: cover;
}

.instructions-content {
  white-space: pre-line;
  max-height: 300px;
  overflow-y: auto;
}

.ingredient-item {
  margin-bottom: 0.5rem;
  display: flex;
  align-items: flex-start;
}

.ingredient-bullet {
  margin-right: 0.5rem;
  margin-top: 0.3rem;
  font-size: 0.5rem;
}

.no-image-placeholder-family {
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
  color: #adb5bd;
}

.no-image-placeholder-family i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.no-image-placeholder-detail {
  height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f8f9fa;
  color: #adb5bd;
}

.no-image-placeholder-detail i {
  font-size: 3rem;
  margin-bottom: 0.5rem;
}

.recipe-detail-image {
  max-height: 300px;
  object-fit: cover;
}

.card-actions {
  position: absolute;
  bottom: 10px;
  right: 10px;
  z-index: 10;
  display: flex;
  gap: 8px;
}

.view-btn {
  background-color: #007bff;
  border-color: #007bff;
}

.view-btn:hover {
  background-color: #0056b3;
  border-color: #0056b3;
}

.delete-btn {
  background-color: #dc3545;
  border-color: #dc3545;
}

.delete-btn:hover {
  background-color: #c82333;
  border-color: #bd2130;
}

.page-header {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  margin-bottom: 2rem;
}

.page-header button {
  align-self: flex-end;
  margin-top: -2.5rem;
}
</style>
