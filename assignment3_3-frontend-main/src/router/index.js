import { createRouter, createWebHistory } from "vue-router";
import Main from "../pages/MainPage.vue";
import NotFound from "../pages/NotFoundPage.vue";

const routes = [
  {
    path: "/",
    name: "main",
    component: Main,
  },
  {
    path: "/register",
    name: "register",
    component: () => import("../pages/RegisterPage.vue"),
  },
  {
    path: "/login",
    name: "login",
    component: () => import("../pages/LoginPage.vue"),
  },
  {
    path: "/search",
    name: "search",
    component: () => import("../pages/SearchPage.vue"),
  },
  {
    path: "/about",
    name: "about",
    component: () => import("../pages/AboutPage.vue"),
  },
  {
    path: "/create-recipe",
    name: "createRecipe",
    component: () => import("../pages/CreateRecipePage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/recipe/:recipeId",
    name: "recipe",
    component: () => import("../pages/RecipeViewPage.vue"),
  },
  {
    path: "/favorites",
    name: "favorites",
    component: () => import("../pages/FavoritesPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/myRecipes",
    name: "myRecipes",
    component: () => import("../pages/MyRecipesPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/familyRecipes",
    name: "familyRecipes",
    component: () => import("../pages/FamilyRecipesPage.vue"),
    meta: { requiresAuth: true },
  },
  {
    path: "/404",
    alias: "/NotFound",
    name: "notFound",
    component: NotFound,
  },
  {
    path: "/:catchAll(.*)",
    redirect: "/404",
  },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;
