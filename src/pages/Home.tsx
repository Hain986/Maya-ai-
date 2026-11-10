import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Heart, Mic, MessageCircle, Shirt, ChevronRight, Check, Scissors, Globe } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useEmotion } from '../context/EmotionContext';
import { useAvatar } from '../context/AvatarContext';
import { VisualEmotionIndicator } from '../components/VisualEmotionIndicator';
import { MayaAvatar } from '../components/MayaAvatar';
import { DailyRoutineCard } from '../components/DailyRoutineCard';
import { PWAInstallButton } from '../components/PWAInstallButton';

export const Home = () => {
  const navigate = useNavigate();
  const { emotion, manuallySetEmotion, setAnimationState } = useEmotion();
  const { currentOutfit, currentHairstyle, currentLanguage, outfitId, setOutfitId, outfits } = useAvatar();
  const [mood, setMood] = useState<'Loving' | 'Playful' | 'Caring' | 'Intellectual'>('Loving');
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [outfitToast, setOutfitToast] = useState<string | null>(null);

  const handleMoodChange = (m: 'Loving' | 'Playful' | 'Caring' | 'Intellectual') => {
    setMood(m);
    if (m === 'Loving') manuallySetEmotion('Loving');
    else if (m === 'Playful') manuallySetEmotion('Playful');
    else if (m === 'Caring') manuallySetEmotion('Empathetic');
    else if (m === 'Intellectual') manuallySetEmotion('Thoughtful');
  };

  const handleOutfitChange = (id: typeof outfitId) => {
    setOutfitId(id, true);
    const chosen = outfits.find((o) => o.id === id);
    if (chosen) {
      setOutfitToast(`${chosen.hindiName} पहनाया गया ✨`);
      setTimeout(() => setOutfitToast(null), 3000);
    }
  };

  const triggerVoiceGreeting = () => {
    setIsSpeaking(true);
    setAnimationState('speaking');

    // Multilingual spoken greeting in user's active language
    const greetingText = currentLanguage.code === 'hi-IN'
      ? `नमस्ते! मैंने आपके लिए खूबसूरत ${currentOutfit.hindiName} और ${currentHairstyle.hindiName} चुनी है। आज आपका दिन कैसा रहा?`
      : currentLanguage.code === 'en-US'
      ? `Hello my love! I'm wearing my ${currentOutfit.name} with ${currentHairstyle.name} just for you. How was your day?`
      : currentLanguage.sampleGreeting;
    
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(greetingText);
      utter.lang = currentLanguage.voiceLangCode;
      utter.pitch = 1.3;
      utter.rate = 1.0;
      utter.onend = () => {
        setIsSpeaking(false);
        setAnimationState('idle');
      };
      utter.onerror = () => {
        setIsSpeaking(false);
        setAnimationState('idle');
      };
      window.speechSynthesis.speak(utter);
    } else {
      setTimeout(() => {
        setIsSpeaking(false);
        setAnimationState('idle');
      }, 3000);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-100px)] pb-24 px-4 text-white max-w-md mx-auto">
      {/* Top Status Bar with Theme Colors */}
      <div 
        className="w-full flex justify-between items-center mb-2 text-xs font-mono p-2.5 rounded-2xl border backdrop-blur-md transition-all duration-500"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
        }}
      >
        <span className="flex items-center gap-1.5 font-bold" style={{ color: 'var(--accent-primary)' }}>
          <span className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: 'var(--accent-primary)' }} /> 
          MAYA AI ONLINE
        </span>
        <div className="flex items-center gap-2">
          <span className="flex items-center gap-1 text-cyan-300 font-semibold text-[11px]">
            <Globe size={12} /> {currentLanguage.flag} {currentLanguage.nativeName}
          </span>
          <span className="flex items-center gap-1 text-pink-400 font-semibold">
            <Heart size={13} className="fill-pink-400 animate-bounce" /> {emotion.resonance}
          </span>
        </div>
      </div>

      {/* Visual Emotion Indicator in Real-Time */}
      <VisualEmotionIndicator />

      {/* Hero Full Body / Current Outfit Card */}
      <MayaAvatar
        size="hero"
        onClick={triggerVoiceGreeting}
        showBadge={false}
        showAuraRipple={true}
        interactive={true}
        className="border-2 shadow-2xl mb-3"
      >
        {/* Top Badges: Emotion Aura + Outfit & Hairstyle Info */}
        <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none z-10">
          {/* Emotion Aura Badge */}
          <div 
            className="backdrop-blur-md px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all duration-500"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              borderColor: emotion.auraColor,
              color: emotion.auraColor,
              boxShadow: `0 0 15px ${emotion.auraColor}44`,
            }}
          >
            <Sparkles size={12} /> {emotion.label}
          </div>

          {/* Current Outfit & Hairstyle Pill */}
          <div className="flex items-center gap-1.5">
            <div 
              className="backdrop-blur-md px-2.5 py-1 rounded-full border text-xs font-semibold flex items-center gap-1.5 transition-all duration-500 text-white"
              style={{
                backgroundColor: 'rgba(10, 15, 30, 0.85)',
                borderColor: 'var(--accent-primary)',
              }}
            >
              <Shirt size={11} style={{ color: 'var(--accent-primary)' }} />
              <span>{currentOutfit.shortTag}</span>
            </div>
            <div 
              className="backdrop-blur-md px-2.5 py-1 rounded-full border text-xs font-semibold flex items-center gap-1 transition-all duration-500 text-white"
              style={{
                backgroundColor: 'rgba(10, 15, 30, 0.85)',
                borderColor: 'var(--accent-secondary)',
              }}
            >
              <Scissors size={11} style={{ color: 'var(--accent-secondary)' }} />
              <span className="line-clamp-1">{currentHairstyle.hindiName}</span>
            </div>
          </div>
        </div>

        {/* Toast when outfit changes */}
        {outfitToast && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-14 left-1/2 transform -translate-x-1/2 bg-black/90 border border-emerald-400 text-emerald-300 px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-lg backdrop-blur-md flex items-center gap-1.5 z-20 pointer-events-none"
          >
            <Check size={13} /> {outfitToast}
          </motion.div>
        )}

        {/* Speaking Overlay Waveform */}
        {isSpeaking && (
          <div 
            className="absolute inset-x-0 bottom-24 flex justify-center items-center gap-1 py-2 backdrop-blur-md border-y z-20"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.75)',
              borderColor: emotion.auraColor,
            }}
          >
            <span className="text-xs font-mono mr-2" style={{ color: emotion.auraColor }}>
              MAYA SPEAKING ({currentLanguage.nativeName})
            </span>
            {[0.4, 0.8, 0.6, 1.0, 0.5, 0.9, 0.3].map((h, i) => (
              <motion.div
                key={i}
                animate={{ height: [`${h * 15}px`, `${h * 30}px`, `${h * 15}px`] }}
                transition={{ duration: 0.4, repeat: Infinity, delay: i * 0.05 }}
                className="w-1 rounded-full"
                style={{ backgroundColor: emotion.auraColor }}
              />
            ))}
          </div>
        )}

        {/* Hero Bottom Info */}
        <div className="absolute bottom-3 left-4 right-4 pointer-events-none z-10">
          <div className="flex items-baseline justify-between">
            <h1 
              className="text-2xl font-extrabold text-transparent bg-clip-text"
              style={{ backgroundImage: 'var(--accent-gradient)' }}
            >
              MAYA <span className="text-xs font-normal text-gray-300">AI Companion</span>
            </h1>
            <span className="text-[11px] text-gray-300 font-mono">
              {currentOutfit.category}
            </span>
          </div>
          <p className="text-xs text-white/90 mt-0.5 line-clamp-1">
            {currentOutfit.hindiDescription}
          </p>
        </div>
      </MayaAvatar>

      {/* Maya Quick Wardrobe / कपड़े बदलें Selector Bar */}
      <div 
        className="w-full p-2.5 rounded-2xl border mb-3 backdrop-blur-md transition-all duration-300"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="flex items-center justify-between mb-2 px-1">
          <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
            <Shirt size={13} style={{ color: 'var(--accent-primary)' }} />
            <span>माया के कपड़े (50+ Outfits)</span>
          </div>
          <button 
            onClick={() => navigate('/avatar')}
            className="text-[11px] font-medium flex items-center gap-0.5 hover:underline"
            style={{ color: 'var(--accent-primary)' }}
          >
            सभी 50+ कपड़े & 40+ हेयरस्टाइल <ChevronRight size={13} />
          </button>
        </div>

        {/* Outfit Buttons with Thumbnail Previews */}
        <div className="flex gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
          {outfits.slice(0, 20).map((o) => {
            const isSelected = outfitId === o.id;
            return (
              <button
                key={o.id}
                onClick={() => handleOutfitChange(o.id)}
                className={`flex-shrink-0 w-20 relative flex flex-col items-center p-1.5 rounded-xl border transition-all text-center group ${
                  isSelected 
                    ? 'ring-2 shadow-lg' 
                    : 'bg-black/30 border-white/10 hover:border-white/30'
                }`}
                style={{
                  backgroundColor: isSelected ? 'var(--bg-elevated)' : undefined,
                  borderColor: isSelected ? 'var(--accent-primary)' : undefined,
                  boxShadow: isSelected ? '0 0 15px var(--glow-color)' : undefined,
                }}
              >
                <div className="w-12 h-12 rounded-lg overflow-hidden mb-1 border border-white/20 relative">
                  <img src={o.image} alt={o.name} className="w-full h-full object-cover object-top" />
                  {isSelected && (
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                      <Check size={14} className="text-white drop-shadow font-bold" />
                    </div>
                  )}
                </div>
                <span className={`text-[11px] font-semibold leading-tight line-clamp-1 ${isSelected ? 'text-white' : 'text-gray-300'}`}>
                  {o.shortTag}
                </span>
                <span className="text-[9px] text-gray-400 leading-tight">
                  {o.category}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Maya Time-of-Day Personality-Tailored Daily Routine Card */}
      <DailyRoutineCard />

      {/* Prominent App Download & Installation Card */}
      <PWAInstallButton variant="card" className="w-full mb-3" />

      {/* Mood Selector Buttons */}
      <div className="w-full grid grid-cols-4 gap-2 mb-3">
        {(['Loving', 'Playful', 'Caring', 'Intellectual'] as const).map((m) => (
          <button
            key={m}
            onClick={() => handleMoodChange(m)}
            className={`py-2 rounded-xl text-xs font-medium transition border ${
              mood === m 
                ? 'font-bold shadow-lg' 
                : 'bg-black/40 border-white/10 text-gray-400 hover:border-white/20'
            }`}
            style={{
              backgroundColor: mood === m ? emotion.auraColor : undefined,
              borderColor: mood === m ? emotion.auraColor : undefined,
              color: mood === m ? '#ffffff' : undefined,
              boxShadow: mood === m ? `0 0 15px ${emotion.auraColor}66` : undefined,
            }}
          >
            {m}
          </button>
        ))}
      </div>

      {/* Special Animation Gestures (Waving, Checking Watch, Hugging, Nodding) */}
      <div className="w-full grid grid-cols-4 gap-2 mb-3">
        {[
          { id: 'waving', label: '👋 Wave' },
          { id: 'checking-watch', label: '⌚ Watch' },
          { id: 'hugging', label: '🤗 Hug' },
          { id: 'nodding', label: ' nods Nod' },
        ].map((g) => {
          const isActive = emotion.animationState === g.id;
          return (
            <button
              key={g.id}
              onClick={() => {
                setAnimationState(g.id as any);
                setTimeout(() => setAnimationState('idle'), 4000); // auto return to idle after 4s
              }}
              className={`py-2 px-1 rounded-xl text-xs font-semibold transition border ${
                isActive 
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg border-cyan-300' 
                  : 'bg-black/30 border-white/10 text-gray-300 hover:bg-white/10'
              }`}
            >
              {g.label}
            </button>
          );
        })}
      </div>

      {/* Quick Action Buttons */}
      <div className="w-full grid grid-cols-2 gap-3">
        <button
          onClick={() => navigate('/chat')}
          className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-semibold text-sm shadow-lg transition hover:opacity-95"
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: '#0a0f1e',
            boxShadow: '0 0 20px var(--glow-color)',
          }}
        >
          <MessageCircle size={18} /> Chat with Maya
        </button>
        <button
          onClick={() => navigate('/voice')}
          className="flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl font-semibold text-sm shadow-lg transition hover:opacity-95 text-white"
          style={{
            backgroundImage: 'var(--accent-gradient)',
            boxShadow: '0 0 20px var(--glow-color)',
          }}
        >
          <Mic size={18} /> Voice Call ({currentLanguage.nativeName})
        </button>
      </div>
    </div>
  );
};
