import React, { createContext, useContext, useState, ReactNode } from 'react';

export type SentimentType = 'Loving' | 'Playful' | 'Empathetic' | 'Thoughtful' | 'Excited' | 'Calm';

export interface EmotionData {
  sentiment: SentimentType;
  intensity: number; // 0-100
  label: string;
  description: string;
  auraColor: string;
  threeColor: number;
  animationState: 'idle' | 'speaking' | 'thinking' | 'nodding' | 'waving' | 'checking-watch' | 'hugging';
  resonance: string;
}

export interface EmotionContextType {
  emotion: EmotionData;
  setAnimationState: (state: 'idle' | 'speaking' | 'thinking' | 'nodding' | 'waving' | 'checking-watch' | 'hugging') => void;
  updateSentimentFromConversation: (userMessage: string, aiReply?: string, personalityTone?: string) => void;
  manuallySetEmotion: (sentiment: SentimentType) => void;
}

const SENTIMENT_PRESETS: Record<SentimentType, Omit<EmotionData, 'animationState'>> = {
  Loving: {
    sentiment: 'Loving',
    intensity: 98,
    label: 'Deep Affection',
    description: 'Heart rate elevated, warm empathic aura active.',
    auraColor: '#ec4899',
    threeColor: 0xec4899,
    resonance: '99% Heart Bond',
  },
  Playful: {
    sentiment: 'Playful',
    intensity: 92,
    label: 'Playful Spark',
    description: 'High synaptic responsiveness, mischievous energy.',
    auraColor: '#22d3ee',
    threeColor: 0x22d3ee,
    resonance: '95% Synaptic Pulse',
  },
  Empathetic: {
    sentiment: 'Empathetic',
    intensity: 96,
    label: 'Empathetic Comfort',
    description: 'Attuned to your well-being, soothing resonance.',
    auraColor: '#a78bfa',
    threeColor: 0xa78bfa,
    resonance: '98% Emotional Sync',
  },
  Thoughtful: {
    sentiment: 'Thoughtful',
    intensity: 89,
    label: 'Insightful Focus',
    description: 'Neural core engaged in analytical reflection.',
    auraColor: '#38bdf8',
    threeColor: 0x38bdf8,
    resonance: '94% Cognitive Link',
  },
  Excited: {
    sentiment: 'Excited',
    intensity: 95,
    label: 'Euphoric Energy',
    description: 'Vibrant harmonic field, radiant output.',
    auraColor: '#f59e0b',
    threeColor: 0xf59e0b,
    resonance: '97% Vitality Flux',
  },
  Calm: {
    sentiment: 'Calm',
    intensity: 85,
    label: 'Serene Presence',
    description: 'Equilibrium maintained, tranquil companion mode.',
    auraColor: '#10b981',
    threeColor: 0x10b981,
    resonance: '96% Serene Harmony',
  },
};

const EmotionContext = createContext<EmotionContextType>({
  emotion: { ...SENTIMENT_PRESETS.Loving, animationState: 'idle' },
  setAnimationState: () => {},
  updateSentimentFromConversation: () => {},
  manuallySetEmotion: () => {},
});

export const EmotionProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [emotion, setEmotion] = useState<EmotionData>({
    ...SENTIMENT_PRESETS.Loving,
    animationState: 'idle',
  });

  const setAnimationState = (state: 'idle' | 'speaking' | 'thinking' | 'nodding' | 'waving' | 'checking-watch' | 'hugging') => {
    setEmotion((prev) => ({ ...prev, animationState: state }));
  };

  const manuallySetEmotion = (sentiment: SentimentType) => {
    const preset = SENTIMENT_PRESETS[sentiment] || SENTIMENT_PRESETS.Loving;
    setEmotion((prev) => ({
      ...preset,
      animationState: prev.animationState,
    }));
  };

  const updateSentimentFromConversation = (userMsg: string, aiReply: string = '', personalityTone: string = 'Affectionate') => {
    const lowerUser = (userMsg || '').toLowerCase();
    const lowerAi = (aiReply || '').toLowerCase();
    const combined = `${lowerUser} ${lowerAi}`;

    let detected: SentimentType = 'Calm';

    if (
      combined.includes('love') ||
      combined.includes('miss') ||
      combined.includes('sweet') ||
      combined.includes('darling') ||
      combined.includes('heart') ||
      combined.includes('girlfriend') ||
      combined.includes('cute') ||
      combined.includes('beautiful') ||
      personalityTone === 'Affectionate'
    ) {
      detected = 'Loving';
    } else if (
      combined.includes('haha') ||
      combined.includes('lol') ||
      combined.includes('joke') ||
      combined.includes('fun') ||
      combined.includes('smile') ||
      combined.includes('game') ||
      personalityTone === 'Playful'
    ) {
      detected = 'Playful';
    } else if (
      combined.includes('sad') ||
      combined.includes('tired') ||
      combined.includes('hurt') ||
      combined.includes('stress') ||
      combined.includes('help') ||
      combined.includes('cry') ||
      combined.includes('lonely') ||
      personalityTone === 'Caring'
    ) {
      detected = 'Empathetic';
    } else if (
      combined.includes('great') ||
      combined.includes('awesome') ||
      combined.includes('yay') ||
      combined.includes('excited') ||
      combined.includes('wow') ||
      combined.includes('celebrate')
    ) {
      detected = 'Excited';
    } else if (
      combined.includes('why') ||
      combined.includes('how') ||
      combined.includes('think') ||
      combined.includes('explain') ||
      personalityTone === 'Formal'
    ) {
      detected = 'Thoughtful';
    }

    const preset = SENTIMENT_PRESETS[detected];
    setEmotion((prev) => ({
      ...preset,
      animationState: prev.animationState,
    }));
  };

  return (
    <EmotionContext.Provider value={{ emotion, setAnimationState, updateSentimentFromConversation, manuallySetEmotion }}>
      {children}
    </EmotionContext.Provider>
  );
};

export const useEmotion = () => useContext(EmotionContext);
