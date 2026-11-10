import React, { useState } from 'react';
import { Message } from '../services/chatService';
import { exportConversationToStorage, shareConversationSnippet } from '../services/exportService';
import { Download, Share2, Copy, Check, FileText, FileCode, X, Sparkles } from 'lucide-react';

interface ExportModalProps {
  messages: Message[];
  conversationTitle?: string;
  languageName?: string;
  outfitName?: string;
  hairstyleName?: string;
  onClose: () => void;
}

export const ExportConversationModal: React.FC<ExportModalProps> = ({
  messages,
  conversationTitle = 'Maya Chat',
  languageName,
  outfitName,
  hairstyleName,
  onClose,
}) => {
  const [scope, setScope] = useState<'all' | 'recent'>('recent');
  const [format, setFormat] = useState<'txt' | 'md' | 'json'>('txt');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const targetMessages = scope === 'recent' ? messages.slice(-8) : messages;

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleDownload = () => {
    const success = exportConversationToStorage(targetMessages, {
      title: conversationTitle,
      languageName,
      outfitName,
      hairstyleName,
      format,
    });
    if (success) {
      showToast(`Saved ${format.toUpperCase()} to device storage! ✨`);
    } else {
      showToast('Could not save file. Try sharing instead.');
    }
  };

  const handleShare = async () => {
    const result = await shareConversationSnippet(targetMessages, {
      title: conversationTitle,
      languageName,
      outfitName,
      hairstyleName,
    });
    if (result.shared) {
      if (result.method === 'web-share') {
        showToast('Shared successfully!');
      } else {
        showToast('Conversation snippet copied to clipboard! 📋');
      }
    } else {
      showToast('Share failed. Try downloading file.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-md p-4">
      <div 
        className="w-full max-w-sm rounded-3xl border p-5 shadow-2xl text-white relative max-h-[90vh] overflow-y-auto"
        style={{
          backgroundColor: '#0a0f1e',
          borderColor: 'var(--accent-primary)',
          boxShadow: '0 0 30px var(--glow-color)',
        }}
      >
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1.5 rounded-full bg-white/10"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <Download className="text-cyan-400" size={20} />
          <h3 className="text-base font-extrabold text-cyan-300">
            Export & Save Chat Snippet
          </h3>
        </div>

        <p className="text-xs text-gray-300 mb-4 leading-relaxed">
          Export your conversation history with Maya to local storage or share formatted snippets with friends.
        </p>

        {/* Scope Selection */}
        <div className="mb-4">
          <label className="text-xs text-gray-400 block mb-1.5 font-semibold">Messages to Export</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => setScope('recent')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                scope === 'recent' 
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow' 
                  : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
              }`}
            >
              Recent Snippet ({Math.min(messages.length, 8)} msgs)
            </button>
            <button
              onClick={() => setScope('all')}
              className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                scope === 'all' 
                  ? 'bg-cyan-500/20 border-cyan-400 text-cyan-300 shadow' 
                  : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
              }`}
            >
              Full History ({messages.length} msgs)
            </button>
          </div>
        </div>

        {/* File Format Selection */}
        <div className="mb-5">
          <label className="text-xs text-gray-400 block mb-1.5 font-semibold">Export Format</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { id: 'txt', label: '.TXT File', icon: FileText },
              { id: 'md', label: '.MD File', icon: Sparkles },
              { id: 'json', label: '.JSON Data', icon: FileCode },
            ].map((item) => {
              const Icon = item.icon;
              const isSelected = format === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setFormat(item.id as any)}
                  className={`py-2 px-2 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 transition ${
                    isSelected 
                      ? 'bg-pink-500/20 border-pink-400 text-pink-300 shadow' 
                      : 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <Icon size={14} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Preview Summary */}
        <div className="p-3 rounded-2xl bg-white/5 border border-white/10 text-[11px] text-gray-300 mb-5 font-mono">
          <div className="flex justify-between text-gray-400 mb-1">
            <span>Watermark:</span>
            <span className="text-cyan-300 font-bold">Rk Hacker AI</span>
          </div>
          <div className="flex justify-between text-gray-400">
            <span>Exporting:</span>
            <span className="text-white font-bold">{targetMessages.length} Messages ({format.toUpperCase()})</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="space-y-2">
          <button
            onClick={handleDownload}
            className="w-full py-2.5 px-4 rounded-2xl font-extrabold text-xs text-slate-950 flex items-center justify-center gap-2 transition hover:opacity-95 shadow-lg"
            style={{
              backgroundImage: 'var(--accent-gradient)',
              boxShadow: '0 0 20px var(--glow-color)',
            }}
          >
            <Download size={16} /> Save to Local Storage (.${format})
          </button>
          
          <button
            onClick={handleShare}
            className="w-full py-2.5 px-4 rounded-2xl font-bold text-xs bg-white/10 border border-white/20 text-white hover:bg-white/20 flex items-center justify-center gap-2 transition"
          >
            <Share2 size={15} /> Share / Copy Snippet
          </button>
        </div>

        {/* Toast Notification */}
        {toastMessage && (
          <div className="mt-3 p-2 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold text-center flex items-center justify-center gap-1.5 animate-pulse">
            <Check size={14} /> {toastMessage}
          </div>
        )}
      </div>
    </div>
  );
};
