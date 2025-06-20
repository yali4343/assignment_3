<template>
  <div class="container">
    <div class="page-header">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h1><i class="fas fa-book text-primary"></i> My Private Recipes</h1>
          <p class="text-muted">Your personal recipe collection</p>
        </div>
        <button @click="showAddModal = true" class="btn btn-success">
          <i class="fas fa-plus"></i> Add New Recipe
        </button>
      </div>
    </div>

    <div v-if="loading" class="text-center mt-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
      <p class="mt-2">Loading your recipes...</p>
    </div>

    <div v-else-if="myRecipes.length > 0" class="recipes-grid">
      <div class="row">
        <div
          v-for="recipe in myRecipes"
          :key="recipe.recipe_id"
          class="col-md-4 mb-4"
        >
          <div class="card h-100 private-recipe-card">
            <img
              v-if="recipe.image"
              :src="recipe.image"
              class="card-img-top recipe-image"
              alt="Recipe image"
            />
            <div class="card-body">
              <h5 class="card-title">{{ recipe.title }}</h5>
              <p class="card-text">
                <i class="fas fa-clock"></i>
                {{ recipe.readyInMinutes || "N/A" }} minutes
              </p>
              <p class="card-text">
                <i class="fas fa-users"></i>
                {{ recipe.servings || "N/A" }} servings
              </p>
              <div class="recipe-badges mb-2">
                <span v-if="recipe.vegan" class="badge bg-success me-1"
                  >Vegan</span
                >
                <span v-if="recipe.vegetarian" class="badge bg-primary me-1"
                  >Vegetarian</span
                >
                <span v-if="recipe.glutenFree" class="badge bg-warning"
                  >Gluten Free</span
                >
              </div>
              <div class="d-flex justify-content-between mt-3">
                <button
                  @click="viewRecipe(recipe)"
                  class="btn btn-primary btn-sm"
                >
                  <i class="fas fa-eye"></i> View Recipe
                </button>
                <button
                  @click.stop="confirmDeleteRecipe(recipe)"
                  class="btn btn-danger btn-sm"
                  :disabled="deletingRecipeId === recipe.recipe_id"
                >
                  <i
                    class="fas"
                    :class="
                      deletingRecipeId === recipe.recipe_id
                        ? 'fa-spinner fa-spin'
                        : 'fa-trash'
                    "
                  ></i>
                  {{
                    deletingRecipeId === recipe.recipe_id
                      ? "Deleting..."
                      : "Delete"
                  }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else class="empty-state text-center mt-5">
      <div class="empty-icon">
        <i class="fas fa-book-open text-muted"></i>
      </div>
      <h3 class="mt-3">No Private Recipes Yet</h3>
      <p class="text-muted">Create your first private recipe to get started!</p>
      <button @click="showAddModal = true" class="btn btn-success">
        <i class="fas fa-plus"></i> Add Your First Recipe
      </button>
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
            <h5 class="modal-title">Add New Private Recipe</h5>
            <button
              @click="closeModal"
              type="button"
              class="btn-close"
            ></button>
          </div>
          <div class="modal-body">
            <form @submit.prevent="addRecipe">
              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Recipe Title *</label>
                    <input
                      v-model="newRecipe.title"
                      type="text"
                      class="form-control"
                      required
                    />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Ready in Minutes</label>
                    <input
                      v-model.number="newRecipe.readyInMinutes"
                      type="number"
                      class="form-control"
                    />
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Servings *</label>
                    <input
                      v-model.number="newRecipe.servings"
                      type="number"
                      class="form-control"
                      required
                    />
                  </div>
                </div>
                <div class="col-md-6">
                  <div class="mb-3">
                    <label class="form-label">Image URL</label>
                    <input
                      v-model="newRecipe.image"
                      type="url"
                      class="form-control"
                    />
                  </div>
                </div>
              </div>

              <div class="row">
                <div class="col-md-4">
                  <div class="form-check">
                    <input
                      v-model="newRecipe.vegan"
                      class="form-check-input"
                      type="checkbox"
                    />
                    <label class="form-check-label">Vegan</label>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="form-check">
                    <input
                      v-model="newRecipe.vegetarian"
                      class="form-check-input"
                      type="checkbox"
                    />
                    <label class="form-check-label">Vegetarian</label>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="form-check">
                    <input
                      v-model="newRecipe.glutenFree"
                      class="form-check-input"
                      type="checkbox"
                    />
                    <label class="form-check-label">Gluten Free</label>
                  </div>
                </div>
              </div>

              <div class="mb-3">
                <label class="form-label">Ingredients</label>
                <textarea
                  v-model="newRecipe.ingredients"
                  class="form-control"
                  rows="4"
                  placeholder="List ingredients, one per line"
                ></textarea>
              </div>

              <div class="mb-3">
                <label class="form-label">Instructions</label>
                <textarea
                  v-model="newRecipe.instructions"
                  class="form-control"
                  rows="6"
                  placeholder="Write step-by-step instructions"
                ></textarea>
              </div>

              <div class="d-flex justify-content-end gap-2">
                <button
                  @click="closeModal"
                  type="button"
                  class="btn btn-secondary"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  class="btn btn-success"
                  :disabled="submitting"
                >
                  {{ submitting ? "Adding..." : "Add Recipe" }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>

    <!-- Recipe View Modal -->
    <div
      v-if="showViewModal && recipeToView"
      class="modal d-block"
      tabindex="-1"
      style="background-color: rgba(0, 0, 0, 0.5)"
    >
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">
              <i class="fas fa-book"></i> {{ recipeToView.title }}
            </h5>
            <button
              @click="closeViewModal"
              type="button"
              class="btn-close"
            ></button>
          </div>
          <div class="modal-body">
            <div class="row">
              <div class="col-md-4">
                <img
                  v-if="recipeToView.image"
                  :src="recipeToView.image"
                  class="img-fluid rounded"
                  alt="Recipe image"
                />
                <div v-else class="no-image-placeholder rounded">
                  <i class="fas fa-utensils fa-3x"></i>
                  <p>No Image Available</p>
                </div>
              </div>
              <div class="col-md-8">
                <div class="recipe-info">
                  <p>
                    <i class="fas fa-clock text-primary"></i>
                    <strong>Ready in:</strong>
                    {{ recipeToView.readyInMinutes || "N/A" }} minutes
                  </p>
                  <p>
                    <i class="fas fa-users text-info"></i>
                    <strong>Servings:</strong>
                    {{ recipeToView.servings || "N/A" }}
                  </p>

                  <div class="recipe-badges mb-3">
                    <span
                      v-if="recipeToView.vegan"
                      class="badge bg-success me-1"
                    >
                      <i class="fas fa-leaf"></i> Vegan
                    </span>
                    <span
                      v-if="recipeToView.vegetarian"
                      class="badge bg-primary me-1"
                    >
                      <i class="fas fa-seedling"></i> Vegetarian
                    </span>
                    <span
                      v-if="recipeToView.glutenFree"
                      class="badge bg-warning"
                    >
                      <i class="fas fa-wheat"></i> Gluten Free
                    </span>
                  </div>

                  <h5>Ingredients</h5>
                  <ul
                    v-if="
                      recipeToView.ingredients &&
                      recipeToView.ingredients.length
                    "
                  >
                    <li
                      v-for="(ingredient, index) in recipeToView.ingredients"
                      :key="index"
                    >
                      {{ ingredient }}
                    </li>
                  </ul>
                  <p v-else class="text-muted">No ingredients listed</p>

                  <h5>Instructions</h5>
                  <div v-if="recipeToView.instructions" class="instructions">
                    {{ recipeToView.instructions }}
                  </div>
                  <p v-else class="text-muted">No instructions available</p>
                </div>
              </div>
            </div>
          </div>
          <div class="modal-footer">
            <button
              @click="closeViewModal"
              type="button"
              class="btn btn-secondary"
            >
              Close
            </button>
            <button
              @click="confirmDeleteRecipe(recipeToView)"
              type="button"
              class="btn btn-danger"
            >
              <i class="fas fa-trash"></i> Delete Recipe
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div
      v-if="showDeleteConfirmModal"
      class="modal d-block"
      tabindex="-1"
      style="background-color: rgba(0, 0, 0, 0.5)"
    >
      <div class="modal-dialog">
        <div class="modal-content">
          <div class="modal-header bg-danger text-white">
            <h5 class="modal-title">
              <i class="fas fa-exclamation-triangle"></i> Confirm Delete
            </h5>
            <button
              @click="closeDeleteModal"
              type="button"
              class="btn-close btn-close-white"
            ></button>
          </div>
          <div class="modal-body">
            <p>
              Are you sure you want to delete the recipe:
              <strong>{{ recipeToDelete?.title }}</strong
              >?
            </p>
            <p class="text-danger">This action cannot be undone.</p>
          </div>
          <div class="modal-footer">
            <button
              @click="closeDeleteModal"
              type="button"
              class="btn btn-secondary"
            >
              Cancel
            </button>
            <button
              @click="deleteRecipe"
              type="button"
              class="btn btn-danger"
              :disabled="deletingRecipeId !== null"
            >
              <i
                class="fas"
                :class="
                  deletingRecipeId !== null ? 'fa-spinner fa-spin' : 'fa-trash'
                "
              ></i>
              {{ deletingRecipeId !== null ? "Deleting..." : "Delete Recipe" }}
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, reactive, onMounted, getCurrentInstance } from "vue";
import { useRoute } from "vue-router";

export default {
  name: "MyRecipesPage",
  setup() {
    const internalInstance = getCurrentInstance();
    const axios = internalInstance.appContext.config.globalProperties.axios;
    const toast = internalInstance.appContext.config.globalProperties.toast;
    const route = useRoute();
    const myRecipes = ref([]);
    const loading = ref(true);
    const showAddModal = ref(false);
    const submitting = ref(false);
    const deletingRecipeId = ref(null);
    const showDeleteConfirmModal = ref(false);
    const recipeToDelete = ref(null);
    const recipeToView = ref(null);
    const showViewModal = ref(false);

    const newRecipe = reactive({
      title: "",
      readyInMinutes: null,
      servings: null,
      image: "",
      vegan: false,
      vegetarian: false,
      glutenFree: false,
      ingredients: "",
      instructions: "",
    });

    const loadMyRecipes = async () => {
      loading.value = true;
      try {
        const response = await axios.get("/users/myRecipes");
        myRecipes.value = response.data || [];
      } catch (error) {
        console.error("Error loading recipes:", error);
        toast("Error", "Failed to load your recipes", "danger");
        myRecipes.value = [];
      } finally {
        loading.value = false;
      }
    };

    const addRecipe = async () => {
      submitting.value = true;
      try {
        const recipeData = {
          title: newRecipe.title,
          servings: newRecipe.servings,
          readyInMinutes: newRecipe.readyInMinutes,
          image: newRecipe.image,
          vegan: newRecipe.vegan,
          vegetarian: newRecipe.vegetarian,
          glutenFree: newRecipe.glutenFree,
          ingredients: newRecipe.ingredients
            .split("\n")
            .filter((i) => i.trim()),
          instructions: newRecipe.instructions,
        };

        await axios.post("/users/myRecipes", recipeData);
        toast("Success", "Recipe added successfully", "success");
        closeModal();
        loadMyRecipes(); // Reload the list
      } catch (error) {
        console.error("Error adding recipe:", error);
        const message = error.response?.data?.message || "Failed to add recipe";
        toast("Error", message, "danger");
      } finally {
        submitting.value = false;
      }
    };
    const viewRecipe = (recipe) => {
      // Display recipe details modal
      toast("Success", `Viewing details for: ${recipe.title}`, "info");

      // For now, let's use a simplified approach and show a modal with details
      // In a full implementation, you might want to add a dedicated private recipe view page
      // or enhance this modal to show all details like ingredients and instructions

      // Store the selected recipe for viewing
      recipeToView.value = recipe;
      showViewModal.value = true;
    };
    const closeModal = () => {
      showAddModal.value = false;
      // Reset form
      Object.assign(newRecipe, {
        title: "",
        readyInMinutes: null,
        servings: null,
        image: "",
        vegan: false,
        vegetarian: false,
        glutenFree: false,
        ingredients: "",
        instructions: "",
      });
    };

    const confirmDeleteRecipe = (recipe) => {
      recipeToDelete.value = recipe;
      showDeleteConfirmModal.value = true;
    };
    const closeDeleteModal = () => {
      showDeleteConfirmModal.value = false;
      recipeToDelete.value = null;
    };

    const closeViewModal = () => {
      showViewModal.value = false;
      recipeToView.value = null;
    };

    const deleteRecipe = async () => {
      if (!recipeToDelete.value) return;

      const recipeId = recipeToDelete.value.recipe_id;
      deletingRecipeId.value = recipeId;

      try {
        await axios.delete(`/users/myRecipes/${recipeId}`);
        myRecipes.value = myRecipes.value.filter(
          (r) => r.recipe_id !== recipeId
        );
        toast("Success", "Recipe deleted successfully", "success");
        closeDeleteModal();
      } catch (error) {
        console.error("Error deleting recipe:", error);
        const message =
          error.response?.data?.message || "Failed to delete recipe";
        toast("Error", message, "danger");
      } finally {
        deletingRecipeId.value = null;
      }
    };
    onMounted(() => {
      loadMyRecipes();

      // Check if we should open the modal automatically (from Create Recipe link)
      if (route.query.openModal === "true") {
        showAddModal.value = true;
      }
    });

    return {
      myRecipes,
      loading,
      showAddModal,
      submitting,
      newRecipe,
      addRecipe,
      viewRecipe,
      closeModal,
      confirmDeleteRecipe,
      deleteRecipe,
      deletingRecipeId,
      showDeleteConfirmModal,
      recipeToDelete,
      closeDeleteModal,
      recipeToView,
      showViewModal,
      closeViewModal,
    };
  },
};
</script>

<style scoped>
.page-header {
  margin-bottom: 30px;
  padding-bottom: 20px;
  border-bottom: 2px solid #dee2e6;
}

.private-recipe-card {
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
}

.private-recipe-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.recipe-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
}

.empty-state {
  padding: 60px 20px;
}

.empty-icon {
  font-size: 4rem;
  margin-bottom: 20px;
}

.modal {
  z-index: 1055;
}

.recipe-badges {
  margin-bottom: 10px;
}

.no-image-placeholder {
  background-color: #f8f9fa;
  height: 200px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #6c757d;
}

.instructions {
  white-space: pre-line;
  padding: 10px;
  background-color: #f8f9fa;
  border-radius: 4px;
}
</style>
