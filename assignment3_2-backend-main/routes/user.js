/**
 * User Routes Module
 *
 * This module handles all user-specific API endpoints, including:
 * - Favorite recipes management
 * - Watched recipes tracking
 * - Private recipes management
 * - Family recipes management
 * - User preferences and history
 *
 * All routes in this module require authentication.
 */
var express = require("express");
var router = express.Router();
const DButils = require("./utils/DButils");
const user_utils = require("./utils/user_utils");
const recipe_utils = require("./utils/recipes_utils");
const { auth, validation } = require("../middleware");

/**
 * Check if a username is already taken
 *
 * @route GET /users/checkUsername/:username
 * @param {string} req.params.username - Username to check
 * @returns {Object} Object indicating if username exists
 * @returns {number} res.status - 200 with exists flag
 */
router.get("/checkUsername/:username", async (req, res, next) => {
  try {
    const username = req.params.username.trim();
    console.log(`Checking username: "${username}"`);

    // Escape username to prevent SQL injection
    const escapedUsername = username.replace(/'/g, "''");

    const result = await DButils.execQuery(
      `SELECT username FROM users WHERE username='${escapedUsername}'`
    );

    console.log(`Raw query result:`, result);
    console.log(`Result type:`, typeof result);
    console.log(`Result is array:`, Array.isArray(result));

    // Handle different MySQL result formats
    let users = result;
    if (
      Array.isArray(result) &&
      result.length === 2 &&
      Array.isArray(result[0])
    ) {
      // MySQL2 format: [rows, fields]
      users = result[0];
    } else if (
      Array.isArray(result) &&
      result.length > 0 &&
      result[0] &&
      typeof result[0] === "object"
    ) {
      // Direct rows array
      users = result;
    } else {
      // Fallback
      users = Array.isArray(result) ? result : [];
    }

    console.log(`Processed users:`, users);
    console.log(`Users count: ${users.length}`);

    const exists = users.length > 0;
    const responseData = {
      exists: exists,
      message: exists ? "Username is taken" : "Username is available",
      debug: {
        rawResult: result,
        processedUsers: users,
        usersLength: users.length,
      },
    };

    console.log(`Sending response:`, responseData);
    res.status(200).send(responseData);
  } catch (error) {
    console.error("Error in checkUsername:", error);
    next(error);
  }
});

/**
 * Apply authentication middleware to all routes below this point
 *
 * This ensures all user-related endpoints are protected and can only
 * be accessed by authenticated users with valid sessions.
 */
router.use(auth.authenticate);

/**
 * Add a recipe to user's favorites list
 *
 * @route POST /users/favorites
 * @authentication Required
 * @param {number} req.body.recipeId - ID of the recipe to add to favorites
 * @returns {Object} Success message
 * @returns {number} res.status - 200 on success, 400 if recipe doesn't exist
 * @throws {Error} If database operation fails
 */
router.post("/favorites", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipe_id = req.body.recipeId;

    // Check if recipe exists in Spoonacular
    try {
      await recipe_utils.getRecipeDetails(recipe_id);
    } catch (err) {
      res
        .status(400)
        .send({ message: "Recipe does not exist", success: false });
      return;
    }

    await user_utils.markAsFavorite(user_id, recipe_id);
    res.status(200).send({
      message: "Recipe successfully saved as favorite",
      success: true,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get all favorite recipes for the logged-in user
 *
 * @route GET /users/favorites
 * @authentication Required
 * @returns {Array<Object>} Array of recipe preview objects
 * @returns {number} res.status - 200 on success
 * @throws {Error} If database query fails
 */
router.get("/favorites", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getFavoriteRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id)); //extracting the recipe ids into array
    // If no favorite recipes found, return empty array
    if (recipes_id_array.length === 0) {
      res.status(200).send([]);
      return;
    }
    // Use enhanced preview function to include like information
    const results = await recipe_utils.getRecipesPreviewWithLikes(
      recipes_id_array,
      user_id
    );
    res.status(200).send(results.filter((recipe) => recipe !== null));
  } catch (error) {
    next(error);
  }
});

/**
 * Remove a recipe from user's favorites list
 *
 * @route DELETE /users/favorites
 * @authentication Required
 * @param {number} req.query.recipeId - ID of the recipe to remove from favorites
 * @returns {Object} Success message
 * @returns {number} res.status - 200 on success, 404 if recipe was not in favorites
 * @throws {Error} If database operation fails
 */
router.delete("/favorites", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipe_id = req.query.recipeId;

    const removed = await user_utils.removeFavorite(user_id, recipe_id);

    if (removed) {
      res.status(200).send({
        message: "Recipe successfully removed from favorites",
        success: true,
      });
    } else {
      res
        .status(404)
        .send({ message: "Recipe was not in favorites", success: false });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * Mark a recipe as watched by the user
 *
 * If recipe was previously watched, this updates the timestamp.
 *
 * @route POST /users/markwatched/:recipeId
 * @authentication Required
 * @param {string} req.params.recipeId - ID of the recipe to mark as watched
 * @returns {Object} Success message
 * @returns {number} res.status - 200 on success
 * @throws {Error} If database operation fails
 */
router.post("/markwatched/:recipeId", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipe_id = req.params.recipeId;

    await user_utils.markAsWatched(user_id, recipe_id);
    res
      .status(200)
      .send({ message: "Recipe marked as watched", success: true });
  } catch (error) {
    next(error);
  }
});

/**
 * Delete all watched recipes history for the user
 *
 * @route DELETE /users/deleteWatchedRecipes
 * @authentication Required
 * @returns {Object} Success message with count of deleted records
 * @returns {number} res.status - 200 on success
 * @throws {Error} If database operation fails
 */
router.delete("/deleteWatchedRecipes", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;

    const deletedCount = await user_utils.deleteAllWatchedRecipes(user_id);
    res.status(200).send({
      message: "Watched recipes history cleared",
      success: true,
      deletedCount: deletedCount,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get the last 3 recipes watched by the user
 *
 * Returns recipes ordered by most recently watched first.
 *
 * @route GET /users/lastWatchedRecipes
 * @authentication Required
 * @returns {Array<Object>} Array of recipe preview objects
 * @returns {number} res.status - 200 on success
 * @throws {Error} If database query fails
 */
router.get("/lastWatchedRecipes", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getLastWatchedRecipes(user_id, 3);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id));
    const results = await recipe_utils.getRecipesPreviewWithLikes(
      recipes_id_array,
      user_id
    );
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});

/**
 * Get all recipes watched by the user
 *
 * Returns recipes ordered by most recently watched first.
 *
 * @route GET /users/allWatchedRecipes
 * @authentication Required
 * @returns {Array<Object>} Array of recipe preview objects
 * @returns {number} res.status - 200 on success
 * @throws {Error} If database query fails
 */
router.get("/allWatchedRecipes", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipes_id = await user_utils.getWatchedRecipes(user_id);
    let recipes_id_array = [];
    recipes_id.map((element) => recipes_id_array.push(element.recipe_id));
    const results = await recipe_utils.getRecipesPreviewWithLikes(
      recipes_id_array,
      user_id
    );
    res.status(200).send(results);
  } catch (error) {
    next(error);
  }
});

/**
 * Get the last search results from session
 *
 * Returns the recipes from the most recent search operation
 * saved in the user's session.
 *
 * @route GET /users/lastSearch
 * @authentication Required
 * @returns {Array<Object>} Array of recipe preview objects or empty array
 * @returns {number} res.status - 200 on success
 */
router.get("/lastSearch", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;

    // Get search history from database instead of session
    const searchHistory = await user_utils.getSearchHistory(user_id);

    if (searchHistory && searchHistory.search_results) {
      res.status(200).send(searchHistory.search_results);
    } else {
      res.status(200).send([]);
    }
  } catch (error) {
    next(error);
  }
});

/**
 * Get all private recipes created by the user
 *
 * @route GET /users/myRecipes
 * @authentication Required
 * @returns {Array<Object>} Array of private recipe preview objects
 * @returns {number} res.status - 200 on success
 * @throws {Error} If database query fails
 */
router.get("/myRecipes", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipes = await user_utils.getPrivateRecipes(user_id);
    res.status(200).send(recipes);
  } catch (error) {
    next(error);
  }
});

/**
 * Add a new private recipe for the user
 *
 * @route POST /users/myRecipes
 * @authentication Required
 * @validation validatePrivateRecipe
 * @param {Object} req.body - Recipe details
 * @param {string} req.body.title - Recipe title (required)
 * @param {number} [req.body.readyInMinutes] - Preparation time in minutes
 * @param {string} [req.body.image] - Recipe image URL
 * @param {number} [req.body.popularity] - Recipe popularity rating
 * @param {boolean} [req.body.vegan] - Whether the recipe is vegan
 * @param {boolean} [req.body.vegetarian] - Whether the recipe is vegetarian
 * @param {boolean} [req.body.glutenFree] - Whether the recipe is gluten-free
 * @param {Array} [req.body.ingredients] - List of ingredients
 * @param {string} [req.body.instructions] - Preparation instructions
 * @param {number} req.body.servings - Number of servings (required)
 * @returns {Object} Success message with recipe_id
 * @returns {number} res.status - 201 on success
 * @throws {Error} If validation fails or database operation fails
 */
router.post(
  "/myRecipes",
  validation.validatePrivateRecipe,
  async (req, res, next) => {
    try {
      const user_id = req.session.user_id;
      const recipe_details = req.body;

      const recipe_id = await user_utils.addPrivateRecipe(
        user_id,
        recipe_details
      );
      res.status(201).send({
        message: "Recipe created successfully",
        success: true,
        recipe_id: recipe_id,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * Get full details of a specific private recipe
 *
 * @route GET /users/myRecipes/:recipeId
 * @authentication Required
 * @param {string} req.params.recipeId - ID of the private recipe to retrieve
 * @returns {Object} Complete recipe details
 * @returns {number} res.status - 200 on success
 * @throws {Error} If recipe not found or not owned by user
 */
router.get("/myRecipes/:recipeId", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipe_id = req.params.recipeId;

    const recipe = await user_utils.getPrivateRecipeDetails(recipe_id, user_id);
    res.status(200).send(recipe);
  } catch (error) {
    next(error);
  }
});

/**
 * Delete a specific private recipe
 *
 * @route DELETE /users/myRecipes/:recipeId
 * @authentication Required
 * @param {string} req.params.recipeId - ID of the private recipe to delete
 * @returns {Object} Success message
 * @returns {number} res.status - 200 on success
 * @throws {Error} If recipe not found, not owned by user, or delete operation fails
 */
router.delete("/myRecipes/:recipeId", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipe_id = req.params.recipeId;

    await user_utils.deletePrivateRecipe(user_id, recipe_id);
    res.status(200).send({
      message: "Recipe deleted successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Get all family recipes for the logged-in user
 *
 * @route GET /users/familyRecipes
 * @authentication Required
 * @returns {Array<Object>} Array of family recipe objects
 * @returns {number} res.status - 200 on success, 204 when fewer than 3 recipes
 * @throws {Error} If database query fails
 */
router.get("/familyRecipes", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipes = await user_utils.getAllFamilyRecipes(user_id);
    res.status(200).send(recipes);
  } catch (error) {
    if (error.status === 204) {
      res.status(204).send({ message: error.message, success: false });
    } else {
      next(error);
    }
  }
});

/**
 * Get full details of a specific family recipe
 *
 * @route GET /users/familyRecipes/:recipeId
 * @authentication Required
 * @param {string} req.params.recipeId - ID of the family recipe to retrieve
 * @returns {Object} Family recipe details
 * @returns {number} res.status - 200 on success
 * @throws {Error} If recipe not found or not owned by user
 */
router.get("/familyRecipes/:recipeId", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipe = await user_utils.getFamilyRecipeDetails(
      req.params.recipeId,
      user_id
    );
    res.status(200).send(recipe);
  } catch (error) {
    next(error);
  }
});

/**
 * Add a new family recipe for the user
 *
 * @route POST /users/familyRecipes
 * @authentication Required
 * @param {Object} req.body - Recipe details
 * @param {string} req.body.recipe_name - Recipe name (required)
 * @param {string} req.body.owner_name - Recipe owner (required)
 * @param {string} req.body.when_to_prepare - When to prepare (required)
 * @param {Array} req.body.ingredients - List of ingredients (required)
 * @param {string} req.body.instructions - Preparation instructions (required)
 * @param {string} [req.body.image_url] - Recipe image URL
 * @returns {Object} Success message with recipe_id
 * @returns {number} res.status - 201 on success
 * @throws {Error} If validation fails or database operation fails
 */
router.post("/familyRecipes", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipe_details = req.body;

    // Basic validation, more can be added in user_utils if needed
    if (
      !recipe_details.recipe_name ||
      !recipe_details.owner_name ||
      !recipe_details.when_to_prepare ||
      !recipe_details.ingredients ||
      !recipe_details.instructions
    ) {
      return res
        .status(400)
        .send({ message: "Missing required recipe fields", success: false });
    }

    const recipe_id = await user_utils.addFamilyRecipe(user_id, recipe_details);
    res.status(201).send({
      message: "Family recipe created successfully",
      success: true,
      recipe_id: recipe_id,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * Delete a specific family recipe
 *
 * @route DELETE /users/familyRecipes/:recipeId
 * @authentication Required
 * @param {string} req.params.recipeId - ID of the family recipe to delete
 * @returns {Object} Success message
 * @returns {number} res.status - 200 on success
 * @throws {Error} If recipe not found, not owned by user, or delete operation fails
 */
router.delete("/familyRecipes/:recipeId", async (req, res, next) => {
  try {
    const user_id = req.session.user_id;
    const recipe_id = req.params.recipeId;

    await user_utils.deleteFamilyRecipe(user_id, recipe_id);
    res.status(200).send({
      message: "Family recipe deleted successfully",
      success: true,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
