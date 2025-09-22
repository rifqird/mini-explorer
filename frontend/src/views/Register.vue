<!-- src/views/Register.vue -->
<script setup lang="ts">
import { ref } from "vue";
import api from "../api";
import { useRouter } from "vue-router";

const router = useRouter();
const name = ref("");
const password = ref("");
const error = ref("");

async function handleRegister() {
  try {
    await api.post("/auth/register", {
      username: name.value,
      password: password.value,
    });

    router.push("/login");
  } catch (err: any) {
    error.value = err.response?.data?.message || "Failed to register";
  }
}
</script>

<template>
  <div class="register-container">
    <h2>Register</h2>
    <form @submit.prevent="handleRegister">
      <input v-model="name" placeholder="Name" required />
      <input v-model="password" type="password" placeholder="Password" required />
      <button type="submit">Register</button>
    </form>
    <p v-if="error" class="error">{{ error }}</p>

    <router-link to="/login">Already have an account? Login</router-link>
  </div>
</template>

<style scoped>
.register-container {
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