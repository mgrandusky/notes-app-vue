import { ref, computed } from 'vue';

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export const useVoiceRecognition = () => {
  const isSupported = computed(() => {
    return 'SpeechRecognition' in window || 'webkitSpeechRecognition' in window;
  });

  const isListening = ref(false);
  const transcript = ref('');
  const interimTranscript = ref('');
  const error = ref<string | null>(null);

  let recognition: any = null;

  const initialize = () => {
    if (!isSupported.value) {
      error.value = 'Speech recognition is not supported in this browser';
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || (window as any).webkitSpeechRecognition;
    recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      isListening.value = true;
      error.value = null;
    };

    recognition.onend = () => {
      isListening.value = false;
    };

    recognition.onerror = (event: any) => {
      error.value = event.error;
      isListening.value = false;
    };

    recognition.onresult = (event: any) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcriptPart = result[0].transcript;

        if (result.isFinal) {
          final += transcriptPart + ' ';
        } else {
          interim += transcriptPart;
        }
      }

      if (final) {
        transcript.value += final;
      }
      interimTranscript.value = interim;
    };
  };

  const start = () => {
    if (!recognition) {
      initialize();
    }

    if (recognition && !isListening.value) {
      try {
        recognition.start();
      } catch (err) {
        error.value = err instanceof Error ? err.message : 'Failed to start recognition';
      }
    }
  };

  const stop = () => {
    if (recognition && isListening.value) {
      recognition.stop();
    }
  };

  const reset = () => {
    transcript.value = '';
    interimTranscript.value = '';
    error.value = null;
  };

  const setLanguage = (lang: string) => {
    if (recognition) {
      recognition.lang = lang;
    }
  };

  return {
    isSupported,
    isListening,
    transcript,
    interimTranscript,
    error,
    start,
    stop,
    reset,
    setLanguage,
  };
};
