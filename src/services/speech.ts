/**
 * Speech Recognition and Audio Playback Service
 */

export interface SpeechRecognitionHandlers {
  onResult: (transcript: string) => void;
  onError: (error: string) => void;
  onEnd: () => void;
  onStart?: () => void;
}

export function isSpeechRecognitionSupported(): boolean {
  return typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window);
}

export function startSpeechRecognition(
  language: string,
  handlers: SpeechRecognitionHandlers
): { stop: () => void } {
  if (!isSpeechRecognitionSupported()) {
    handlers.onError('Speech recognition is not supported in this browser.');
    return { stop: () => {} };
  }

  const SpeechRecognition =
    (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  recognition.continuous = true;
  recognition.interimResults = true;

  // Map app language to speech lang code
  if (language === 'ta') {
    recognition.lang = 'ta-IN';
  } else {
    recognition.lang = 'en-US';
  }

  recognition.onstart = () => {
    handlers.onStart?.();
  };

  recognition.onresult = (event: any) => {
    let finalTranscript = '';
    for (let i = event.resultIndex; i < event.results.length; ++i) {
      if (event.results[i].isFinal) {
        finalTranscript += event.results[i][0].transcript;
      }
    }
    if (finalTranscript) {
      handlers.onResult(finalTranscript);
    }
  };

  recognition.onerror = (event: any) => {
    console.error('Speech recognition error:', event.error);
    handlers.onError(event.error || 'Speech recognition error occurred.');
  };

  recognition.onend = () => {
    handlers.onEnd();
  };

  try {
    recognition.start();
  } catch (err: any) {
    handlers.onError(err.message || 'Could not start microphone.');
  }

  return {
    stop: () => {
      try {
        recognition.stop();
      } catch {
        // ignore
      }
    },
  };
}

class AudioPlayerService {
  private currentAudio: HTMLAudioElement | null = null;
  private currentUrl: string | null = null;
  private onEndCallback: (() => void) | null = null;

  playAudio(audioDataUri: string, onEnd?: () => void): void {
    this.stopAudio();

    this.currentAudio = new Audio(audioDataUri);
    this.currentUrl = audioDataUri;
    this.onEndCallback = onEnd || null;

    this.currentAudio.onended = () => {
      this.currentAudio = null;
      this.currentUrl = null;
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    };

    this.currentAudio.onerror = (e) => {
      console.error('Audio playback error:', e);
      this.currentAudio = null;
      this.currentUrl = null;
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    };

    this.currentAudio.play().catch((err) => {
      console.error('Failed to play audio:', err);
      this.currentAudio = null;
      this.currentUrl = null;
      if (this.onEndCallback) {
        this.onEndCallback();
      }
    });
  }

  stopAudio(): void {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.currentAudio = null;
      this.currentUrl = null;
      if (this.onEndCallback) {
        this.onEndCallback();
        this.onEndCallback = null;
      }
    }
  }

  isPlaying(): boolean {
    return this.currentAudio !== null && !this.currentAudio.paused;
  }
}

export const audioPlayer = new AudioPlayerService();
