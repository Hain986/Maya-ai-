import React from 'react';
import { motion } from 'framer-motion';
import { Heart, Sparkles, Smile, Brain, Flame, Activity } from 'lucide-react';
import { useEmotion, SentimentType } from '../context/EmotionContext';

interface VisualEmotionIndicatorProps {
  compact?: boolean;
}

const EMOTION_ICONS: Record<SentimentType, React.ElementType> = {
  Loving: Heart,
  Playful: Sparkles,
  Empathetic: Smile,
  Thoughtful: Brain,
  Excited: Flame,
  Calm: Activity,
};

export const VisualEmotionIndicator: React.FC<VisualEmotionIndicatorProps> = ({ compact = false }) => {
  const { emotion } = useEmotion();
  const Icon = EMOTION_ICONS[emotion.sentiment] || Sparkles;

  if (compact) {
    return (
      <div 
        className="flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md transition-all duration-500"
        style={{
          borderColor: `${emotion.auraColor}55`,
          backgroundColor: 'rgba(10, 15, 30, 0.75)',
          boxShadow: `0 0 15px ${emotion.auraColor}33`,
        }}
      >
        <div 
          className="w-2.5 h-2.5 rounded-full animate-ping"
          style={{ backgroundColor: emotion.auraColor }}
        />
        <Icon size={14} style={{ color: emotion.auraColor }} />
        <span className="text-xs font-semibold tracking-wide" style={{ color: emotion.auraColor }}>
          {emotion.label}
        </span>
        <span className="text-[10px] text-gray-400 font-mono">
          ({emotion.intensity}%)
        </span>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: -5 }}
      animate={{ opacity: 1, y: 0 }}
      className="w-full p-3.5 rounded-2xl border backdrop-blur-md transition-all duration-500 my-3"
      style={{
        borderColor: `${emotion.auraColor}44`,
        backgroundColor: 'var(--bg-surface)',
        boxShadow: `0 0 25px ${emotion.auraColor}22`,
      }}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2.5">
          <div 
            className="w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500"
            style={{ 
              backgroundColor: `${emotion.auraColor}25`,
              boxShadow: `0 0 12px ${emotion.auraColor}55`
            }}
          >
            <Icon size={17} style={{ color: emotion.auraColor }} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-wider text-gray-300">
                Maya Emotional Sentiment
              </span>
              <span 
                className="text-[10px] px-2 py-0.5 rounded-full font-bold font-mono uppercase"
                style={{
                  backgroundColor: `${emotion.auraColor}22`,
                  color: emotion.auraColor,
                  border: `1px solid ${emotion.auraColor}44`
                }}
              >
                {emotion.sentiment}
              </span>
            </div>
            <p className="text-xs font-medium text-white/90">
              {emotion.label} • <span className="font-mono text-cyan-300">{emotion.resonance}</span>
            </p>
          </div>
        </div>

        {/* Dynamic Sentiment Intensity Dial */}
        <div className="text-right">
          <span className="text-xs font-mono font-bold" style={{ color: emotion.auraColor }}>
            {emotion.intensity}%
          </span>
          <p className="text-[9px] text-gray-400 uppercase tracking-tight">Bond Sync</p>
        </div>
      </div>

      {/* Dynamic Animated Pulse Waveform */}
      <div className="flex items-center gap-1.5 h-3.5 w-full bg-black/40 px-2 rounded-lg overflow-hidden border border-white/5">
        {[0.3, 0.7, 0.5, 1.0, 0.8, 0.4, 0.9, 0.6, 0.85, 0.5, 0.75, 0.35, 0.95, 0.6].map((val, i) => (
          <motion.div
            key={i}
            animate={{
              height: [`${val * 4}px`, `${val * 12}px`, `${val * 4}px`],
              opacity: [0.6, 1, 0.6]
            }}
            transition={{
              duration: 0.8 + (i % 3) * 0.2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: i * 0.06,
            }}
            className="flex-1 rounded-full transition-colors duration-500"
            style={{ backgroundColor: emotion.auraColor }}
          />
        ))}
      </div>

      <p className="text-[11px] text-gray-400 mt-1.5 italic text-center">
        "{emotion.description}"
      </p>
    </motion.div>
  );
};
