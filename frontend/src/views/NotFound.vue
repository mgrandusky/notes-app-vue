<template>
  <v-container class="fill-height">
    <v-row align="center" justify="center">
      <v-col cols="12" class="text-center">
        <v-icon size="120" color="error">mdi-alert-circle-outline</v-icon>
        <h1 class="text-h2 mt-4">404</h1>
        <p class="text-h5 mt-2">Page Not Found</p>
        <v-btn
          color="primary"
          size="large"
          class="mt-4"
          to="/notes"
        >
          Go to Notes
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script setup lang="ts">
</script>
