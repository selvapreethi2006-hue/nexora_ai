export interface MessageAttachment {
  id: string;
  name: string;
  type: string;
  size: number;
  data: string; // base64 representation
  previewUrl?: string;
}

export interface GroundingSource {
  uri: string;
  title: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  attachments?: MessageAttachment[];
  sources?: GroundingSource[];
  error?: boolean;
  errorMessage?: string;
  isStreaming?: boolean;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: number;
  updatedAt: number;
  messages: ChatMessage[];
  preferredLanguage?: 'auto' | 'en' | 'ta' | 'tanglish';
}

export interface AppSettings {
  theme: 'dark' | 'light' | 'system';
  preferredLanguage: 'auto' | 'en' | 'ta' | 'tanglish';
  responseStyle: 'balanced' | 'technical' | 'creative' | 'concise';
  enableWebSearch: boolean;
  ttsVoice: 'Kore' | 'Fenrir' | 'Zephyr' | 'Puck' | 'Charon';
  fontSize: 'sm' | 'md' | 'lg';
  autoScroll: boolean;
}

export interface BackendConfig {
  status: string;
  brand: string;
  tagline: string;
  model: string;
  hasApiKey: boolean;
  features: {
    webSearch: boolean;
    streaming: boolean;
    tts: boolean;
    fileUpload: boolean;
    multilingual: boolean;
  };
}
