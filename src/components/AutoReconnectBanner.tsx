import React, { useState } from 'react';
import { useAutoReconnect } from '../hooks/useAutoReconnect';
import { Wifi, WifiOff, RefreshCw, Zap, CheckCircle2 } from 'lucide-react';

export const AutoReconnectBanner: React.FC = () => {
  const { status, latencyMs, reconnectAttempts, isOnline, isReconnecting, isOfflineNeural, triggerReconnect } = useAutoReconnect();
  const [retrying, setRetrying] = useState(false);
  const [minimized, setMinimized] = useState(false);

  const handleManualRetry = async () => {
    setRetrying(true);
    await triggerReconnect();
    setTimeout(() => setRetrying(false), 800);
  };

  // If online and minimized, show minimal top badge
  if (isOnline && minimized) {
    return (
      <button
        onClick={() => setMinimized(false)}
        className="fixed top-2 right-2 z-50 flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md shadow-lg"
        title="Server Connected - Click to view status"
      >
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
        <span>Port 3000 • {latencyMs}ms</span>
      </button>
    );
  }

  if (isOnline) {
    return (
      <div className="bg-emerald-950/80 border-b border-emerald-500/30 px-3 py-1.5 backdrop-blur-md text-emerald-200 text-xs flex justify-between items-center transition-all">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400"></span>
          </span>
          <span className="font-semibold text-emerald-300">Server Connected</span>
          <span className="text-[10px] text-emerald-400/80 font-mono">Port 3000 • {latencyMs}ms latency</span>
          <span className="hidden sm:inline text-[10px] text-emerald-400/60">• Auto Reconnect Active</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-emerald-500/20 px-2 py-0.5 rounded-full text-emerald-300 font-mono">Owner: Rk Hacker</span>
          <button 
            onClick={() => setMinimized(true)}
            className="text-[10px] text-emerald-400/80 hover:text-white px-1.5 py-0.5 rounded hover:bg-white/10"
          >
            Hide
          </button>
        </div>
      </div>
    );
  }

  if (isReconnecting) {
    return (
      <div className="bg-amber-950/90 border-b border-amber-500/40 px-3 py-2 backdrop-blur-md text-amber-200 text-xs flex justify-between items-center animate-pulse">
        <div className="flex items-center gap-2">
          <RefreshCw size={14} className="animate-spin text-amber-400" />
          <div>
            <p className="font-bold text-amber-300">Reconnecting to Server...</p>
            <p className="text-[10px] text-amber-200/80">
              Attempt #{reconnectAttempts} — Retrying server on Port 3000
            </p>
          </div>
        </div>
        <button
          onClick={handleManualRetry}
          disabled={retrying}
          className="flex items-center gap-1 bg-amber-500 text-slate-950 px-2.5 py-1 rounded-lg text-xs font-bold hover:bg-amber-400 transition"
        >
          <RefreshCw size={12} className={retrying ? 'animate-spin' : ''} /> Retry Now
        </button>
      </div>
    );
  }

  // Offline Neural Mode
  return (
    <div className="bg-gradient-to-r from-purple-950/90 via-indigo-950/90 to-slate-950/90 border-b border-cyan-500/30 px-3 py-2 backdrop-blur-md text-white text-xs flex justify-between items-center shadow-lg">
      <div className="flex items-center gap-2.5">
        <div className="p-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 text-cyan-300">
          <Zap size={15} className="animate-pulse" />
        </div>
        <div>
          <p className="font-bold text-cyan-300 flex items-center gap-1.5">
            ⚡ Offline Neural Mode Active
          </p>
          <p className="text-[10px] text-gray-300">
            Maya is working 100% offline with Rk Hacker Local Engine & Voice TTS!
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={handleManualRetry}
          disabled={retrying}
          className="flex items-center gap-1 border border-cyan-400/50 bg-cyan-500/20 text-cyan-300 hover:bg-cyan-500/30 px-2.5 py-1 rounded-lg text-xs font-semibold transition"
          title="Try reconnecting to dev server"
        >
          <RefreshCw size={12} className={retrying ? 'animate-spin' : ''} />
          <span>Auto Reconnect</span>
        </button>
      </div>
    </div>
  );
};
