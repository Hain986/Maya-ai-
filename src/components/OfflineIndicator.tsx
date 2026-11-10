import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          className="fixed bottom-16 left-4 right-4 z-50 max-w-md mx-auto p-3 rounded-2xl bg-amber-500/95 text-slate-950 font-bold text-xs shadow-2xl border border-amber-300 backdrop-blur-md flex items-center gap-2.5"
        >
          <div className="p-1.5 rounded-full bg-amber-950/20 flex-shrink-0 text-slate-950">
            <WifiOff size={16} className="animate-pulse" />
          </div>
          <div>
            <span className="block font-extrabold uppercase tracking-wide">नेटवर्क बंद (Offline Mode Active)</span>
            <span className="font-normal text-[11px]">माया AI के cached फीचर्स और अलमारी ऑफलाइन भी काम कर रहे हैं।</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
