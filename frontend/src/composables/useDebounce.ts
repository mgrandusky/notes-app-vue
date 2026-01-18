import { ref, onUnmounted } from 'vue';

export const useDebounce = <T extends (...args: any[]) => any>(
  fn: T,
  delay: number = 300
) => {
  const timeoutId = ref<number | null>(null);

  const debouncedFn = (...args: Parameters<T>) => {
    if (timeoutId.value !== null) {
      clearTimeout(timeoutId.value);
    }

    timeoutId.value = window.setTimeout(() => {
      fn(...args);
    }, delay);
  };

  const cancel = () => {
    if (timeoutId.value !== null) {
      clearTimeout(timeoutId.value);
      timeoutId.value = null;
    }
  };

  onUnmounted(() => {
    cancel();
  });

  return {
    debouncedFn,
    cancel,
  };
};

export const useDebouncedRef = <T>(initialValue: T, delay: number = 300) => {
  const immediate = ref<T>(initialValue);
  const debounced = ref<T>(initialValue);
  const timeoutId = ref<number | null>(null);

  const updateDebounced = (value: T) => {
    immediate.value = value;
    
    if (timeoutId.value !== null) {
      clearTimeout(timeoutId.value);
    }

    timeoutId.value = window.setTimeout(() => {
      debounced.value = value;
    }, delay);
  };

  onUnmounted(() => {
    if (timeoutId.value !== null) {
      clearTimeout(timeoutId.value);
    }
  });

  return {
    immediate,
    debounced,
    updateDebounced,
  };
};
