<template>
  <div class="container">
    <h1 class="title">Search Recipes</h1>

    <div class="search-form">
      <form @submit.prevent="searchRecipes">
        <div class="row">
          <div class="col-md-6">
            <div class="form-group mb-3">
              <label for="query">Search Term:</label>
              <input
                id="query"
                v-model="searchParams.query"
                type="text"
                class="form-control"
                placeholder="Enter recipe name or ingredient"
                required
              />
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group mb-3">
              <label for="number">Number of Results:</label>
              <select
                id="number"
                v-model="searchParams.number"
                class="form-control"
              >
                <option value="5">5</option>
                <option value="10">10</option>
                <option value="15">15</option>
              </select>
            </div>
          </div>
          <div class="col-md-3">
            <div class="form-group mb-3">
              <label for="cuisine">Cuisine:</label>
              <select
                id="cuisine"
                v-model="searchParams.cuisine"
                class="form-control"
              >
                <option value="">Any</option>
                <option value="African">African</option>
                <option value="American">American</option>
                <option value="British">British</option>
                <option value="Cajun">Cajun</option>
                <option value="Caribbean">Caribbean</option>
                <option value="Chinese">Chinese</option>
                <option value="Eastern European">Eastern European</option>
                <option value="European">European</option>
                <option value="French">French</option>
                <option value="German">German</option>
                <option value="Greek">Greek</option>
                <option value="Indian">Indian</option>
                <option value="Irish">Irish</option>
                <option value="Italian">Italian</option>
                <option value="Japanese">Japanese</option>
                <option value="Jewish">Jewish</option>
                <option value="Korean">Korean</option>
                <option value="Latin American">Latin American</option>
                <option value="Mediterranean">Mediterranean</option>
                <option value="Mexican">Mexican</option>
                <option value="Middle Eastern">Middle Eastern</option>
                <option value="Nordic">Nordic</option>
                <option value="Southern">Southern</option>
                <option value="Spanish">Spanish</option>
                <option value="Thai">Thai</option>
                <option value="Vietnamese">Vietnamese</option>
              </select>
            </div>
          </div>
        </div>
        <div class="row">
          <div class="col-md-6">
            <div class="form-group mb-3">
              <label for="diet">Diet:</label>
              <select
                id="diet"
                v-model="searchParams.diet"
                class="form-control"
              >
                <option value="">Any</option>
                <option value="gluten free">Gluten Free</option>
                <option value="ketogenic">Ketogenic</option>
                <option value="vegetarian">Vegetarian</option>
                <option value="lacto-vegetarian">Lacto-Vegetarian</option>
                <option value="ovo-vegetarian">Ovo-Vegetarian</option>
                <option value="vegan">Vegan</option>
                <option value="pescetarian">Pescetarian</option>
                <option value="paleo">Paleo</option>
                <option value="primal">Primal</option>
                <option value="whole30">Whole30</option>
              </select>
            </div>
          </div>
          <div class="col-md-6">
            <div class="form-group mb-3">
              <label for="intolerance">Intolerance:</label>
              <select
                id="intolerance"
                v-model="searchParams.intolerance"
                class="form-control"
              >
                <option value="">None</option>
                <option value="dairy">Dairy</option>
                <option value="egg">Egg</option>
                <option value="gluten">Gluten</option>
                <option value="grain">Grain</option>
                <option value="peanut">Peanut</option>
                <option value="seafood">Seafood</option>
                <option value="sesame">Sesame</option>
                <option value="shellfish">Shellfish</option>
                <option value="soy">Soy</option>
                <option value="sulfite">Sulfite</option>
                <option value="tree nut">Tree Nut</option>
                <option value="wheat">Wheat</option>
              </select>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <div class="form-group mb-3">
              <label for="sort">Sort by:</label>
              <select
                id="sort"
                v-model="searchParams.sort"
                class="form-control"
              >
                <option value="time">Preparation Time</option>
                <option value="popularity">Popularity</option>
              </select>
            </div>
          </div>
        </div>

        <div class="row">
          <div class="col-12">
            <button type="submit" class="btn btn-primary" :disabled="searching">
              <i class="fas fa-search"></i>
              {{ searching ? "Searching..." : "Search Recipes" }}
            </button>
          </div>
        </div>
      </form>
    </div>

    <div v-if="searching" class="text-center mt-4">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div v-if="searchResults.length > 0" class="search-results mt-4">
      <h3>
        <span v-if="isLastSearchLoaded">Last Search Results</span>
        <span v-else>Search Results</span>
        ({{ searchResults.length }} recipes found)
      </h3>
      <div class="row">
        <div
          v-for="recipe in searchResults"
          :key="recipe.id"
          class="col-md-4 mb-3"
        >
          <RecipePreview :recipe="recipe" />
        </div>
      </div>
    </div>

    <div
      v-if="hasSearched && searchResults.length === 0 && !searching"
      class="no-results mt-4"
    >
      <div class="alert alert-info text-center">
        <i class="fas fa-search"></i>
        <h4>No recipes found</h4>
        <p>Try adjusting your search criteria or use different keywords.</p>
      </div>
    </div>
  </div>
</template>

<script>
import { reactive, ref, getCurrentInstance, onMounted } from "vue";
import RecipePreview from "../components/RecipePreview.vue";

export default {
  name: "SearchPage",
  components: {
    RecipePreview,
  },
  setup() {
    const internalInstance = getCurrentInstance();
    const store = internalInstance.appContext.config.globalProperties.store;
    const axios = internalInstance.appContext.config.globalProperties.axios;
    const toast = internalInstance.appContext.config.globalProperties.toast;
    const searchParams = reactive({
      query: "",
      number: "5", // Default is 5 as per requirements
      cuisine: "",
      diet: "",
      intolerance: "",
      sort: "time", // Default sort by preparation time
    });
    const searchResults = ref([]);
    const searching = ref(false);
    const hasSearched = ref(false);
    const isLastSearchLoaded = ref(false);
    const searchRecipes = async () => {
      if (!searchParams.query.trim()) {
        toast("Search Error", "Please enter a search term", "warning");
        return;
      }

      searching.value = true;
      isLastSearchLoaded.value = false; // This is a new search
      try {
        const params = {
          query: searchParams.query,
          number: searchParams.number,
          sort: searchParams.sort,
        };

        // Add optional parameters if they are set
        if (searchParams.cuisine) params.cuisine = searchParams.cuisine;
        if (searchParams.diet) params.diet = searchParams.diet;
        if (searchParams.intolerance)
          params.intolerance = searchParams.intolerance;

        const response = await axios.get("/recipes/search", { params });
        searchResults.value = response.data || [];
        hasSearched.value = true;

        if (searchResults.value.length === 0) {
          toast(
            "Search Complete",
            "No recipes found for your criteria",
            "info"
          );
        } else {
          toast(
            "Search Complete",
            `Found ${searchResults.value.length} recipes`,
            "success"
          );
        }
      } catch (error) {
        console.error("Search error:", error);
        searchResults.value = [];
        hasSearched.value = true;

        if (error.response?.status === 204) {
          toast(
            "Search Complete",
            "No recipes found for your criteria",
            "info"
          );
        } else {
          const errorMessage = error.response?.data?.message || "Search failed";
          toast("Search Error", errorMessage, "danger");
        }
      } finally {
        searching.value = false;
      }
    };
    const loadLastSearch = async () => {
      if (!store.username) return;

      try {
        const response = await axios.get("/users/lastSearch");
        if (response.data && response.data.length > 0) {
          searchResults.value = response.data;
          hasSearched.value = true;
          isLastSearchLoaded.value = true;
          toast("Last Search", "Loaded previous search results", "info");
        }
      } catch (error) {
        console.error("Error loading last search:", error);
        // Don't show error toast for this since it's automatic
      }
    };

    // Load last search when component mounts if user is logged in
    onMounted(() => {
      if (store.username) {
        loadLastSearch();
      }
    });
    return {
      searchParams,
      searchResults,
      searching,
      hasSearched,
      isLastSearchLoaded,
      searchRecipes,
      loadLastSearch,
      store,
    };
  },
};
</script>

<style scoped>
.search-form {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.no-results {
  text-align: center;
}

.search-results h3 {
  border-bottom: 2px solid #007bff;
  padding-bottom: 10px;
  margin-bottom: 20px;
}
</style>
