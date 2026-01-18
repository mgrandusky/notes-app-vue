import { createApp } from 'vue';
import { VueQueryPlugin } from '@tanstack/vue-query';
import App from './App.vue';
import router from './router';
import pinia from './plugins/pinia';
import vuetify from './plugins/vuetify';

const app = createApp(App);

app.use(pinia);
app.use(router);
app.use(vuetify);
app.use(VueQueryPlugin, {
  queryClientConfig: {
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        retry: 1,
        staleTime: 5 * 60 * 1000,
      },
    },
  },
});

app.mount('#app');
