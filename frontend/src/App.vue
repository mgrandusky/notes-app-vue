<template>
  <v-app>
    <v-main>
      <router-view v-slot="{ Component }">
        <transition name="fade" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </v-main>

    <v-snackbar
      v-for="notification in notifications"
      :key="notification.id"
      :model-value="true"
      :color="notification.type"
      :timeout="notification.duration || 3000"
      location="top right"
      class="notification-snackbar"
      @update:model-value="removeNotification(notification.id)"
    >
      <div class="d-flex align-center justify-space-between">
        <span>{{ notification.message }}</span>
        <v-btn
          v-if="notification.action"
          variant="text"
          size="small"
          @click="notification.action.callback"
        >
          {{ notification.action.label }}
        </v-btn>
      </div>
    </v-snackbar>

    <v-banner
      v-if="isOffline"
      color="warning"
      icon="mdi-wifi-off"
      sticky
      lines="one"
    >
      <template #text>
        You are currently offline. Some features may not be available.
      </template>
    </v-banner>
  </v-app>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { storeToRefs } from 'pinia';
import { useAuthStore, useUIStore } from '@/stores';

const authStore = useAuthStore();
const uiStore = useUIStore();

const { notifications, isOffline } = storeToRefs(uiStore);
const { removeNotification } = uiStore;

onMounted(() => {
  authStore.initializeAuth();
  uiStore.initializeUI();
});
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.notification-snackbar {
  z-index: 9999;
}
</style>
