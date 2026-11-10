import React, { createContext, useContext, useState, useEffect } from 'react';
import { COMPREHENSIVE_OUTFITS, OutfitItem } from '../data/wardrobeData';
import { HAIRSTYLES, HairstyleOption } from '../data/hairstylesData';
import { LANGUAGES, LanguageOption } from '../data/languagesData';
import { ACCESSORIES, AccessoryItem } from '../data/accessoriesData';
import { ACTIVITIES, CompanionActivity } from '../data/activitiesData';
import { soundService } from '../services/soundService';

export type OutfitId = string;
export type OutfitOption = OutfitItem;
export type PoseState = 'normal' | 'namaste' | 'heart' | 'flirty' | 'dance';

export const OUTFIT_OPTIONS: OutfitOption[] = COMPREHENSIVE_OUTFITS;

export interface AvatarConfig {
  color: number;
  shape: 'sphere' | 'box' | 'torus' | 'torusKnot';
}

export interface AvatarContextType {
  avatar: AvatarConfig;
  setAvatar: (config: AvatarConfig) => void;

  // Outfits (56+ items)
  outfitId: OutfitId;
  currentOutfit: OutfitOption;
  setOutfitId: (id: OutfitId, speakReaction?: boolean) => void;
  outfits: OutfitOption[];
  isTransitioningOutfit: boolean;
  transitionKey: number;

  // Hairstyles (45+ items)
  hairstyleId: string;
  currentHairstyle: HairstyleOption;
  setHairstyleId: (id: string, speakReaction?: boolean) => void;
  hairstyles: HairstyleOption[];
  isTransitioningHairstyle: boolean;

  // Accessories & Jewelry (16+ items)
  accessoryId: string | null;
  currentAccessory: AccessoryItem | null;
  setAccessoryId: (id: string | null, speakReaction?: boolean) => void;
  accessories: AccessoryItem[];

  // Languages (22 global & Indian languages)
  languageCode: string;
  currentLanguage: LanguageOption;
  setLanguageCode: (code: string, speakGreeting?: boolean) => void;
  languages: LanguageOption[];

  // Real-girl Body Pose & Gesture Control
  poseState: PoseState;
  setPoseState: (pose: PoseState, speakReaction?: boolean) => void;

  // Interactive Activity / Date Mode
  activeActivity: CompanionActivity | null;
  setActiveActivity: (act: CompanionActivity | null) => void;

  // Ambient BGM Toggle
  isBgmPlaying: boolean;
  toggleBgm: () => void;
}

const defaultOutfit = COMPREHENSIVE_OUTFITS[0];
const defaultHairstyle = HAIRSTYLES[0];
const defaultLanguage = LANGUAGES[0]; // Hindi by default

const AvatarContext = createContext<AvatarContextType>({
  avatar: { color: 0x818cf8, shape: 'sphere' },
  setAvatar: () => {},
  outfitId: defaultOutfit.id,
  currentOutfit: defaultOutfit,
  setOutfitId: () => {},
  outfits: COMPREHENSIVE_OUTFITS,
  isTransitioningOutfit: false,
  transitionKey: 0,
  hairstyleId: defaultHairstyle.id,
  currentHairstyle: defaultHairstyle,
  setHairstyleId: () => {},
  hairstyles: HAIRSTYLES,
  isTransitioningHairstyle: false,
  accessoryId: null,
  currentAccessory: null,
  setAccessoryId: () => {},
  accessories: ACCESSORIES,
  languageCode: defaultLanguage.code,
  currentLanguage: defaultLanguage,
  setLanguageCode: () => {},
  languages: LANGUAGES,
  poseState: 'normal',
  setPoseState: () => {},
  activeActivity: null,
  setActiveActivity: () => {},
  isBgmPlaying: false,
  toggleBgm: () => {},
});

export const AvatarProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [avatar, setAvatar] = useState<AvatarConfig>({ color: 0x818cf8, shape: 'sphere' });

  // Persistent outfit state
  const [outfitId, setOutfitIdState] = useState<OutfitId>(() => {
    const saved = localStorage.getItem('maya_outfit_id');
    return saved && COMPREHENSIVE_OUTFITS.some((o) => o.id === saved)
      ? saved
      : COMPREHENSIVE_OUTFITS[0].id;
  });

  // Persistent hairstyle state (45+ styles)
  const [hairstyleId, setHairstyleIdState] = useState<string>(() => {
    const saved = localStorage.getItem('maya_hairstyle_id');
    return saved && HAIRSTYLES.some((h) => h.id === saved)
      ? saved
      : HAIRSTYLES[0].id;
  });

  // Persistent accessory state
  const [accessoryId, setAccessoryIdState] = useState<string | null>(() => {
    const saved = localStorage.getItem('maya_accessory_id');
    return saved && ACCESSORIES.some((a) => a.id === saved) ? saved : 'kundan_maang_tikka';
  });

  // Persistent language state (22 languages)
  const [languageCode, setLanguageCodeState] = useState<string>(() => {
    const saved = localStorage.getItem('maya_language_code');
    return saved && LANGUAGES.some((l) => l.code === saved)
      ? saved
      : LANGUAGES[0].code;
  });

  // Body Pose state
  const [poseState, setPoseStateState] = useState<PoseState>('normal');

  // Active Date/Activity mode
  const [activeActivity, setActiveActivity] = useState<CompanionActivity | null>(null);

  // BGM playing state
  const [isBgmPlaying, setIsBgmPlaying] = useState<boolean>(false);

  const [isTransitioningOutfit, setIsTransitioningOutfit] = useState<boolean>(false);
  const [isTransitioningHairstyle, setIsTransitioningHairstyle] = useState<boolean>(false);
  const [transitionKey, setTransitionKey] = useState<number>(0);

  const currentOutfit = COMPREHENSIVE_OUTFITS.find((o) => o.id === outfitId) || COMPREHENSIVE_OUTFITS[0];
  const currentHairstyle = HAIRSTYLES.find((h) => h.id === hairstyleId) || HAIRSTYLES[0];
  const currentAccessory = ACCESSORIES.find((a) => a.id === accessoryId) || null;
  const currentLanguage = LANGUAGES.find((l) => l.code === languageCode) || LANGUAGES[0];

  useEffect(() => {
    localStorage.setItem('maya_outfit_id', outfitId);
  }, [outfitId]);

  useEffect(() => {
    localStorage.setItem('maya_hairstyle_id', hairstyleId);
  }, [hairstyleId]);

  useEffect(() => {
    if (accessoryId) localStorage.setItem('maya_accessory_id', accessoryId);
    else localStorage.removeItem('maya_accessory_id');
  }, [accessoryId]);

  useEffect(() => {
    localStorage.setItem('maya_language_code', languageCode);
  }, [languageCode]);

  const toggleBgm = () => {
    const nextState = soundService.toggleAmbientBGM();
    setIsBgmPlaying(nextState);
  };

  const setOutfitId = (id: OutfitId, speakReaction = false) => {
    soundService.playOutfitShimmer();
    setIsTransitioningOutfit(true);
    setTransitionKey((k) => k + 1);
    setOutfitIdState(id);

    const chosen = COMPREHENSIVE_OUTFITS.find((o) => o.id === id);
    if (chosen) {
      setAvatar((prev) => ({ ...prev, color: chosen.color }));
      if (speakReaction && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const reaction = currentLanguage.code === 'en-US' ? chosen.voiceReactionEnglish : chosen.voiceReactionHindi;
          const utter = new SpeechSynthesisUtterance(reaction);
          utter.lang = currentLanguage.voiceLangCode;
          utter.pitch = 1.25;
          utter.rate = 1.0;
          window.speechSynthesis.speak(utter);
        } catch (e) {
          console.warn('Speech synthesis error:', e);
        }
      }
    }

    setTimeout(() => {
      setIsTransitioningOutfit(false);
    }, 850);
  };

  const setHairstyleId = (id: string, speakReaction = false) => {
    soundService.playSparkle();
    setIsTransitioningHairstyle(true);
    setHairstyleIdState(id);

    const chosen = HAIRSTYLES.find((h) => h.id === id);
    if (chosen && speakReaction && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(chosen.voiceReaction);
        utter.lang = currentLanguage.voiceLangCode;
        utter.pitch = 1.25;
        utter.rate = 1.0;
        window.speechSynthesis.speak(utter);
      } catch (e) {
        console.warn('Speech synthesis error:', e);
      }
    }

    setTimeout(() => {
      setIsTransitioningHairstyle(false);
    }, 600);
  };

  const setAccessoryId = (id: string | null, speakReaction = false) => {
    soundService.playSparkle();
    setAccessoryIdState(id);

    if (id) {
      const chosen = ACCESSORIES.find((a) => a.id === id);
      if (chosen && speakReaction && 'speechSynthesis' in window) {
        try {
          window.speechSynthesis.cancel();
          const utter = new SpeechSynthesisUtterance(chosen.voiceReaction);
          utter.lang = currentLanguage.voiceLangCode;
          utter.pitch = 1.25;
          utter.rate = 1.0;
          window.speechSynthesis.speak(utter);
        } catch (e) {
          console.warn('Speech synthesis error:', e);
        }
      }
    }
  };

  const setPoseState = (pose: PoseState, speakReaction = false) => {
    soundService.playClick();
    setPoseStateState(pose);

    const poseGreetings: Record<PoseState, string> = {
      namaste: 'नमस्ते! आपका स्वागत है।',
      heart: 'यह आपके लिए प्यार का इशारा है!',
      flirty: 'हेय वहाँ! आप बहुत प्यारे लग रहे हैं।',
      dance: 'चलिए संगीत की धुन पर साथ झूमते हैं!',
      normal: 'प्राकृतिक मुद्रा।',
    };

    if (speakReaction && poseGreetings[pose] && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(poseGreetings[pose]);
        utter.lang = currentLanguage.voiceLangCode;
        utter.pitch = 1.25;
        utter.rate = 1.0;
        window.speechSynthesis.speak(utter);
      } catch (e) {
        // ignore
      }
    }
  };

  const setLanguageCode = (code: string, speakGreeting = false) => {
    soundService.playClick();
    setLanguageCodeState(code);
    const chosen = LANGUAGES.find((l) => l.code === code);
    if (chosen && speakGreeting && 'speechSynthesis' in window) {
      try {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(chosen.sampleGreeting);
        utter.lang = chosen.voiceLangCode;
        utter.pitch = 1.25;
        utter.rate = 1.0;
        window.speechSynthesis.speak(utter);
      } catch (e) {
        console.warn('Speech synthesis error:', e);
      }
    }
  };

  return (
    <AvatarContext.Provider 
      value={{ 
        avatar, 
        setAvatar, 
        outfitId, 
        currentOutfit, 
        setOutfitId, 
        outfits: COMPREHENSIVE_OUTFITS,
        isTransitioningOutfit,
        transitionKey,
        hairstyleId,
        currentHairstyle,
        setHairstyleId,
        hairstyles: HAIRSTYLES,
        isTransitioningHairstyle,
        accessoryId,
        currentAccessory,
        setAccessoryId,
        accessories: ACCESSORIES,
        languageCode,
        currentLanguage,
        setLanguageCode,
        languages: LANGUAGES,
        poseState,
        setPoseState,
        activeActivity,
        setActiveActivity,
        isBgmPlaying,
        toggleBgm,
      }}
    >
      {children}
    </AvatarContext.Provider>
  );
};

export const useAvatar = () => useContext(AvatarContext);
