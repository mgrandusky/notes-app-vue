import { ref, onUnmounted } from 'vue';
import { io, Socket } from 'socket.io-client';
import { WS_BASE_URL } from '@/utils/constants';
import type { WebSocketNoteUpdate, WebSocketCursorUpdate } from '@/types/api.types';

export const useWebSocket = () => {
  const socket = ref<Socket | null>(null);
  const isConnected = ref(false);
  const error = ref<string | null>(null);

  const connect = (token: string) => {
    if (socket.value?.connected) {
      return;
    }

    socket.value = io(WS_BASE_URL, {
      auth: {
        token,
      },
      reconnection: true,
      reconnectionDelay: 1000,
      reconnectionAttempts: 5,
    });

    socket.value.on('connect', () => {
      isConnected.value = true;
      error.value = null;
    });

    socket.value.on('disconnect', () => {
      isConnected.value = false;
    });

    socket.value.on('error', (err: Error) => {
      error.value = err.message;
    });

    socket.value.on('connect_error', (err: Error) => {
      error.value = err.message;
    });
  };

  const disconnect = () => {
    if (socket.value) {
      socket.value.disconnect();
      socket.value = null;
      isConnected.value = false;
    }
  };

  const joinNote = (noteId: string) => {
    if (socket.value?.connected) {
      socket.value.emit('join:note', noteId);
    }
  };

  const leaveNote = (noteId: string) => {
    if (socket.value?.connected) {
      socket.value.emit('leave:note', noteId);
    }
  };

  const sendNoteUpdate = (update: WebSocketNoteUpdate) => {
    if (socket.value?.connected) {
      socket.value.emit('note:update', update);
    }
  };

  const sendCursorUpdate = (update: WebSocketCursorUpdate) => {
    if (socket.value?.connected) {
      socket.value.emit('cursor:move', update);
    }
  };

  const onNoteUpdate = (callback: (update: WebSocketNoteUpdate) => void) => {
    if (socket.value) {
      socket.value.on('note:update', callback);
    }
  };

  const onCursorMove = (callback: (update: WebSocketCursorUpdate) => void) => {
    if (socket.value) {
      socket.value.on('cursor:move', callback);
    }
  };

  const onUserOnline = (callback: (data: { userId: string; userName: string }) => void) => {
    if (socket.value) {
      socket.value.on('user:online', callback);
    }
  };

  const onUserOffline = (callback: (data: { userId: string }) => void) => {
    if (socket.value) {
      socket.value.on('user:offline', callback);
    }
  };

  const offNoteUpdate = (callback?: (update: WebSocketNoteUpdate) => void) => {
    if (socket.value) {
      socket.value.off('note:update', callback);
    }
  };

  const offCursorMove = (callback?: (update: WebSocketCursorUpdate) => void) => {
    if (socket.value) {
      socket.value.off('cursor:move', callback);
    }
  };

  onUnmounted(() => {
    disconnect();
  });

  return {
    socket,
    isConnected,
    error,
    connect,
    disconnect,
    joinNote,
    leaveNote,
    sendNoteUpdate,
    sendCursorUpdate,
    onNoteUpdate,
    onCursorMove,
    onUserOnline,
    onUserOffline,
    offNoteUpdate,
    offCursorMove,
  };
};
