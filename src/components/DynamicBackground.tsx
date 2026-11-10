import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useEmotion, SentimentType } from '../context/EmotionContext';

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export const DynamicBackground: React.FC = () => {
  const { emotion } = useEmotion();
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('night');

  useEffect(() => {
    const updateTime = () => {
      const hour = new Date().getHours();
      if (hour >= 5 && hour < 11) {
        setTimeOfDay('morning');
      } else if (hour >= 11 && hour < 17) {
        setTimeOfDay('afternoon');
      } else if (hour >= 17 && hour < 20) {
        setTimeOfDay('evening');
      } else {
        setTimeOfDay('night');
      }
    };

    updateTime();
    const timer = setInterval(updateTime, 60000); // Check every minute
    return () => clearInterval(timer);
  }, []);

  // Compute CSS gradient based on Time of Day & Emotional Sentiment
  const bgGradient = useMemo(() => {
    const sentiment = emotion.sentiment;

    if (timeOfDay === 'morning') {
      switch (sentiment) {
        case 'Loving':
          return 'radial-gradient(ellipse at top, #831843 0%, #4a152d 45%, #0f0714 100%)';
        case 'Empathetic':
          return 'radial-gradient(ellipse at top, #065f46 0%, #134e4a 45%, #051412 100%)';
        case 'Playful':
        case 'Excited':
          return 'radial-gradient(ellipse at top, #9a3412 0%, #78350f 45%, #170d06 100%)';
        case 'Thoughtful':
        case 'Calm':
        default:
          return 'radial-gradient(ellipse at top, #1e3a8a 0%, #1e1b4b 45%, #0a0b18 100%)';
      }
    } else if (timeOfDay === 'afternoon') {
      switch (sentiment) {
        case 'Loving':
          return 'radial-gradient(ellipse at top, #9d174d 0%, #4c1d95 45%, #0f081c 100%)';
        case 'Playful':
        case 'Excited':
          return 'radial-gradient(ellipse at top, #0891b2 0%, #164e63 45%, #08121a 100%)';
        case 'Empathetic':
          return 'radial-gradient(ellipse at top, #047857 0%, #064e3b 45%, #041410 100%)';
        case 'Thoughtful':
        case 'Calm':
        default:
          return 'radial-gradient(ellipse at top, #2563eb 0%, #1e293b 45%, #080d19 100%)';
      }
    } else if (timeOfDay === 'evening') {
      switch (sentiment) {
        case 'Loving':
          return 'radial-gradient(ellipse at top, #be185d 0%, #581c87 45%, #140517 100%)';
        case 'Empathetic':
          return 'radial-gradient(ellipse at top, #15803d 0%, #365314 45%, #0a1406 100%)';
        case 'Playful':
        case 'Excited':
          return 'radial-gradient(ellipse at top, #c026d3 0%, #4c1d95 45%, #0d0617 100%)';
        case 'Thoughtful':
        case 'Calm':
        default:
          return 'radial-gradient(ellipse at top, #4338ca 0%, #1e1b4b 45%, #070719 100%)';
      }
    } else {
      // Night
      switch (sentiment) {
        case 'Loving':
          return 'radial-gradient(ellipse at top, #831843 0%, #310e20 40%, #0a040d 100%)';
        case 'Playful':
        case 'Excited':
          return 'radial-gradient(ellipse at top, #0e7490 0%, #1e1035 45%, #05040e 100%)';
        case 'Empathetic':
          return 'radial-gradient(ellipse at top, #065f46 0%, #0b2921 45%, #030b08 100%)';
        case 'Thoughtful':
        case 'Calm':
        default:
          return 'radial-gradient(ellipse at top, #1e1b4b 0%, #0f172a 45%, #030712 100%)';
      }
    }
  }, [timeOfDay, emotion.sentiment]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden transition-all duration-1000">
      {/* Primary Dynamic Gradient Surface */}
      <motion.div
        key={`bg-grad-${timeOfDay}-${emotion.sentiment}`}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 1.2, ease: 'easeInOut' }}
        className="absolute inset-0"
        style={{ background: bgGradient }}
      />

      {/* SVG Overlay: Time of Day Solar / Celestial Atmosphere */}
      <div className="absolute inset-0 opacity-25">
        {timeOfDay === 'morning' && (
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <linearGradient id="sunbeams" x1="50%" y1="0%" x2="50%" y2="100%">
                <stop offset="0%" stopColor="#fef08a" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0" />
              </linearGradient>
            </defs>
            <polygon points="0,0 800,0 400,600" fill="url(#sunbeams)" />
            <polygon points="300,0 1200,0 700,700" fill="url(#sunbeams)" />
          </svg>
        )}

        {timeOfDay === 'evening' && (
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            <circle cx="50%" cy="10%" r="350" fill="#f43f5e" opacity="0.15" filter="blur(60px)" />
            <path d="M 0,300 Q 400,200 800,300 T 1600,300" fill="none" stroke="#fb7185" strokeWidth="1.5" opacity="0.2" />
          </svg>
        )}

        {timeOfDay === 'night' && (
          <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
            {/* Twinkling Starlight Points */}
            <circle cx="15%" cy="12%" r="1.5" fill="#ffffff" className="animate-ping" style={{ animationDuration: '3s' }} />
            <circle cx="85%" cy="18%" r="2.0" fill="#22d3ee" className="animate-ping" style={{ animationDuration: '4s' }} />
            <circle cx="35%" cy="25%" r="1.2" fill="#ffffff" />
            <circle cx="65%" cy="32%" r="1.8" fill="#ec4899" className="animate-ping" style={{ animationDuration: '5s' }} />
            <circle cx="75%" cy="65%" r="1.5" fill="#ffffff" />
            <circle cx="20%" cy="75%" r="2.2" fill="#a78bfa" />
          </svg>
        )}
      </div>

      {/* SVG Overlay: Maya Emotional Sentiment Mood Particles */}
      <AnimatePresence mode="wait">
        {emotion.sentiment === 'Loving' && (
          <motion.div
            key="svg-hearts"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.35 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <g fill="#ec4899" opacity="0.6">
                <path d="M 100,120 C 100,90 130,90 140,110 C 150,90 180,90 180,120 C 180,150 140,170 140,180 C 140,170 100,150 100,120 Z" transform="scale(0.4) translate(100, 200)" />
                <path d="M 100,120 C 100,90 130,90 140,110 C 150,90 180,90 180,120 C 180,150 140,170 140,180 C 140,170 100,150 100,120 Z" transform="scale(0.3) translate(800, 100)" />
                <path d="M 100,120 C 100,90 130,90 140,110 C 150,90 180,90 180,120 C 180,150 140,170 140,180 C 140,170 100,150 100,120 Z" transform="scale(0.5) translate(400, 900)" />
              </g>
            </svg>
          </motion.div>
        )}

        {(emotion.sentiment === 'Playful' || emotion.sentiment === 'Excited') && (
          <motion.div
            key="svg-sparkles"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.3 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <path d="M 200,200 L 210,220 L 230,230 L 210,240 L 200,260 L 190,240 L 170,230 L 190,220 Z" fill="#22d3ee" opacity="0.8" />
              <path d="M 600,150 L 608,165 L 623,173 L 608,181 L 600,196 L 592,181 L 577,173 L 592,165 Z" fill="#f472b6" opacity="0.7" />
              <path d="M 150,600 L 158,615 L 173,623 L 158,631 L 150,646 L 142,631 L 127,623 L 142,615 Z" fill="#f59e0b" opacity="0.7" />
            </svg>
          </motion.div>
        )}

        {emotion.sentiment === 'Thoughtful' && (
          <motion.div
            key="svg-neural"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <g stroke="#38bdf8" strokeWidth="1" fill="none" opacity="0.5">
                <line x1="100" y1="100" x2="250" y2="180" />
                <line x1="250" y1="180" x2="400" y2="120" />
                <line x1="250" y1="180" x2="300" y2="350" />
                <circle cx="100" cy="100" r="4" fill="#38bdf8" />
                <circle cx="250" cy="180" r="5" fill="#60a5fa" />
                <circle cx="400" cy="120" r="4" fill="#38bdf8" />
                <circle cx="300" cy="350" r="4" fill="#818cf8" />
              </g>
            </svg>
          </motion.div>
        )}

        {(emotion.sentiment === 'Empathetic' || emotion.sentiment === 'Calm') && (
          <motion.div
            key="svg-waves"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.25 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.8 }}
            className="absolute inset-0"
          >
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <path d="M 0 400 Q 200 350, 400 400 T 800 400 T 1200 400 V 800 H 0 Z" fill="#10b981" opacity="0.1" />
              <path d="M 0 450 Q 250 400, 500 450 T 1000 450 V 800 H 0 Z" fill="#065f46" opacity="0.15" />
            </svg>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Subtle Bottom Ambient Glow */}
      <div 
        className="absolute inset-x-0 bottom-0 h-48 transition-colors duration-1000"
        style={{
          background: `linear-gradient(to top, ${emotion.auraColor}22, transparent)`,
        }}
      />
    </div>
  );
};
