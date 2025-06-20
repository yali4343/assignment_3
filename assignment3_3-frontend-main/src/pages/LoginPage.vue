<template>
  <div class="login-page">
    <h1>Login</h1>
    <form @submit.prevent="login">
      <div class="form-group">
        <label>Username:</label>
        <input v-model="state.username" type="text" class="form-control" />
        <div v-if="v$.username.$error" class="text-danger">
          Username is required.
        </div>
      </div>
      <div class="form-group">
        <label>Password:</label>
        <div class="password-input-wrapper">
          <input
            v-model="state.password"
            :type="showPassword ? 'text' : 'password'"
            class="form-control"
          />
          <button
            type="button"
            class="password-toggle-btn"
            @click="showPassword = !showPassword"
          >
            <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
          </button>
        </div>
        <div v-if="v$.password.$error" class="text-danger">
          Password is required (at least 6 characters).
        </div>
      </div>
      <button type="submit" class="btn btn-primary mt-3">Login</button>
    </form>

    <div class="register-link mt-3 text-center">
      <p class="mb-1">Don't have an account?</p>
      <router-link to="/register" class="btn btn-outline-secondary">
        Create Account
      </router-link>
    </div>
  </div>
</template>

<script>
import { reactive, ref, getCurrentInstance } from "vue";
import { useVuelidate } from "@vuelidate/core";
import { required, minLength } from "@vuelidate/validators";

export default {
  name: "LoginPage",
  setup() {
    const internalInstance = getCurrentInstance();
    const store = internalInstance.appContext.config.globalProperties.store;
    const toast = internalInstance.appContext.config.globalProperties.toast;
    const router = internalInstance.appContext.config.globalProperties.$router;
    const axios = internalInstance.appContext.config.globalProperties.axios;

    const showPassword = ref(false);

    const state = reactive({
      username: "",
      password: "",
    });

    const rules = {
      username: { required },
      password: { required, minLength: minLength(6) },
    };

    const v$ = useVuelidate(rules, state);

    const login = async () => {
      if (await v$.value.$validate()) {
        try {
          const response = await axios.post("/Login", {
            username: state.username,
            password: state.password,
          });

          if (response.data.success) {
            store.login(state.username);
            toast("Login Successful", "Welcome back!", "success");
            router.push("/").catch(() => {});
          }
        } catch (err) {
          const errorMessage = err.response?.data?.message || "Login failed";
          toast("Login Failed", errorMessage, "danger");
        }
      }
    };

    return { state, v$, login, showPassword };
  },
};
</script>

<style scoped>
.login-page {
  max-width: 400px;
  margin: 50px auto;
  padding: 30px;
  background-color: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.login-page h1 {
  text-align: center;
  margin-bottom: 30px;
  color: #495057;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 5px;
  color: #495057;
}

.password-input-wrapper {
  position: relative;
}

.password-toggle-btn {
  position: absolute;
  right: 10px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.password-toggle-btn:hover {
  color: #495057;
}

.password-input-wrapper input {
  padding-right: 40px;
}

.btn-primary {
  width: 100%;
  padding: 12px;
  font-weight: 600;
}

.register-link {
  border-top: 1px solid #dee2e6;
  padding-top: 20px;
  margin-top: 20px;
}

.register-link p {
  color: #6c757d;
  font-size: 0.9rem;
}

.btn-outline-secondary {
  padding: 8px 20px;
  font-weight: 600;
  border-color: #6c757d;
  color: #6c757d;
}

.btn-outline-secondary:hover {
  background-color: #6c757d;
  border-color: #6c757d;
  color: white;
}
</style>
