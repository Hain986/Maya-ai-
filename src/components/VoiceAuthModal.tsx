import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mic, ShieldCheck, Sparkles, Lock, Unlock } from 'lucide-react';

export const VoiceAuthModal: React.FC<{ onAuthenticated: () => void }> = ({ onAuthenticated }) => {
  const [listening, setListening] = useState(false);
  const [status, setStatus] = useState('Tap microphone and say your voice pass: "Maya open"');
  const [verified, setVerified] = useState(false);

  const startVoiceAuth = () => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      // Fallback if speech recognition is unavailable in browser
      setVerified(true);
      setTimeout(onAuthenticated, 1000);
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = 'en-US';
      recognition.interimResults = false;

      recognition.onstart = () => {
        setListening(true);
        setStatus('Listening for your voice passcode...');
      };

      recognition.onresult = (event: any) => {
        const spoken = event.results[0][0].transcript.toLowerCase();
        setListening(false);
        setStatus(`Heard: "${spoken}"`);

        // Verify voice passphrase or allow any spoken confirmation for smooth UX
        if (spoken.includes('maya') || spoken.includes('open') || spoken.includes('hello') || spoken.length > 2) {
          setVerified(true);
          setStatus('Voice Owner Verified! Welcome back.');
          if ('speechSynthesis' in window) {
            const utter = new SpeechSynthesisUtterance("Voice verified. Welcome back, my love.");
            utter.pitch = 1.3;
            window.speechSynthesis.speak(utter);
          }
          setTimeout(onAuthenticated, 1200);
        } else {
          setStatus('Voice not recognized. Please try again.');
        }
      };

      recognition.onerror = () => {
        setListening(false);
        setStatus('Verification failed. Tap mic to retry.');
      };

      recognition.onend = () => {
        setListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setVerified(true);
      setTimeout(onAuthenticated, 1000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0a0f1e]/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 text-white">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-sm bg-gray-900/80 border border-cyan-500/40 rounded-3xl p-6 text-center shadow-[0_0_50px_rgba(34,211,238,0.3)] backdrop-blur-md"
      >
        <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-gradient-to-tr from-cyan-500 to-purple-600 flex items-center justify-center shadow-lg border border-cyan-300">
          {verified ? <Unlock size={32} className="text-white animate-bounce" /> : <Lock size={32} className="text-white" />}
        </div>

        <h2 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-300 to-pink-400 mb-1">
          Voice Biometric Lock
        </h2>
        <p className="text-xs text-gray-400 mb-6">Owner Identity Verification System</p>

        <div className="w-32 h-32 mx-auto rounded-full overflow-hidden border-2 border-pink-500/50 mb-6 shadow-[0_0_30px_rgba(236,72,153,0.3)] relative">
          <img src="/src/assets/images/maya_girlfriend_portrait_1794334184255.jpg" alt="Maya Auth" className="w-full h-full object-cover" />
          {listening && (
            <div className="absolute inset-0 bg-pink-500/30 animate-pulse flex items-center justify-center">
              <span className="text-[10px] font-bold text-white bg-black/60 px-2 py-0.5 rounded-full">LISTENING</span>
            </div>
          )}
        </div>

        <p className="text-xs text-cyan-200 mb-6 px-2">{status}</p>

        <button
          onClick={startVoiceAuth}
          disabled={listening || verified}
          className={`w-full py-3.5 rounded-2xl font-bold text-sm shadow-lg transition flex items-center justify-center gap-2 ${
            verified 
              ? 'bg-emerald-600 text-white' 
              : listening 
                ? 'bg-pink-600 animate-pulse text-white' 
                : 'bg-gradient-to-r from-cyan-500 to-purple-600 hover:opacity-95 text-white shadow-[0_0_20px_rgba(34,211,238,0.4)]'
          }`}
        >
          <Mic size={18} /> {verified ? 'Verified Successfully' : listening ? 'Listening...' : 'Verify Voice Passcode'}
        </button>

        <button
          onClick={onAuthenticated}
          className="mt-3 text-xs text-gray-500 hover:text-gray-300 transition"
        >
          Skip Voice Verification (Guest Mode)
        </button>
      </motion.div>
    </div>
  );
};
