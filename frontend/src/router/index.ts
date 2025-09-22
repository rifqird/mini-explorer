import { createRouter, createWebHistory } from "vue-router";
import Explorer from "../views/Explorer.vue";
import Login from "../views/Login.vue";
import Register from "@/views/Register.vue";

const routes = [
  { path: "/",redirect:"/login"},
  { path: "/login", component: Login },
  { path: "/register", component: Register },
  { path: "/explorer", component: Explorer, meta: { requiresAuth: true } },
];

const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Middleware cek auth
router.beforeEach((to, from, next) => {
  if (to.meta.requiresAuth && !localStorage.getItem("token")) {
    next("/login");
  } else {
    next();
  }
});

export default router;