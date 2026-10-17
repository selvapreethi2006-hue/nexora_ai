import React, { useState } from 'react';
import { AppSettings } from '../types/chat';
import { clearAllConversations } from '../services/storage';
import {
  X,
  Moon,
  Sun,
  Laptop,
  Languages,
  Sliders,
  Volume2,
  Trash2,
  Shield,
  Keyboard,
  RotateCcw,
  Check,
  AlertTriangle,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  onClearAllChats: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onClearAllChats,
}) => {
  const [activeTab, setActiveTab] = useState<'general' | 'voice' | 'privacy' | 'shortcuts'>('general');
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [clearedSuccess, setClearedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleClearAll = () => {
    clearAllConversations();
    onClearAllChats();
    setShowClearConfirm(false);
    setClearedSuccess(true);
    setTimeout(() => setClearedSuccess(false), 3000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-2xl rounded-2xl bg-[#090E24] border border-slate-800 shadow-2xl flex flex-col max-h-[85vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Sliders size={18} className="text-violet-400" />
            <h2 className="text-base font-semibold text-white">Nexora AI Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800/80 px-6 gap-6 text-xs font-medium text-slate-400">
          <button
            onClick={() => setActiveTab('general')}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'general'
                ? 'border-violet-500 text-violet-300 font-semibold'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            <Sliders size={14} />
            <span>General</span>
          </button>
          <button
            onClick={() => setActiveTab('voice')}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'voice'
                ? 'border-violet-500 text-violet-300 font-semibold'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            <Volume2 size={14} />
            <span>Voice & Audio</span>
          </button>
          <button
            onClick={() => setActiveTab('shortcuts')}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'shortcuts'
                ? 'border-violet-500 text-violet-300 font-semibold'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            <Keyboard size={14} />
            <span>Shortcuts</span>
          </button>
          <button
            onClick={() => setActiveTab('privacy')}
            className={`py-3 border-b-2 transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'privacy'
                ? 'border-violet-500 text-violet-300 font-semibold'
                : 'border-transparent hover:text-slate-200'
            }`}
          >
            <Shield size={14} />
            <span>Data & Privacy</span>
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-xs sm:text-sm">
          {activeTab === 'general' && (
            <>
              {/* Theme Selector */}
              <div>
                <label className="block font-medium text-slate-200 mb-2">Interface Theme</label>
                <div className="grid grid-cols-3 gap-2.5">
                  {[
                    { id: 'dark', label: 'Dark (Default)', icon: <Moon size={15} /> },
                    { id: 'light', label: 'Light', icon: <Sun size={15} /> },
                    { id: 'system', label: 'System', icon: <Laptop size={15} /> },
                  ].map((t) => (
                    <button
                      key={t.id}
                      onClick={() => onUpdateSettings({ ...settings, theme: t.id as any })}
                      className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl border text-xs font-medium transition-all ${
                        settings.theme === t.id
                          ? 'bg-violet-600/20 border-violet-500 text-violet-300 shadow-sm'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {t.icon}
                      <span>{t.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Preferred Language */}
              <div>
                <label className="block font-medium text-slate-200 mb-2">Preferred Response Language</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {[
                    { id: 'auto', label: 'Auto Detect' },
                    { id: 'en', label: 'English' },
                    { id: 'ta', label: 'தமிழ் (Tamil)' },
                    { id: 'tanglish', label: 'Tanglish' },
                  ].map((l) => (
                    <button
                      key={l.id}
                      onClick={() => onUpdateSettings({ ...settings, preferredLanguage: l.id as any })}
                      className={`py-2 px-3 rounded-xl border text-xs font-medium transition-all ${
                        settings.preferredLanguage === l.id
                          ? 'bg-violet-600/20 border-violet-500 text-violet-300'
                          : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {l.label}
                    </button>
                  ))}
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  Nexora AI can naturally converse in English, formal Tamil, or Tanglish (Tamil in English alphabet).
                </p>
              </div>

              {/* Response Style */}
              <div>
                <label className="block font-medium text-slate-200 mb-2">Response Style & Tone</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    { id: 'balanced', title: 'Balanced & Helpful', desc: 'Standard conversational tone with good depth.' },
                    { id: 'technical', title: 'Precise & Technical', desc: 'Focuses strictly on code, architecture, and logic.' },
                    { id: 'creative', title: 'Creative & Elaborate', desc: 'Rich analogies, brainstorming, and storytelling.' },
                    { id: 'concise', title: 'Concise & Direct', desc: 'Minimal words, bullet points, and straight answers.' },
                  ].map((s) => (
                    <button
                      key={s.id}
                      onClick={() => onUpdateSettings({ ...settings, responseStyle: s.id as any })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        settings.responseStyle === s.id
                          ? 'bg-violet-950/40 border-violet-500 text-violet-200'
                          : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-semibold text-xs text-white mb-0.5">{s.title}</div>
                      <div className="text-[11px] text-slate-400">{s.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {activeTab === 'voice' && (
            <div className="space-y-4">
              <div>
                <label className="block font-medium text-slate-200 mb-1">Text-to-Speech Voice Persona</label>
                <p className="text-xs text-slate-400 mb-3">
                  Powered by Gemini 3.8 Flash Lite TTS with natural articulation.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {[
                    { name: 'Kore', desc: 'Clear, balanced, calm' },
                    { name: 'Zephyr', desc: 'Warm, dynamic, engaging' },
                    { name: 'Fenrir', desc: 'Deep, authoritative' },
                    { name: 'Puck', desc: 'Bright, cheerful, energetic' },
                    { name: 'Charon', desc: 'Subtle, measured, quiet' },
                  ].map((v) => (
                    <button
                      key={v.name}
                      onClick={() => onUpdateSettings({ ...settings, ttsVoice: v.name as any })}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        settings.ttsVoice === v.name
                          ? 'bg-violet-950/40 border-violet-500 text-violet-200'
                          : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      <div className="font-semibold text-xs text-white mb-0.5">{v.name}</div>
                      <div className="text-[11px] text-slate-400">{v.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'shortcuts' && (
            <div className="space-y-3">
              <h3 className="font-semibold text-white text-xs mb-3">Available Keyboard Shortcuts</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-300">Send Message</span>
                  <kbd className="px-2 py-1 rounded bg-slate-800 text-slate-200 font-mono text-[11px] border border-slate-700">Enter</kbd>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-300">New Line</span>
                  <kbd className="px-2 py-1 rounded bg-slate-800 text-slate-200 font-mono text-[11px] border border-slate-700">Shift + Enter</kbd>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-300">New Chat</span>
                  <kbd className="px-2 py-1 rounded bg-slate-800 text-slate-200 font-mono text-[11px] border border-slate-700">Ctrl / Cmd + K</kbd>
                </div>
                <div className="flex items-center justify-between p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <span className="text-slate-300">Close Modal</span>
                  <kbd className="px-2 py-1 rounded bg-slate-800 text-slate-200 font-mono text-[11px] border border-slate-700">Esc</kbd>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'privacy' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2 text-cyan-400 font-medium text-xs">
                  <Shield size={16} />
                  <span>Local-First Conversation Privacy</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Your conversations and attachments are kept securely in your local browser session storage. No conversations are permanently stored on remote databases or shared with unauthorized third parties.
                </p>
                <p className="text-xs text-slate-400 leading-relaxed">
                  API requests are transmitted directly to Google's Gemini API via our secure server proxy. The server API key is strictly maintained server-side and never exposed to the client.
                </p>
              </div>

              {/* Clear History */}
              <div className="pt-2">
                <label className="block font-medium text-slate-200 mb-2">Storage Management</label>
                {showClearConfirm ? (
                  <div className="p-4 rounded-xl bg-red-950/30 border border-red-800/60 space-y-3">
                    <div className="flex items-center gap-2 text-red-300 font-semibold text-xs">
                      <AlertTriangle size={16} />
                      <span>Permanently delete all conversations?</span>
                    </div>
                    <p className="text-[11px] text-red-300/80">
                      This will delete all saved conversation history from this browser. This action cannot be reversed.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={handleClearAll}
                        className="px-3 py-1.5 rounded-lg bg-red-600 hover:bg-red-500 text-white font-medium text-xs transition-colors"
                      >
                        Yes, Clear Everything
                      </button>
                      <button
                        onClick={() => setShowClearConfirm(false)}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-medium text-xs transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setShowClearConfirm(true)}
                    className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-950/40 hover:bg-red-900/40 border border-red-800/40 text-red-300 hover:text-red-200 text-xs font-medium transition-colors"
                  >
                    <Trash2 size={14} />
                    <span>Clear All Conversations</span>
                  </button>
                )}

                {clearedSuccess && (
                  <p className="text-xs text-emerald-400 mt-2 flex items-center gap-1">
                    <Check size={14} /> All conversations have been cleared.
                  </p>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-violet-600 hover:bg-violet-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
