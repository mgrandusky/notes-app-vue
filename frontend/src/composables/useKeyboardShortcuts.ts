import { ref, onMounted, onUnmounted } from 'vue';

export interface KeyboardShortcut {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  meta?: boolean;
  callback: (event: KeyboardEvent) => void;
  description?: string;
}

export const useKeyboardShortcuts = (shortcuts: KeyboardShortcut[]) => {
  const activeShortcuts = ref<KeyboardShortcut[]>(shortcuts);

  const matchesShortcut = (event: KeyboardEvent, shortcut: KeyboardShortcut): boolean => {
    const key = event.key.toLowerCase();
    const shortcutKey = shortcut.key.toLowerCase();

    if (key !== shortcutKey) return false;
    if (!!shortcut.ctrl !== event.ctrlKey) return false;
    if (!!shortcut.shift !== event.shiftKey) return false;
    if (!!shortcut.alt !== event.altKey) return false;
    if (!!shortcut.meta !== event.metaKey) return false;

    return true;
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement;
    const isInput = ['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName);
    
    for (const shortcut of activeShortcuts.value) {
      if (matchesShortcut(event, shortcut)) {
        if (!isInput || shortcut.ctrl || shortcut.meta) {
          event.preventDefault();
          shortcut.callback(event);
        }
        break;
      }
    }
  };

  const addShortcut = (shortcut: KeyboardShortcut) => {
    activeShortcuts.value.push(shortcut);
  };

  const removeShortcut = (key: string) => {
    activeShortcuts.value = activeShortcuts.value.filter(s => s.key !== key);
  };

  const clearShortcuts = () => {
    activeShortcuts.value = [];
  };

  onMounted(() => {
    window.addEventListener('keydown', handleKeyDown);
  });

  onUnmounted(() => {
    window.removeEventListener('keydown', handleKeyDown);
  });

  return {
    activeShortcuts,
    addShortcut,
    removeShortcut,
    clearShortcuts,
  };
};
