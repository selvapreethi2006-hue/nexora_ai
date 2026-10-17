import React, { useState } from 'react';
import { ChatMessage } from '../types/chat';
import { MarkdownRenderer } from './MarkdownRenderer';
import { NexoraLogo } from './NexoraLogo';
import { audioPlayer } from '../services/speech';
import {
  Copy,
  Check,
  RotateCcw,
  Volume2,
  VolumeX,
  Globe,
  ExternalLink,
  FileText,
  AlertCircle,
  Sparkles,
  User,
  Loader2,
} from 'lucide-react';

interface ChatMessageItemProps {
  message: ChatMessage;
  isLatest: boolean;
  onRegenerate?: () => void;
  onRetry?: () => void;
  ttsVoice?: string;
}

export const ChatMessageItem: React.FC<ChatMessageItemProps> = ({
  message,
  isLatest,
  onRegenerate,
  onRetry,
  ttsVoice = 'Kore',
}) => {
  const [copied, setCopied] = useState(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [isLoadingAudio, setIsLoadingAudio] = useState(false);
  const [showSources, setShowSources] = useState(true);
  const [expandedImage, setExpandedImage] = useState<string | null>(null);

  const isUser = message.role === 'user';

  const handleCopy = () => {
    navigator.clipboard.writeText(message.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleToggleAudio = async () => {
    if (isPlayingAudio) {
      audioPlayer.stopAudio();
      setIsPlayingAudio(false);
      return;
    }

    setIsLoadingAudio(true);
    try {
      const res = await fetch('/api/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: message.content,
          voice: ttsVoice,
        }),
      });

      if (!res.ok) {
        throw new Error('TTS service failed');
      }

      const data = await res.json();
      if (data.audio) {
        setIsPlayingAudio(true);
        audioPlayer.playAudio(data.audio, () => {
          setIsPlayingAudio(false);
        });
      }
    } catch (err) {
      console.error('Audio playback error:', err);
    } finally {
      setIsLoadingAudio(false);
    }
  };

  return (
    <div
      className={`group w-full py-5 px-4 sm:px-6 transition-colors ${
        isUser ? 'bg-transparent' : 'bg-slate-900/35 border-y border-slate-800/40'
      }`}
    >
      <div className="max-w-4xl mx-auto flex gap-3 sm:gap-4">
        {/* Avatar */}
        <div className="shrink-0 mt-0.5">
          {isUser ? (
            <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-cyan-600 to-blue-500 flex items-center justify-center text-white shadow-md shadow-cyan-900/20">
              <User size={16} />
            </div>
          ) : (
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-violet-600 via-indigo-600 to-cyan-500 p-[1px] shadow-lg shadow-violet-900/30">
              <div className="w-full h-full bg-[#080D20] rounded-[11px] flex items-center justify-center">
                <NexoraLogo size={20} withSparkAnimation={message.isStreaming} />
              </div>
            </div>
          )}
        </div>

        {/* Content Body */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1.5">
            <span className="text-xs font-semibold tracking-wide text-slate-300">
              {isUser ? 'You' : 'Nexora AI'}
            </span>
            <span className="text-[11px] text-slate-500">
              {new Date(message.timestamp).toLocaleTimeString([], {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </span>
            {!isUser && (
              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] font-medium bg-violet-950/60 text-violet-300 border border-violet-800/40">
                <Sparkles size={10} /> Gemini 3.8
              </span>
            )}
          </div>

          {/* User Attachments */}
          {message.attachments && message.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2.5 mb-3">
              {message.attachments.map((att) => {
                const isImage = att.type.startsWith('image/');
                return (
                  <div key={att.id} className="relative group/att">
                    {isImage && att.previewUrl ? (
                      <div
                        onClick={() => setExpandedImage(att.previewUrl!)}
                        className="cursor-pointer overflow-hidden rounded-xl border border-slate-700/60 hover:border-violet-500/80 transition-all max-w-[200px] max-h-[140px] shadow-md bg-black/40"
                      >
                        <img
                          src={att.previewUrl}
                          alt={att.name}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-800/80 border border-slate-700 text-xs text-slate-200 shadow-sm">
                        <FileText size={16} className="text-cyan-400" />
                        <span className="font-medium max-w-[160px] truncate">{att.name}</span>
                        <span className="text-[10px] text-slate-400">
                          ({Math.round(att.size / 1024)} KB)
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {/* Message Text / Markdown */}
          {message.error ? (
            <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/50 text-red-200 text-sm flex flex-col gap-2.5">
              <div className="flex items-start gap-2.5">
                <AlertCircle size={18} className="text-red-400 shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Generation Error</p>
                  <p className="text-xs text-red-300/90 mt-0.5">
                    {message.errorMessage || 'Nexora AI was unable to generate a response. Please check your API key or network connection.'}
                  </p>
                </div>
              </div>
              {onRetry && (
                <div className="flex justify-end">
                  <button
                    onClick={onRetry}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-900/50 hover:bg-red-800/60 border border-red-700/60 text-xs font-medium text-red-100 transition-colors"
                  >
                    <RotateCcw size={13} />
                    <span>Retry Request</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="text-slate-100 leading-relaxed">
              <MarkdownRenderer content={message.content} />

              {/* Streaming Cursor */}
              {message.isStreaming && (
                <span className="inline-block w-2 h-4 ml-1 -mb-0.5 bg-cyan-400 animate-pulse rounded-sm" />
              )}
            </div>
          )}

          {/* Grounding Sources (Google Search Grounding) */}
          {message.sources && message.sources.length > 0 && (
            <div className="mt-4 pt-3 border-t border-slate-800/70">
              <button
                onClick={() => setShowSources(!showSources)}
                className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-300 transition-colors mb-2"
              >
                <Globe size={13} className="text-cyan-400" />
                <span>Web Sources ({message.sources.length})</span>
                <span className="text-[10px] text-slate-500">
                  {showSources ? '▲ hide' : '▼ show'}
                </span>
              </button>

              {showSources && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-2">
                  {message.sources.map((src, i) => (
                    <a
                      key={i}
                      href={src.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between gap-2 px-3 py-2 rounded-lg bg-slate-800/40 hover:bg-slate-800 border border-slate-700/50 hover:border-cyan-500/50 text-xs text-slate-300 hover:text-cyan-200 transition-all group/link"
                    >
                      <span className="truncate font-medium">{src.title}</span>
                      <ExternalLink
                        size={12}
                        className="text-slate-500 group-hover/link:text-cyan-400 shrink-0"
                      />
                    </a>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Action Toolbar for Model Messages */}
          {!isUser && !message.isStreaming && !message.error && (
            <div className="flex items-center gap-1.5 mt-3 pt-2 text-slate-400 opacity-80 group-hover:opacity-100 transition-opacity">
              <button
                onClick={handleCopy}
                className="flex items-center gap-1 px-2 py-1 rounded-md text-xs hover:bg-slate-800 hover:text-slate-200 transition-colors"
                title="Copy entire response"
              >
                {copied ? (
                  <>
                    <Check size={13} className="text-emerald-400" />
                    <span className="text-emerald-400">Copied</span>
                  </>
                ) : (
                  <>
                    <Copy size={13} />
                    <span>Copy</span>
                  </>
                )}
              </button>

              <button
                onClick={handleToggleAudio}
                disabled={isLoadingAudio}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs hover:bg-slate-800 hover:text-cyan-300 transition-colors"
                title="Listen with text-to-speech"
              >
                {isLoadingAudio ? (
                  <>
                    <Loader2 size={13} className="animate-spin text-cyan-400" />
                    <span className="text-cyan-300">Generating audio...</span>
                  </>
                ) : isPlayingAudio ? (
                  <>
                    <VolumeX size={13} className="text-red-400" />
                    <span className="text-red-300">Stop Voice</span>
                    <div className="flex items-center gap-0.5 ml-1 h-3">
                      <span className="w-0.5 bg-cyan-400 animate-audio-1 rounded-full" />
                      <span className="w-0.5 bg-cyan-400 animate-audio-2 rounded-full" />
                      <span className="w-0.5 bg-cyan-400 animate-audio-3 rounded-full" />
                    </div>
                  </>
                ) : (
                  <>
                    <Volume2 size={13} />
                    <span>Listen</span>
                  </>
                )}
              </button>

              {isLatest && onRegenerate && (
                <button
                  onClick={onRegenerate}
                  className="flex items-center gap-1 px-2 py-1 rounded-md text-xs hover:bg-slate-800 hover:text-slate-200 transition-colors"
                  title="Regenerate this response"
                >
                  <RotateCcw size={13} />
                  <span>Regenerate</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Lightbox Modal for Image Expansion */}
      {expandedImage && (
        <div
          onClick={() => setExpandedImage(null)}
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
        >
          <img
            src={expandedImage}
            alt="Expanded attachment"
            className="max-w-[90vw] max-h-[90vh] rounded-2xl object-contain shadow-2xl border border-slate-700"
          />
        </div>
      )}
    </div>
  );
};
