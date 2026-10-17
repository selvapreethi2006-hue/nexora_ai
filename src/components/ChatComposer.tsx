import React, { useState, useRef, useEffect } from 'react';
import { MessageAttachment } from '../types/chat';
import { startSpeechRecognition, isSpeechRecognitionSupported } from '../services/speech';
import {
  Send,
  Square,
  Paperclip,
  Globe,
  Mic,
  MicOff,
  X,
  FileText,
  AlertCircle,
  Sparkles,
} from 'lucide-react';

interface ChatComposerProps {
  onSendMessage: (content: string, attachments: MessageAttachment[]) => void;
  isGenerating: boolean;
  onStopGeneration: () => void;
  enableWebSearch: boolean;
  onToggleWebSearch: () => void;
  preferredLanguage: string;
}

export const ChatComposer: React.FC<ChatComposerProps> = ({
  onSendMessage,
  isGenerating,
  onStopGeneration,
  enableWebSearch,
  onToggleWebSearch,
  preferredLanguage,
}) => {
  const [input, setInput] = useState('');
  const [attachments, setAttachments] = useState<MessageAttachment[]>([]);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingError, setRecordingError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const speechRecognizerRef = useRef<{ stop: () => void } | null>(null);

  // Auto-resize textarea height
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      const scrollHeight = textareaRef.current.scrollHeight;
      textareaRef.current.style.height = `${Math.min(scrollHeight, 180)}px`;
    }
  }, [input]);

  const handleSend = () => {
    if ((!input.trim() && attachments.length === 0) || isGenerating) return;
    onSendMessage(input.trim(), attachments);
    setInput('');
    setAttachments([]);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Process uploaded files into MessageAttachment objects
  const processFiles = (files: FileList | File[]) => {
    const validFiles = Array.from(files);
    for (const file of validFiles) {
      // Limit to 10MB
      if (file.size > 10 * 1024 * 1024) {
        alert(`File "${file.name}" exceeds the 10MB limit.`);
        continue;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        const newAttachment: MessageAttachment = {
          id: `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          name: file.name,
          type: file.type || 'text/plain',
          size: file.size,
          data: result,
          previewUrl: file.type.startsWith('image/') ? result : undefined,
        };
        setAttachments((prev) => [...prev, newAttachment]);
      };

      reader.readAsDataURL(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  };

  const removeAttachment = (id: string) => {
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  // Drag and Drop
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      processFiles(e.dataTransfer.files);
    }
  };

  // Voice recording toggle
  const toggleRecording = () => {
    if (isRecording) {
      speechRecognizerRef.current?.stop();
      setIsRecording(false);
      return;
    }

    if (!isSpeechRecognitionSupported()) {
      setRecordingError('Voice recognition is not supported in this browser.');
      setTimeout(() => setRecordingError(null), 4000);
      return;
    }

    setRecordingError(null);
    const recognizer = startSpeechRecognition(preferredLanguage, {
      onStart: () => setIsRecording(true),
      onResult: (transcript) => {
        setInput((prev) => (prev ? `${prev} ${transcript}` : transcript));
      },
      onError: (err) => {
        setRecordingError(err);
        setIsRecording(false);
        setTimeout(() => setRecordingError(null), 4000);
      },
      onEnd: () => {
        setIsRecording(false);
      },
    });

    speechRecognizerRef.current = recognizer;
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 pb-4 pt-1 sm:px-6">
      {/* Recording alert */}
      {recordingError && (
        <div className="mb-2 flex items-center gap-2 p-2 rounded-lg bg-red-950/40 border border-red-800 text-xs text-red-300">
          <AlertCircle size={14} className="text-red-400 shrink-0" />
          <span>{recordingError}</span>
        </div>
      )}

      {/* Main Composer Box */}
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`relative rounded-2xl bg-slate-900/90 border transition-all duration-200 shadow-xl backdrop-blur-md ${
          isDragging
            ? 'border-cyan-400 bg-cyan-950/20'
            : 'border-slate-800/80 focus-within:border-violet-500/80 focus-within:shadow-[0_0_25px_rgba(124,58,237,0.18)]'
        }`}
      >
        {/* Attachment Chips List */}
        {attachments.length > 0 && (
          <div className="flex flex-wrap gap-2 p-3 pb-0">
            {attachments.map((att) => (
              <div
                key={att.id}
                className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700/60 text-xs text-slate-200 shadow-sm"
              >
                {att.previewUrl ? (
                  <img
                    src={att.previewUrl}
                    alt={att.name}
                    className="w-6 h-6 object-cover rounded-md"
                  />
                ) : (
                  <FileText size={14} className="text-cyan-400 shrink-0" />
                )}
                <span className="max-w-[130px] truncate font-medium">{att.name}</span>
                <button
                  type="button"
                  onClick={() => removeAttachment(att.id)}
                  className="p-0.5 rounded-full hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
                >
                  <X size={13} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Text Area */}
        <div className="p-3">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              isRecording
                ? 'Listening to your voice... Speak now.'
                : 'Message Nexora AI... (Ask a question, paste code, or drop files)'
            }
            rows={1}
            className="w-full bg-transparent text-slate-100 placeholder-slate-500 text-sm sm:text-base resize-none focus:outline-none min-h-[44px] max-h-[180px] leading-relaxed"
          />
        </div>

        {/* Bottom Action Controls */}
        <div className="flex items-center justify-between px-3 pb-2.5 pt-1 border-t border-slate-800/50 text-xs text-slate-400">
          <div className="flex items-center gap-1.5">
            {/* File Upload Trigger */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              multiple
              accept="image/*,.pdf,.txt,.md,.py,.js,.ts,.tsx,.json,.csv"
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="p-2 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition-colors"
              title="Attach documents or images"
            >
              <Paperclip size={18} />
            </button>

            {/* Web Search Grounding Toggle */}
            <button
              type="button"
              onClick={onToggleWebSearch}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border transition-all text-xs font-medium ${
                enableWebSearch
                  ? 'bg-cyan-950/70 text-cyan-300 border-cyan-500/50 shadow-[0_0_12px_rgba(6,182,212,0.3)]'
                  : 'bg-slate-800/40 text-slate-400 border-slate-700/50 hover:bg-slate-800 hover:text-slate-200'
              }`}
              title="Toggle Google Search Grounding for live web results"
            >
              <Globe size={14} className={enableWebSearch ? 'text-cyan-400' : ''} />
              <span className="hidden sm:inline">Web Search</span>
              {enableWebSearch && (
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
              )}
            </button>

            {/* Voice Input Button */}
            <button
              type="button"
              onClick={toggleRecording}
              className={`p-2 rounded-xl transition-all ${
                isRecording
                  ? 'bg-red-500/20 text-red-400 border border-red-500/50 animate-pulse'
                  : 'hover:bg-slate-800 text-slate-400 hover:text-slate-200'
              }`}
              title={isRecording ? 'Stop listening' : 'Speak message'}
            >
              {isRecording ? <MicOff size={18} /> : <Mic size={18} />}
            </button>
          </div>

          {/* Send / Stop Buttons */}
          <div className="flex items-center gap-2">
            {isGenerating ? (
              <button
                type="button"
                onClick={onStopGeneration}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-medium text-xs shadow-md transition-all active:scale-95"
                title="Stop generation"
              >
                <Square size={14} fill="currentColor" />
                <span>Stop</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSend}
                disabled={!input.trim() && attachments.length === 0}
                className={`p-2.5 rounded-xl font-medium shadow-md transition-all duration-200 ${
                  input.trim() || attachments.length > 0
                    ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white hover:opacity-95 shadow-violet-900/30 active:scale-95 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed opacity-60'
                }`}
                title="Send message (Enter)"
              >
                <Send size={16} />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Footer subtle text */}
      <div className="flex items-center justify-between mt-2 px-1 text-[11px] text-slate-500">
        <span className="flex items-center gap-1">
          <Sparkles size={11} className="text-violet-400" />
          <span>Nexora AI — Think Smarter. Create More.</span>
        </span>
        <span className="hidden sm:inline">
          Press <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">Enter</kbd> to send, <kbd className="px-1 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">Shift+Enter</kbd> for new line
        </span>
      </div>
    </div>
  );
};
