import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, X, Sparkles, Check, Monitor } from 'lucide-react';

export const PWAInstallButton: React.FC<{ className?: string; variant?: 'button' | 'card' }> = ({ className = '', variant = 'button' }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuide, setShowGuide] = useState(false);

  // If already running as an installed standalone PWA, render installed badge or hide
  if (isInstalled) {
    if (variant === 'card') {
      return (
        <div className="p-3 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between font-semibold">
          <span className="flex items-center gap-2">
            <Check size={16} /> Maya AI App Installed on Device!
          </span>
          <span className="text-[10px] bg-emerald-400 text-slate-950 font-bold px-2 py-0.5 rounded-full">Active PWA</span>
        </div>
      );
    }
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      const installed = await install();
      if (!installed) {
        setShowGuide(true);
      }
    } else {
      setShowGuide(true);
    }
  };

  if (variant === 'card') {
    return (
      <div 
        className={`p-4 rounded-3xl border shadow-xl backdrop-blur-md transition-all ${className}`}
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--accent-primary)',
          boxShadow: '0 0 25px var(--glow-color)',
        }}
      >
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-2xl bg-cyan-500/20 border border-cyan-400/40 text-cyan-300">
              <Download size={20} className="animate-bounce" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-white">MAYA AI Mobile & PC App</h3>
              <p className="text-[10px] text-gray-300">Fast 1-click Download & Offline Support</p>
            </div>
          </div>
          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-pink-500/20 text-pink-300 border border-pink-500/30">
            Free App
          </span>
        </div>

        <p className="text-xs text-gray-300 mb-3 leading-relaxed">
          Install Maya AI as a native home-screen app on Android, iPhone, Windows, or Mac with offline responses & smooth performance.
        </p>

        <button
          onClick={handleInstallClick}
          className="w-full py-2.5 px-4 rounded-2xl font-extrabold text-xs text-slate-950 flex items-center justify-center gap-2 transition hover:opacity-95 transform active:scale-95 shadow-lg"
          style={{
            backgroundImage: 'var(--accent-gradient)',
            boxShadow: '0 0 20px var(--glow-color)',
          }}
        >
          <Download size={16} />
          <span>{isInstallable ? 'Instantly Download & Install App' : 'How to Download & Install App'}</span>
        </button>

        {showGuide && <InstallGuideModal onClose={() => setShowGuide(false)} isIOS={isIOS} />}
      </div>
    );
  }

  // Header / Inline button variant
  return (
    <>
      <button
        onClick={handleInstallClick}
        className={`flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border shadow-md transition hover:scale-105 active:scale-95 ${className}`}
        style={{
          backgroundColor: 'var(--accent-primary)',
          borderColor: 'var(--accent-primary)',
          color: '#0a0f1e',
        }}
        title="MAYA AI App को फोन / PC में इंस्टाल करें"
      >
        <Download size={14} className="animate-bounce" />
        <span>{isInstallable ? 'App इंस्टाल करें' : 'App Download'}</span>
      </button>

      {showGuide && <InstallGuideModal onClose={() => setShowGuide(false)} isIOS={isIOS} />}
    </>
  );
};

const InstallGuideModal: React.FC<{ onClose: () => void; isIOS: boolean }> = ({ onClose, isIOS }) => {
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
          className="absolute top-4 right-4 text-gray-400 hover:text-white p-1 rounded-full bg-white/10"
        >
          <X size={16} />
        </button>

        <div className="flex items-center gap-2 mb-3">
          <Sparkles className="text-pink-400" size={20} />
          <h3 className="text-base font-extrabold text-cyan-300">
            MAYA AI App Install Guide
          </h3>
        </div>

        <p className="text-xs text-gray-300 mb-4 leading-relaxed">
          Maya AI को आप अपने मोबाइल और कंप्यूटर पर डायरेक्ट एप्लीकेशन की तरह इंस्टॉल कर सकते हैं:
        </p>

        {isIOS ? (
          <div className="space-y-3 bg-white/5 p-3.5 rounded-2xl border border-white/10 text-xs">
            <h4 className="font-bold text-pink-300 flex items-center gap-1.5">
              <Smartphone size={15} /> iPhone / iPad (Safari)
            </h4>
            <p className="text-gray-300 leading-relaxed">
              1. Safari ब्राउज़र में नीचे दिए गए <strong>Share (शेयर)</strong> आइकन पर टैप करें।<br />
              2. लिस्ट में नीचे जाएँ और <strong>"Add to Home Screen" (होम स्क्रीन पर जोड़ें)</strong> पर क्लिक करें।<br />
              3. ऊपर दाएँ कोने में <strong>Add</strong> पर टैप करें।
            </p>
          </div>
        ) : (
          <div className="space-y-3 text-xs">
            <div className="bg-white/5 p-3.5 rounded-2xl border border-cyan-500/30">
              <h4 className="font-bold text-cyan-300 flex items-center gap-1.5 mb-1">
                <Smartphone size={15} /> Android Phone (Chrome / Edge)
              </h4>
              <p className="text-gray-300 leading-relaxed">
                1. ब्राउज़र के ऊपर दाएँ 3-डॉट मेनू (⋮) पर क्लिक करें।<br />
                2. <strong>"Install app" (ऐप इंस्टॉल करें)</strong> या <strong>"Add to Home screen"</strong> चुनें।<br />
                3. confirm करके Install बटन दबाएँ।
              </p>
            </div>

            <div className="bg-white/5 p-3.5 rounded-2xl border border-purple-500/30">
              <h4 className="font-bold text-purple-300 flex items-center gap-1.5 mb-1">
                <Monitor size={15} /> Computer / PC (Chrome / Edge / Mac)
              </h4>
              <p className="text-gray-300 leading-relaxed">
                1. ब्राउज़र एड्रेस बार के दाईं तरफ छोटा Download/Install आइकन दबाएँ।<br />
                2. या मेनू → Save and Share → Install Maya AI चुनें।
              </p>
            </div>
          </div>
        )}

        <button
          onClick={onClose}
          className="mt-5 w-full rounded-2xl py-2.5 text-xs font-extrabold text-slate-950 shadow-lg transition hover:opacity-90"
          style={{
            backgroundColor: 'var(--accent-primary)',
          }}
        >
          समझ गया (Got it!)
        </button>
      </div>
    </div>
  );
};
