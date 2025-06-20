<template>
  <div class="register-page">
    <h1>Register</h1>
    <form @submit.prevent="register">
      <div class="form-group">
        <label>Username:</label>
        <input
          v-model="state.username"
          type="text"
          class="form-control"
          @blur="checkUsername"
          @input="clearUsernameMessages"
        />
        <div
          v-if="v$.username.$error && v$.username.$dirty"
          class="text-danger"
        >
          Username must be 3-8 characters long and contain only letters.
        </div>
        <div v-if="usernameChecking" class="text-info small">
          Checking username availability...
        </div>
        <div v-if="usernameMessage" class="text-danger">
          {{ usernameMessage }}
        </div>
        <div
          v-if="usernameAvailable && state.username.length >= 3"
          class="text-success small"
        >
          Username is available!
        </div>
      </div>
      <div class="form-group">
        <label>First Name:</label>
        <input v-model="state.firstname" type="text" class="form-control" />
        <div
          v-if="v$.firstname.$error && v$.firstname.$dirty"
          class="text-danger"
        >
          First name is required.
        </div>
      </div>
      <div class="form-group">
        <label>Last Name:</label>
        <input v-model="state.lastname" type="text" class="form-control" />
        <div
          v-if="v$.lastname.$error && v$.lastname.$dirty"
          class="text-danger"
        >
          Last name is required.
        </div>
      </div>
      <div class="form-group">
        <label>Country:</label>
        <select
          v-if="countries.length > 0"
          v-model="state.country"
          class="form-control"
        >
          <option value="">Select a country</option>
          <option
            v-for="country in countries"
            :key="country.cca2"
            :value="country.name.common"
          >
            {{ country.name.common }}
          </option>
        </select>
        <input
          v-else
          v-model="state.country"
          type="text"
          class="form-control"
          placeholder="Enter your country"
        />
        <div v-if="v$.country.$error && v$.country.$dirty" class="text-danger">
          Country is required.
        </div>
        <div v-if="countriesError" class="text-warning small">
          {{ countriesError }}
        </div>
      </div>
      <div class="form-group">
        <label>Email:</label>
        <input v-model="state.email" type="email" class="form-control" />
        <div v-if="v$.email.$error && v$.email.$dirty" class="text-danger">
          Valid email is required.
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
        <div
          v-if="v$.password.$error && v$.password.$dirty"
          class="text-danger"
        >
          Password must be 5-10 characters long with at least one number and one
          special character.
        </div>
      </div>
      <div class="form-group">
        <label>Confirm Password:</label>
        <div class="password-input-wrapper">
          <input
            v-model="state.confirmPassword"
            :type="showConfirmPassword ? 'text' : 'password'"
            class="form-control"
          />
          <button
            type="button"
            class="password-toggle-btn"
            @click="showConfirmPassword = !showConfirmPassword"
          >
            <i
              :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"
            ></i>
          </button>
        </div>
        <div
          v-if="
            v$.confirmPassword.$error &&
            v$.confirmPassword.$dirty &&
            state.password &&
            state.confirmPassword
          "
          class="text-danger"
        >
          Passwords must match.
        </div>
      </div>
      <button
        type="submit"
        class="btn btn-success mt-3"
        :disabled="isSubmitting"
      >
        {{ isSubmitting ? "Registering..." : "Register" }}
      </button>
    </form>
  </div>
</template>

<script>
import { reactive, ref, getCurrentInstance, onMounted } from "vue";
import { useVuelidate } from "@vuelidate/core";
import { required, email, helpers } from "@vuelidate/validators";

// Custom validator for username (3-8 letters only)
const usernameValidator = helpers.regex(/^[a-zA-Z]{3,8}$/);

// Custom validator for password (5-10 chars with at least one number and special char)
const passwordValidator = helpers.regex(
  /^(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{5,10}$/
);

// Custom validator for password confirmation
const passwordMatch = (value, siblings) => {
  return value === siblings.password;
};

export default {
  name: "RegisterPage",
  setup() {
    const internalInstance = getCurrentInstance();
    const toast = internalInstance.appContext.config.globalProperties.toast;
    const router = internalInstance.appContext.config.globalProperties.$router;
    const axios = internalInstance.appContext.config.globalProperties.axios;
    const isSubmitting = ref(false);
    const countries = ref([]);
    const countriesError = ref("");
    const usernameChecking = ref(false);
    const usernameMessage = ref("");
    const usernameAvailable = ref(false);
    const showPassword = ref(false);
    const showConfirmPassword = ref(false);

    const state = reactive({
      username: "",
      firstname: "",
      lastname: "",
      country: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
    const rules = {
      username: { required, usernameValidator },
      firstname: { required },
      lastname: { required },
      country: { required },
      email: { required, email },
      password: { required, passwordValidator },
      confirmPassword: {
        required,
        passwordMatch: helpers.withMessage(
          "Passwords must match",
          passwordMatch
        ),
      },
    };

    const v$ = useVuelidate(rules, state, { $lazy: true });

    // Fetch countries from REST Countries API
    const fetchCountries = async () => {
      try {
        // Try direct call first
        console.log("Fetching countries from REST Countries API...");
        const response = await fetch(
          "https://restcountries.com/v3.1/all?fields=name,cca2"
        );

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        countries.value = data.sort((a, b) =>
          a.name.common.localeCompare(b.name.common)
        );
        console.log("Countries loaded successfully:", countries.value.length);
      } catch (error) {
        console.error("Error fetching countries:", error);
        console.log("Using fallback country list...");

        // Fallback: provide a comprehensive list of countries
        countries.value = [
          { name: { common: "Afghanistan" }, cca2: "AF" },
          { name: { common: "Argentina" }, cca2: "AR" },
          { name: { common: "Australia" }, cca2: "AU" },
          { name: { common: "Austria" }, cca2: "AT" },
          { name: { common: "Belgium" }, cca2: "BE" },
          { name: { common: "Brazil" }, cca2: "BR" },
          { name: { common: "Canada" }, cca2: "CA" },
          { name: { common: "China" }, cca2: "CN" },
          { name: { common: "Denmark" }, cca2: "DK" },
          { name: { common: "Egypt" }, cca2: "EG" },
          { name: { common: "France" }, cca2: "FR" },
          { name: { common: "Germany" }, cca2: "DE" },
          { name: { common: "Greece" }, cca2: "GR" },
          { name: { common: "India" }, cca2: "IN" },
          { name: { common: "Israel" }, cca2: "IL" },
          { name: { common: "Italy" }, cca2: "IT" },
          { name: { common: "Japan" }, cca2: "JP" },
          { name: { common: "Jordan" }, cca2: "JO" },
          { name: { common: "Mexico" }, cca2: "MX" },
          { name: { common: "Netherlands" }, cca2: "NL" },
          { name: { common: "Norway" }, cca2: "NO" },
          { name: { common: "Poland" }, cca2: "PL" },
          { name: { common: "Russia" }, cca2: "RU" },
          { name: { common: "South Korea" }, cca2: "KR" },
          { name: { common: "Spain" }, cca2: "ES" },
          { name: { common: "Sweden" }, cca2: "SE" },
          { name: { common: "Switzerland" }, cca2: "CH" },
          { name: { common: "Turkey" }, cca2: "TR" },
          { name: { common: "United Kingdom" }, cca2: "GB" },
          { name: { common: "United States" }, cca2: "US" },
        ].sort((a, b) => a.name.common.localeCompare(b.name.common));

        countriesError.value =
          "Using offline country list (REST Countries API unavailable).";
      }
    }; // Load countries on component mount
    onMounted(() => {
      fetchCountries();
    });

    // Check if username exists in the database
    const checkUsername = async () => {
      // Only check if username meets basic requirements
      if (
        !state.username ||
        state.username.length < 3 ||
        state.username.length > 8 ||
        !/^[a-zA-Z]+$/.test(state.username)
      ) {
        usernameMessage.value = "";
        usernameAvailable.value = false;
        return;
      }

      usernameChecking.value = true;
      usernameMessage.value = "";
      usernameAvailable.value = false;

      try {
        const response = await axios.get(
          `/users/checkUsername/${state.username}`
        );

        if (response.data.exists) {
          usernameMessage.value =
            "The above username is already taken in the system";
          usernameAvailable.value = false;
        } else {
          usernameMessage.value = "";
          usernameAvailable.value = true;
        }
      } catch (error) {
        console.error("Error checking username:", error);
        // If check fails, clear messages and let registration handle it
        usernameMessage.value = "";
        usernameAvailable.value = false;
      } finally {
        usernameChecking.value = false;
      }
    };

    // Clear username messages when user starts typing
    const clearUsernameMessages = () => {
      usernameMessage.value = "";
      usernameAvailable.value = false;
    };

    const register = async () => {
      if (await v$.value.$validate()) {
        isSubmitting.value = true;
        try {
          const response = await axios.post("/Register", {
            username: state.username,
            firstname: state.firstname,
            lastname: state.lastname,
            country: state.country,
            email: state.email,
            password: state.password,
            passwordConfirmation: state.confirmPassword,
            profilePic: "", // Backend expects this field
          });

          if (response.data.success) {
            toast("Registration Successful", "You can now login", "success");
            router.push("/login").catch(() => {});
          }
        } catch (err) {
          const errorMessage =
            err.response?.data?.message || "Registration failed";
          toast("Registration Failed", errorMessage, "danger");
        } finally {
          isSubmitting.value = false;
        }
      }
    };
    return {
      state,
      v$,
      register,
      isSubmitting,
      countries,
      countriesError,
      usernameChecking,
      usernameMessage,
      usernameAvailable,
      checkUsername,
      clearUsernameMessages,
      showPassword,
      showConfirmPassword,
    };
  },
};
</script>

<style scoped>
.register-page {
  max-width: 500px;
  margin: 50px auto;
  padding: 30px;
  background-color: #f8f9fa;
  border-radius: 10px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.register-page h1 {
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

.btn-success {
  width: 100%;
  padding: 12px;
  font-weight: 600;
}

.btn-success:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.password-input-wrapper {
  position: relative;
  display: flex;
  align-items: center;
}

.password-input-wrapper .form-control {
  padding-right: 45px;
}

.password-toggle-btn {
  position: absolute;
  right: 10px;
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 5px;
  z-index: 5;
}

.password-toggle-btn:hover {
  color: #495057;
}

.password-toggle-btn:focus {
  outline: none;
}
</style>
