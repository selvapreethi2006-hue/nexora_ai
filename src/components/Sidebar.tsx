import React, { useState } from 'react';
import { Conversation } from '../types/chat';
import { NexoraLogo } from './NexoraLogo';
import { exportChatAsMarkdown, exportChatAsJSON } from '../services/storage';
import {
  Plus,
  Search,
  MessageSquare,
  Settings,
  HelpCircle,
  Trash2,
  Edit2,
  Check,
  X,
  Download,
  ChevronLeft,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface SidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelectConversation: (id: string) => void;
  onNewChat: () => void;
  onDeleteConversation: (id: string) => void;
  onRenameConversation: (id: string, newTitle: string) => void;
  onOpenSettings: () => void;
  onOpenAbout: () => void;
  isOpen: boolean;
  onToggleOpen: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  conversations,
  activeId,
  onSelectConversation,
  onNewChat,
  onDeleteConversation,
  onRenameConversation,
  onOpenSettings,
  onOpenAbout,
  isOpen,
  onToggleOpen,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  // Filter conversations by title or message contents
  const filteredConversations = conversations.filter((c) => {
    if (!searchQuery.trim()) return true;
    const query = searchQuery.toLowerCase();
    if (c.title.toLowerCase().includes(query)) return true;
    return c.messages.some((m) => m.content.toLowerCase().includes(query));
  });

  // Group conversations by relative time
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;

  const groups: { label: string; items: Conversation[] }[] = [
    {
      label: 'Today',
      items: filteredConversations.filter((c) => now - c.updatedAt < ONE_DAY),
    },
    {
      label: 'Yesterday',
      items: filteredConversations.filter(
        (c) => now - c.updatedAt >= ONE_DAY && now - c.updatedAt < 2 * ONE_DAY
      ),
    },
    {
      label: 'Previous 7 Days',
      items: filteredConversations.filter(
        (c) => now - c.updatedAt >= 2 * ONE_DAY && now - c.updatedAt < 7 * ONE_DAY
      ),
    },
    {
      label: 'Older',
      items: filteredConversations.filter((c) => now - c.updatedAt >= 7 * ONE_DAY),
    },
  ].filter((g) => g.items.length > 0);

  const startEditing = (c: Conversation) => {
    setEditingId(c.id);
    setEditTitle(c.title);
  };

  const handleSaveRename = (id: string) => {
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim());
    }
    setEditingId(null);
  };

  const handleExport = (c: Conversation, format: 'md' | 'json') => {
    const content = format === 'md' ? exportChatAsMarkdown(c) : exportChatAsJSON(c);
    const mime = format === 'md' ? 'text/markdown' : 'application/json';
    const blob = new Blob([content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${c.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.${format}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div
          onClick={onToggleOpen}
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-30 lg:hidden"
        />
      )}

      {/* Main Sidebar Container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 flex flex-col bg-[#070b18] border-r border-slate-800/80 transition-all duration-300 ease-in-out ${
          isOpen ? 'w-72 translate-x-0' : '-translate-x-full lg:translate-x-0 lg:w-0 lg:border-r-0 lg:overflow-hidden'
        }`}
      >
        {/* Header & Logo */}
        <div className="flex items-center justify-between p-4 border-b border-slate-800/80">
          <div className="flex items-center gap-2.5">
            <NexoraLogo size={32} />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-base tracking-tight text-white">Nexora AI</span>
                <span className="px-1.5 py-0.2 rounded text-[10px] font-semibold bg-violet-600/30 text-violet-300 border border-violet-500/30">
                  PRO
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium">Think Smarter. Create More.</p>
            </div>
          </div>
          <button
            onClick={onToggleOpen}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white lg:hidden"
          >
            <ChevronLeft size={20} />
          </button>
        </div>

        {/* Action Controls: New Chat Button */}
        <div className="p-3">
          <button
            onClick={() => {
              onNewChat();
              if (window.innerWidth < 1024) onToggleOpen();
            }}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium text-sm shadow-md shadow-violet-900/20 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Plus size={18} />
            <span>New Chat</span>
          </button>
        </div>

        {/* Search Conversations Input */}
        <div className="px-3 pb-2">
          <div className="relative">
            <Search
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search conversations..."
              className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-violet-500/80"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                <X size={12} />
              </button>
            )}
          </div>
        </div>

        {/* Conversation List */}
        <div className="flex-1 overflow-y-auto px-2 py-2 space-y-4">
          {conversations.length === 0 ? (
            <div className="text-center py-8 px-4 text-xs text-slate-500">
              <MessageSquare size={24} className="mx-auto mb-2 text-slate-600" />
              <p>No conversations yet.</p>
              <p className="mt-1 text-[11px]">Start a new chat to begin!</p>
            </div>
          ) : groups.length === 0 ? (
            <div className="text-center py-6 px-4 text-xs text-slate-500">
              No matching chats found.
            </div>
          ) : (
            groups.map((group) => (
              <div key={group.label} className="space-y-1">
                <div className="px-2 text-[11px] font-semibold tracking-wider text-slate-500 uppercase">
                  {group.label}
                </div>
                {group.items.map((c) => {
                  const isActive = c.id === activeId;
                  const isEditing = editingId === c.id;

                  return (
                    <div
                      key={c.id}
                      className={`group relative flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all ${
                        isActive
                          ? 'bg-violet-950/50 text-white font-medium border border-violet-800/60 shadow-sm'
                          : 'text-slate-300 hover:bg-slate-900/70 hover:text-white'
                      }`}
                    >
                      {isEditing ? (
                        <div className="flex items-center gap-1.5 w-full">
                          <input
                            type="text"
                            value={editTitle}
                            onChange={(e) => setEditTitle(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter') handleSaveRename(c.id);
                              if (e.key === 'Escape') setEditingId(null);
                            }}
                            autoFocus
                            className="flex-1 bg-slate-950 text-xs px-2 py-1 rounded border border-violet-500 text-white focus:outline-none"
                          />
                          <button
                            onClick={() => handleSaveRename(c.id)}
                            className="p-1 hover:text-emerald-400 text-slate-400"
                          >
                            <Check size={14} />
                          </button>
                          <button
                            onClick={() => setEditingId(null)}
                            className="p-1 hover:text-red-400 text-slate-400"
                          >
                            <X size={14} />
                          </button>
                        </div>
                      ) : (
                        <>
                          <button
                            onClick={() => {
                              onSelectConversation(c.id);
                              if (window.innerWidth < 1024) onToggleOpen();
                            }}
                            className="flex items-center gap-2 flex-1 text-left truncate pr-2 py-0.5 cursor-pointer"
                          >
                            <MessageSquare
                              size={14}
                              className={`shrink-0 ${
                                isActive ? 'text-violet-400' : 'text-slate-500 group-hover:text-slate-400'
                              }`}
                            />
                            <span className="truncate">{c.title}</span>
                          </button>

                          {/* Action Buttons on Hover */}
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                startEditing(c);
                              }}
                              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                              title="Rename chat"
                            >
                              <Edit2 size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExport(c, 'md');
                              }}
                              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-slate-200"
                              title="Export chat as Markdown"
                            >
                              <Download size={12} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDeleteId(c.id);
                              }}
                              className="p-1 rounded hover:bg-slate-800 text-slate-400 hover:text-red-400"
                              title="Delete chat"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  );
                })}
              </div>
            ))
          )}
        </div>

        {/* Footer controls: Settings & About */}
        <div className="p-3 border-t border-slate-800/80 space-y-1">
          <button
            onClick={onOpenSettings}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <Settings size={16} className="text-slate-400" />
            <span>Settings & Preferences</span>
          </button>
          <button
            onClick={onOpenAbout}
            className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs font-medium text-slate-300 hover:bg-slate-800 hover:text-white transition-colors"
          >
            <HelpCircle size={16} className="text-slate-400" />
            <span>Help & About Nexora</span>
          </button>
        </div>
      </aside>

      {/* Delete Confirmation Modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="w-full max-w-sm rounded-2xl bg-slate-900 border border-slate-800 p-5 shadow-2xl">
            <h3 className="font-semibold text-base text-white mb-2">Delete Conversation?</h3>
            <p className="text-xs text-slate-400 mb-5 leading-relaxed">
              Are you sure you want to delete this conversation? This action cannot be undone.
            </p>
            <div className="flex items-center justify-end gap-2">
              <button
                onClick={() => setConfirmDeleteId(null)}
                className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteConversation(confirmDeleteId);
                  setConfirmDeleteId(null);
                }}
                className="px-3.5 py-1.5 rounded-xl bg-red-600 hover:bg-red-500 text-xs font-medium text-white transition-colors shadow-md shadow-red-900/30"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
