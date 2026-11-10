import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ACTIVITIES, CompanionActivity } from '../data/activitiesData';
import { useAvatar } from '../context/AvatarContext';
import { useEmotion } from '../context/EmotionContext';
import { MayaAvatar } from '../components/MayaAvatar';
import { Sparkles, Heart, MessageCircle, Play, X, Clock, Shirt, Scissors, Globe, Crown, Volume2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const Activities = () => {
  const navigate = useNavigate();
  const { currentOutfit, currentHairstyle, currentAccessory, currentLanguage, activeActivity, setActiveActivity } = useAvatar();
  const { emotion, setAnimationState, manuallySetEmotion } = useEmotion();
  const [selectedActivity, setSelectedActivity] = useState<CompanionActivity | null>(activeActivity || ACTIVITIES[0]);
  const [inDateSession, setInDateSession] = useState(false);
  const [sessionTime, setSessionTime] = useState(0);
  const [speakingText, setSpeakingText] = useState<string | null>(null);

  useEffect(() => {
    let interval: any;
    if (inDateSession) {
      interval = setInterval(() => setSessionTime((t) => t + 1), 1000);
    }
    return () => clearInterval(interval);
  }, [inDateSession]);

  const handleStartDate = (act: CompanionActivity) => {
    setSelectedActivity(act);
    setActiveActivity(act);
    setInDateSession(true);
    setSessionTime(0);

    if (act.id === 'coffee_date') manuallySetEmotion('Loving');
    else if (act.id === 'stargazing_night') manuallySetEmotion('Thoughtful');
    else if (act.id === 'dance_party_music') manuallySetEmotion('Playful');
    else if (act.id === 'sunset_beach_walk') manuallySetEmotion('Loving');
    else if (act.id === 'study_focus_companion') manuallySetEmotion('Calm');

    speakText(act.openingPrompt);
  };

  const handleEndDate = () => {
    setInDateSession(false);
    setActiveActivity(null);
  };

  const speakText = (text: string) => {
    setSpeakingText(text);
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = currentLanguage.voiceLangCode;
      utter.pitch = 1.25;
      utter.rate = 1.0;
      setAnimationState('speaking');
      utter.onend = () => {
        setAnimationState('idle');
      };
      utter.onerror = () => {
        setAnimationState('idle');
      };
      window.speechSynthesis.speak(utter);
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="max-w-md mx-auto p-4 text-white pb-24">
      {/* Title */}
      <div className="flex justify-between items-center mb-4">
        <div>
          <h2 
            className="text-2xl font-extrabold text-transparent bg-clip-text"
            style={{ backgroundImage: 'var(--accent-gradient)' }}
          >
            Maya Date & Activities
          </h2>
          <p className="text-xs text-gray-300 mt-0.5">
            माया के साथ कॉफ़ी डेट, स्टारगेज़िंग, डांस और रोमांटिक पलों का आनंद लें
          </p>
        </div>
      </div>

      {/* Active Date Overlay Mode */}
      {inDateSession && selectedActivity ? (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="w-full rounded-3xl p-5 border-2 shadow-2xl relative overflow-hidden flex flex-col items-center text-center backdrop-blur-xl mb-6"
            style={{
              background: selectedActivity.bgGradient,
              borderColor: selectedActivity.auraColor,
              boxShadow: `0 0 45px ${selectedActivity.auraColor}55`,
            }}
          >
            {/* Header Status */}
            <div className="w-full flex justify-between items-center mb-3">
              <span 
                className="text-[10px] font-mono px-3 py-1 rounded-full border font-bold uppercase tracking-wider backdrop-blur-md"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.6)',
                  borderColor: selectedActivity.auraColor,
                  color: selectedActivity.auraColor,
                }}
              >
                {selectedActivity.icon} {selectedActivity.hindiTitle}
              </span>

              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-gray-200 bg-black/60 px-2.5 py-0.5 rounded-full border border-white/10 flex items-center gap-1">
                  <Clock size={12} /> {formatTime(sessionTime)}
                </span>
                <button
                  onClick={handleEndDate}
                  className="p-1.5 rounded-full bg-red-600/80 hover:bg-red-500 text-white transition"
                  title="डेट समाप्त करें"
                >
                  <X size={14} />
                </button>
              </div>
            </div>

            {/* Avatar Hero view during Date */}
            <MayaAvatar
              size="hero"
              className="border-2 shadow-2xl mb-3"
              showBadge={false}
              showAuraRipple={true}
              interactive={false}
              customAuraColor={selectedActivity.auraColor}
            >
              <div className="absolute top-3 left-3 bg-black/75 backdrop-blur-md px-3 py-1 rounded-full text-[10px] text-white border border-white/20 flex items-center gap-1">
                <Shirt size={10} className="text-cyan-300" /> {currentOutfit.shortTag}
                {currentAccessory && <> • {currentAccessory.icon}</>}
              </div>
            </MayaAvatar>

            {/* Maya Spoken Greeting */}
            <div 
              className="w-full p-3.5 rounded-2xl border text-xs leading-relaxed italic mb-4 backdrop-blur-md"
              style={{
                backgroundColor: 'rgba(0,0,0,0.65)',
                borderColor: `${selectedActivity.auraColor}66`,
                color: '#ffffff',
              }}
            >
              "{speakingText || selectedActivity.openingPrompt}"
            </div>

            {/* Date Topic Chips */}
            <div className="w-full space-y-1.5 mb-4">
              <p className="text-[10px] font-bold text-gray-300 uppercase tracking-wider text-left px-1">
                बातचीत के सुझाव (Tap Topic to Talk):
              </p>
              <div className="flex flex-wrap gap-1.5">
                {selectedActivity.suggestedTopics.map((topic, idx) => (
                  <button
                    key={idx}
                    onClick={() => speakText(`मुझे ${topic} के बारे में आपके विचार सुनकर बहुत खुशी होगी, बताइए ना!`)}
                    className="text-xs px-3 py-1.5 rounded-xl border transition backdrop-blur-md text-left font-medium hover:scale-105 active:scale-95"
                    style={{
                      backgroundColor: 'rgba(255,255,255,0.1)',
                      borderColor: 'rgba(255,255,255,0.2)',
                      color: selectedActivity.auraColor,
                    }}
                  >
                    ✨ {topic}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="w-full grid grid-cols-2 gap-2">
              <button
                onClick={() => navigate('/chat')}
                className="py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-lg"
                style={{
                  backgroundColor: selectedActivity.auraColor,
                  color: '#0a0f1e',
                }}
              >
                <MessageCircle size={15} /> चैट में बातें करें
              </button>
              <button
                onClick={() => speakText(selectedActivity.openingPrompt)}
                className="py-2.5 px-4 rounded-xl text-xs font-bold border border-white/20 bg-black/40 hover:bg-white/10 text-white transition flex items-center justify-center gap-1.5"
              >
                <Volume2 size={15} /> फिर से सुनें
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      ) : null}

      {/* Activities List */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
          उपलब्ध एक्टिविटीज & डेट मोड्स ({ACTIVITIES.length})
        </h3>

        {ACTIVITIES.map((act) => {
          const isActive = selectedActivity?.id === act.id && inDateSession;

          return (
            <div
              key={act.id}
              className={`p-4 rounded-3xl border transition-all duration-300 flex flex-col gap-3 ${
                isActive ? 'ring-2 shadow-2xl' : 'border-white/10 hover:border-white/20 bg-black/30'
              }`}
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: isActive ? act.auraColor : undefined,
                boxShadow: isActive ? `0 0 25px ${act.auraColor}55` : undefined,
              }}
            >
              <div className="flex gap-3.5 items-center">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border shadow-lg flex-shrink-0"
                  style={{
                    background: act.bgGradient,
                    borderColor: act.auraColor,
                  }}
                >
                  {act.icon}
                </div>

                <div className="flex-grow">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-extrabold text-white">
                      {act.hindiTitle}
                    </h4>
                    <span 
                      className="text-[9px] px-2 py-0.5 rounded-full font-mono font-bold"
                      style={{
                        backgroundColor: `${act.auraColor}22`,
                        color: act.auraColor,
                      }}
                    >
                      {act.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-300 mt-0.5 font-medium">{act.title}</p>
                  <p className="text-xs text-gray-400 mt-1 line-clamp-2 leading-snug">{act.hindiDescription}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-white/10">
                <div className="text-[10px] text-gray-400 flex items-center gap-1 font-mono">
                  <Heart size={11} className="text-pink-400 fill-pink-400" /> Maya Companion Date
                </div>

                <button
                  onClick={() => handleStartDate(act)}
                  className="py-2 px-4 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md hover:scale-105 active:scale-95"
                  style={{
                    backgroundColor: act.auraColor,
                    color: '#0a0f1e',
                  }}
                >
                  <Play size={13} className="fill-current" />
                  <span>{isActive ? 'डेट जारी रखें' : 'डेट शुरू करें'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
