<template>
  <div class="container">
    <div class="page-header">
      <h1><i class="fas fa-plus-circle text-success"></i> Create New Recipe</h1>
      <p class="text-muted">Share your culinary creations with the world</p>
    </div>

    <div class="row">
      <div class="col-lg-8 mx-auto">
        <div class="card">
          <div class="card-body">
            <form @submit.prevent="createRecipe">
              <!-- Recipe Title -->
              <div class="mb-3">
                <label for="title" class="form-label">Recipe Title *</label>
                <input
                  type="text"
                  class="form-control"
                  id="title"
                  v-model="recipe.title"
                  required
                  placeholder="Enter recipe title"
                />
              </div>

              <!-- Recipe Image -->
              <div class="mb-3">
                <label for="image" class="form-label">Recipe Image URL</label>
                <input
                  type="url"
                  class="form-control"
                  id="image"
                  v-model="recipe.image"
                  placeholder="https://example.com/image.jpg"
                />
              </div>

              <!-- Preparation Time -->
              <div class="mb-3">
                <label for="readyInMinutes" class="form-label"
                  >Preparation Time (minutes) *</label
                >
                <input
                  type="number"
                  class="form-control"
                  id="readyInMinutes"
                  v-model="recipe.readyInMinutes"
                  required
                  min="1"
                  placeholder="30"
                />
              </div>

              <!-- Servings -->
              <div class="mb-3">
                <label for="servings" class="form-label"
                  >Number of Servings *</label
                >
                <input
                  type="number"
                  class="form-control"
                  id="servings"
                  v-model="recipe.servings"
                  required
                  min="1"
                  placeholder="4"
                />
              </div>

              <!-- Dietary Options -->
              <div class="mb-3">
                <label class="form-label">Dietary Options</label>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="vegan"
                    v-model="recipe.vegan"
                  />
                  <label class="form-check-label" for="vegan">
                    <i class="fas fa-leaf text-success"></i> Vegan
                  </label>
                </div>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="vegetarian"
                    v-model="recipe.vegetarian"
                  />
                  <label class="form-check-label" for="vegetarian">
                    <i class="fas fa-seedling text-primary"></i> Vegetarian
                  </label>
                </div>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    id="glutenFree"
                    v-model="recipe.glutenFree"
                  />
                  <label class="form-check-label" for="glutenFree">
                    <i class="fas fa-wheat text-warning"></i> Gluten Free
                  </label>
                </div>
              </div>

              <!-- Ingredients -->
              <div class="mb-3">
                <label for="ingredients" class="form-label"
                  >Ingredients *</label
                >
                <textarea
                  class="form-control"
                  id="ingredients"
                  v-model="recipe.ingredients"
                  required
                  rows="6"
                  placeholder="Enter ingredients, one per line:&#10;2 cups flour&#10;1 tsp salt&#10;3 eggs"
                ></textarea>
                <div class="form-text">Enter each ingredient on a new line</div>
              </div>

              <!-- Instructions -->
              <div class="mb-3">
                <label for="instructions" class="form-label"
                  >Instructions *</label
                >
                <textarea
                  class="form-control"
                  id="instructions"
                  v-model="recipe.instructions"
                  required
                  rows="8"
                  placeholder="Enter step-by-step instructions..."
                ></textarea>
              </div>

              <!-- Submit Buttons -->
              <div class="d-flex justify-content-between">
                <router-link :to="{ name: 'main' }" class="btn btn-secondary">
                  <i class="fas fa-arrow-left"></i> Cancel
                </router-link>
                <button
                  type="submit"
                  class="btn btn-success"
                  :disabled="creating"
                >
                  <i class="fas fa-spinner fa-spin" v-if="creating"></i>
                  <i class="fas fa-plus" v-else></i>
                  {{ creating ? "Creating..." : "Create Recipe" }}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, getCurrentInstance } from "vue";
import { useRouter } from "vue-router";

export default {
  name: "CreateRecipePage",
  setup() {
    const internalInstance = getCurrentInstance();
    const axios = internalInstance.appContext.config.globalProperties.axios;
    const toast = internalInstance.appContext.config.globalProperties.toast;
    const router = useRouter();

    const recipe = ref({
      title: "",
      image: "",
      readyInMinutes: null,
      servings: null,
      vegan: false,
      vegetarian: false,
      glutenFree: false,
      ingredients: "",
      instructions: "",
    });

    const creating = ref(false);

    const createRecipe = async () => {
      creating.value = true;
      try {
        // Convert ingredients from string to array
        const ingredientsArray = recipe.value.ingredients
          .split("\n")
          .filter((ingredient) => ingredient.trim() !== "")
          .map((ingredient) => ingredient.trim());

        const recipeData = {
          ...recipe.value,
          ingredients: ingredientsArray,
        };

        await axios.post("/users/myRecipes", recipeData);
        toast("Success", "Recipe created successfully!", "success");
        router.push({ name: "myRecipes" });
      } catch (error) {
        console.error("Error creating recipe:", error);
        const message =
          error.response?.data?.message || "Failed to create recipe";
        toast("Error", message, "danger");
      } finally {
        creating.value = false;
      }
    };

    return {
      recipe,
      creating,
      createRecipe,
    };
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

.card {
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  border: none;
}

.form-check {
  margin-bottom: 0.5rem;
}

.form-check-label i {
  margin-right: 5px;
}
</style>
