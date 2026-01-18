<template>
  <v-container fluid class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" sm="8" md="4">
        <v-card elevation="12">
          <v-card-title class="text-h4 text-center py-6">
            Login
          </v-card-title>
          <v-card-text>
            <v-form @submit.prevent="handleLogin">
              <v-text-field
                v-model="email"
                label="Email"
                type="email"
                prepend-inner-icon="mdi-email"
                :error-messages="errors.email"
              />
              <v-text-field
                v-model="password"
                label="Password"
                type="password"
                prepend-inner-icon="mdi-lock"
                :error-messages="errors.password"
              />
              <v-btn
                type="submit"
                color="primary"
                block
                size="large"
                :loading="isLoading"
                class="mt-4"
              >
                Login
              </v-btn>
            </v-form>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useAuth } from '@/composables/useAuth';

const { login, isLoading } = useAuth();

const email = ref('');
const password = ref('');
const errors = ref({ email: '', password: '' });

const handleLogin = async () => {
  try {
    await login({ email: email.value, password: password.value });
  } catch (err) {
    console.error(err);
  }
};
</script>
