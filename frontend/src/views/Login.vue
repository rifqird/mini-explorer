<script setup lang="ts">
import { ref } from "vue";
import api from "../api";
import { useRouter } from "vue-router";

const username = ref("");
const password = ref("");
const router = useRouter();
const error = ref("");

async function login() {
  try {
    const res = await api.post("/auth/login", {
      username: username.value,
      password: password.value,
    });
    localStorage.setItem("token", res.data.token);
    router.push("/explorer");
  } catch (err) {
    error.value = "Login gagal. Periksa username/password.";
  }
}
</script>

<template>
  <div class="login-box">
    <h2>Login</h2>
    <input v-model="username" placeholder="Username" />
    <input v-model="password" type="password" placeholder="Password" /><br>
    <button @click="login">Login</button>
    <router-link to="/register">Create new account</router-link>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<style scoped>
.login-box {
  max-width: 300px;
  margin: 50px auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 6px;
}
.error {
  color: red;
}
</style>