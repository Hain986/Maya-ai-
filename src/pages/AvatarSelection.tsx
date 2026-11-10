import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MayaAvatar3D } from '../components/MayaAvatar3D';
import { useAvatar, PoseState } from '../context/AvatarContext';
import { VisualEmotionIndicator } from '../components/VisualEmotionIndicator';
import { 
  Shirt, 
  Sparkles, 
  Check, 
  Volume2, 
  Bot, 
  Eye, 
  X, 
  Filter, 
  Tag, 
  Scissors, 
  Globe, 
  Search,
  CheckCircle2,
  Smile,
  Compass,
  Crown,
  Heart,
  Music,
  Zap,
  VolumeX
} from 'lucide-react';
import { useEmotion } from '../context/EmotionContext';
import { HairstyleOption } from '../data/hairstylesData';
import { AccessoryItem } from '../data/accessoriesData';

const avatars = [
  { id: 0, name: 'Maya', color: 0x00ffff, shape: 'sphere' as const, desc: 'The Classic Futuristic Hologram Companion' },
  { id: 1, name: 'Luna', color: 0xff00ff, shape: 'torus' as const, desc: 'Playful, Radiant, and High Energy' },
  { id: 2, name: 'Nova', color: 0xffaa00, shape: 'box' as const, desc: 'Mysterious, Grounded, and Deeply Calm' },
  { id: 3, name: 'Aria', color: 0x10b981, shape: 'torusKnot' as const, desc: 'Creative, Intuitive, and Spontaneous' },
];

type OutfitCategoryFilter = 'All' | 'Traditional' | 'Western' | 'Ethnic' | 'Casual' | 'Formal' | 'Festive' | 'Cyberpunk';
type HairstyleCategoryFilter = 'All' | 'Traditional' | 'Modern' | 'Casual' | 'Formal' | 'Cyberpunk';
type LanguageRegionFilter = 'All' | 'India' | 'Global';

export const AvatarSelection = () => {
  const { 
    avatar, 
    setAvatar, 
    outfitId, 
    currentOutfit, 
    setOutfitId, 
    outfits,
    hairstyleId,
    currentHairstyle,
    setHairstyleId,
    hairstyles,
    accessoryId,
    currentAccessory,
    setAccessoryId,
    accessories,
    languageCode,
    currentLanguage,
    setLanguageCode,
    languages,
    poseState,
    setPoseState,
    isBgmPlaying,
    toggleBgm
  } = useAvatar();

  const { emotion, setAnimationState } = useEmotion();
  const [activeTab, setActiveTab] = useState<'wardrobe' | 'hairstyles' | 'accessories' | 'poses' | 'languages' | 'models'>('wardrobe');
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);
  
  // Outfit preview & filter states
  const [previewOutfitId, setPreviewOutfitId] = useState<string | null>(null);
  const [outfitCategory, setOutfitCategory] = useState<OutfitCategoryFilter>('All');
  const [outfitSearch, setOutfitSearch] = useState('');

  // Hairstyle preview & filter states
  const [previewHairstyleId, setPreviewHairstyleId] = useState<string | null>(null);
  const [hairstyleCategory, setHairstyleCategory] = useState<HairstyleCategoryFilter>('All');
  const [hairstyleTexture, setHairstyleTexture] = useState<string>('All');
  const [hairstyleSearch, setHairstyleSearch] = useState('');

  // Accessory search
  const [accessorySearch, setAccessorySearch] = useState('');

  // Language filter states
  const [languageRegion, setLanguageRegion] = useState<LanguageRegionFilter>('All');
  const [languageSearch, setLanguageSearch] = useState('');

  // The outfit currently displayed in the Fitting Room showcase
  const displayedOutfit = previewOutfitId 
    ? (outfits.find((o) => o.id === previewOutfitId) || currentOutfit)
    : currentOutfit;

  const isPreviewingDifferentOutfit = previewOutfitId !== null && previewOutfitId !== outfitId;

  // The hairstyle currently previewed or active
  const displayedHairstyle = previewHairstyleId
    ? (hairstyles.find((h) => h.id === previewHairstyleId) || currentHairstyle)
    : currentHairstyle;

  const handleOutfitThumbnailClick = (id: string) => {
    setPreviewOutfitId(id);
  };

  const handleConfirmWearOutfit = (id: string) => {
    setOutfitId(id, true);
    setPreviewOutfitId(null);
    setPlayingVoiceId(id);
    setAnimationState('speaking');
    setTimeout(() => {
      setPlayingVoiceId(null);
      setAnimationState('idle');
    }, 3500);
  };

  const handleApplyHairstyle = (h: HairstyleOption) => {
    setHairstyleId(h.id, true);
    setPreviewHairstyleId(null);
    setPlayingVoiceId(h.id);
    setAnimationState('speaking');
    setTimeout(() => {
      setPlayingVoiceId(null);
      setAnimationState('idle');
    }, 3200);
  };

  const handleApplyAccessory = (acc: AccessoryItem) => {
    if (accessoryId === acc.id) {
      setAccessoryId(null, true);
    } else {
      setAccessoryId(acc.id, true);
      setPlayingVoiceId(acc.id);
      setAnimationState('speaking');
      setTimeout(() => {
        setPlayingVoiceId(null);
        setAnimationState('idle');
      }, 3000);
    }
  };

  const handleSelectLanguage = (code: string) => {
    setLanguageCode(code, true);
    setPlayingVoiceId(code);
    setAnimationState('speaking');
    setTimeout(() => {
      setPlayingVoiceId(null);
      setAnimationState('idle');
    }, 3500);
  };

  const playCustomAudio = (text: string, id: string, langCode = 'hi-IN') => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = langCode;
      utter.pitch = 1.25;
      utter.rate = 1.0;
      setPlayingVoiceId(id);
      setAnimationState('speaking');
      utter.onend = () => {
        setPlayingVoiceId(null);
        setAnimationState('idle');
      };
      utter.onerror = () => {
        setPlayingVoiceId(null);
        setAnimationState('idle');
      };
      window.speechSynthesis.speak(utter);
    }
  };

  // Filtered Outfits (56+ items)
  const filteredOutfits = useMemo(() => {
    return outfits.filter((o) => {
      const matchesCat = outfitCategory === 'All' || o.category === outfitCategory;
      const q = outfitSearch.toLowerCase().trim();
      const matchesSearch = !q || 
        o.name.toLowerCase().includes(q) || 
        o.hindiName.toLowerCase().includes(q) ||
        o.shortTag.toLowerCase().includes(q) ||
        o.fabrics.toLowerCase().includes(q) ||
        o.styleTags.some(t => t.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [outfits, outfitCategory, outfitSearch]);

  // Filtered Hairstyles (45+ items)
  const filteredHairstyles = useMemo(() => {
    return hairstyles.filter((h) => {
      const matchesCat = hairstyleCategory === 'All' || h.category === hairstyleCategory;
      const matchesTexture = hairstyleTexture === 'All' || h.texture === hairstyleTexture;
      const q = hairstyleSearch.toLowerCase().trim();
      const matchesSearch = !q || 
        h.name.toLowerCase().includes(q) || 
        h.hindiName.toLowerCase().includes(q) ||
        h.description.toLowerCase().includes(q);
      return matchesCat && matchesTexture && matchesSearch;
    });
  }, [hairstyles, hairstyleCategory, hairstyleTexture, hairstyleSearch]);

  // Filtered Accessories
  const filteredAccessories = useMemo(() => {
    return accessories.filter((a) => {
      const q = accessorySearch.toLowerCase().trim();
      return !q || a.name.toLowerCase().includes(q) || a.hindiName.toLowerCase().includes(q) || a.description.toLowerCase().includes(q);
    });
  }, [accessories, accessorySearch]);

  // Filtered Languages (22 items)
  const filteredLanguages = useMemo(() => {
    return languages.filter((l) => {
      const matchesRegion = languageRegion === 'All' || l.region === languageRegion;
      const q = languageSearch.toLowerCase().trim();
      const matchesSearch = !q || 
        l.name.toLowerCase().includes(q) || 
        l.nativeName.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q);
      return matchesRegion && matchesSearch;
    });
  }, [languages, languageRegion, languageSearch]);

  const posesList: { id: PoseState; title: string; hindiTitle: string; icon: string; desc: string }[] = [
    { id: 'normal', title: 'Natural Idle', hindiTitle: 'प्राकृतिक मुद्रा', icon: '✨', desc: 'Graceful weight shift & relaxed gaze' },
    { id: 'namaste', title: 'Namaste Welcome', hindiTitle: 'नमस्ते (भारतीय स्वागत)', icon: '🙏', desc: 'Sacred Indian greeting gesture' },
    { id: 'heart', title: 'Heart Gesture', hindiTitle: 'दिल का इशारा (Love Heart)', icon: '💖', desc: 'Heartbeat resonance & affectionate pulse' },
    { id: 'flirty', title: 'Playful Tilt', hindiTitle: 'चुलबुला अंदाज़ (Playful)', icon: '😉', desc: 'Playful wink & shoulder sway' },
    { id: 'dance', title: 'Dancing Sway', hindiTitle: 'डांस स्टाइल (Rhythmic Sway)', icon: '💃', desc: 'Rhythmic music dance sway' },
  ];

  return (
    <div 
      className="flex flex-col items-center min-h-screen p-4 text-white pb-28 max-w-md mx-auto transition-colors duration-500"
      style={{ backgroundColor: 'var(--bg-base)' }}
    >
      {/* Header */}
      <div className="w-full flex justify-between items-center mb-3">
        <div className="text-left">
          <h2 
            className="text-2xl font-extrabold text-transparent bg-clip-text"
            style={{ backgroundImage: 'var(--accent-gradient)' }}
          >
            Maya AI Studio
          </h2>
          <p className="text-[11px] text-gray-300">
            50+ कपड़े • 40+ हेयरस्टाइल • 16+ गहने • 22 भाषाएं
          </p>
        </div>

        {/* Ambient BGM Audio Toggle Button */}
        <button
          onClick={toggleBgm}
          className={`p-2.5 rounded-2xl border transition flex items-center gap-1 text-xs font-bold ${
            isBgmPlaying ? 'bg-pink-500/20 border-pink-400 text-pink-300 animate-pulse' : 'bg-black/40 border-white/10 text-gray-400'
          }`}
          title="Ambient Music Toggle"
        >
          {isBgmPlaying ? <Music size={14} className="text-pink-400" /> : <VolumeX size={14} />}
          <span>BGM</span>
        </button>
      </div>

      {/* Real-time Emotion Indicator */}
      <div className="w-full mb-3">
        <VisualEmotionIndicator compact />
      </div>

      {/* Main Mode Toggle Tabs Grid */}
      <div 
        className="w-full grid grid-cols-6 p-1 rounded-2xl border mb-4 backdrop-blur-md gap-0.5"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
        }}
      >
        <button
          onClick={() => setActiveTab('wardrobe')}
          className={`flex flex-col items-center justify-center py-2 px-0.5 rounded-xl text-[10px] font-bold transition-all ${
            activeTab === 'wardrobe' ? 'shadow-md' : 'text-gray-400 hover:text-white'
          }`}
          style={{
            backgroundColor: activeTab === 'wardrobe' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'wardrobe' ? '#0a0f1e' : undefined,
          }}
        >
          <Shirt size={13} className="mb-0.5" />
          <span>कपड़े</span>
        </button>

        <button
          onClick={() => setActiveTab('hairstyles')}
          className={`flex flex-col items-center justify-center py-2 px-0.5 rounded-xl text-[10px] font-bold transition-all ${
            activeTab === 'hairstyles' ? 'shadow-md' : 'text-gray-400 hover:text-white'
          }`}
          style={{
            backgroundColor: activeTab === 'hairstyles' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'hairstyles' ? '#0a0f1e' : undefined,
          }}
        >
          <Scissors size={13} className="mb-0.5" />
          <span>हेयरस्टाइल</span>
        </button>

        <button
          onClick={() => setActiveTab('accessories')}
          className={`flex flex-col items-center justify-center py-2 px-0.5 rounded-xl text-[10px] font-bold transition-all ${
            activeTab === 'accessories' ? 'shadow-md' : 'text-gray-400 hover:text-white'
          }`}
          style={{
            backgroundColor: activeTab === 'accessories' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'accessories' ? '#0a0f1e' : undefined,
          }}
        >
          <Crown size={13} className="mb-0.5" />
          <span>गहने</span>
        </button>

        <button
          onClick={() => setActiveTab('poses')}
          className={`flex flex-col items-center justify-center py-2 px-0.5 rounded-xl text-[10px] font-bold transition-all ${
            activeTab === 'poses' ? 'shadow-md' : 'text-gray-400 hover:text-white'
          }`}
          style={{
            backgroundColor: activeTab === 'poses' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'poses' ? '#0a0f1e' : undefined,
          }}
        >
          <Zap size={13} className="mb-0.5" />
          <span>मुद्रा</span>
        </button>

        <button
          onClick={() => setActiveTab('languages')}
          className={`flex flex-col items-center justify-center py-2 px-0.5 rounded-xl text-[10px] font-bold transition-all ${
            activeTab === 'languages' ? 'shadow-md' : 'text-gray-400 hover:text-white'
          }`}
          style={{
            backgroundColor: activeTab === 'languages' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'languages' ? '#0a0f1e' : undefined,
          }}
        >
          <Globe size={13} className="mb-0.5" />
          <span>भाषा</span>
        </button>

        <button
          onClick={() => setActiveTab('models')}
          className={`flex flex-col items-center justify-center py-2 px-0.5 rounded-xl text-[10px] font-bold transition-all ${
            activeTab === 'models' ? 'shadow-md' : 'text-gray-400 hover:text-white'
          }`}
          style={{
            backgroundColor: activeTab === 'models' ? 'var(--accent-primary)' : 'transparent',
            color: activeTab === 'models' ? '#0a0f1e' : undefined,
          }}
        >
          <Bot size={13} className="mb-0.5" />
          <span>3D</span>
        </button>
      </div>

      {/* ============================== TAB 1: WARDROBE (50+ OUTFITS) ============================== */}
      {activeTab === 'wardrobe' && (
        <div className="w-full space-y-4">
          {/* Quick Horizontal Thumbnail Rack */}
          <div 
            className="w-full p-3 rounded-2xl border backdrop-blur-md"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--border-color)',
            }}
          >
            <div className="flex items-center justify-between mb-2 px-1">
              <span className="text-xs font-bold flex items-center gap-1.5 text-white">
                <Eye size={13} style={{ color: 'var(--accent-primary)' }} />
                <span>थंबनेल पूर्वावलोकन (Tap Thumbnail to Preview)</span>
              </span>
              <span className="text-[10px] text-cyan-400 font-mono font-bold">
                {outfits.length} Outfits
              </span>
            </div>

            <div className="flex gap-2 overflow-x-auto pb-1.5 pt-0.5 scrollbar-thin">
              {outfits.slice(0, 24).map((o) => {
                const isCurrentlyWorn = outfitId === o.id;
                const isCurrentlyPreviewed = displayedOutfit.id === o.id;

                return (
                  <button
                    key={o.id}
                    onClick={() => handleOutfitThumbnailClick(o.id)}
                    className={`flex-shrink-0 w-20 relative flex flex-col items-center p-1.5 rounded-xl border transition-all text-center group ${
                      isCurrentlyPreviewed
                        ? 'ring-2 shadow-lg scale-105'
                        : 'bg-black/40 border-white/10 hover:border-white/30 hover:scale-102'
                    }`}
                    style={{
                      backgroundColor: isCurrentlyPreviewed ? 'var(--bg-elevated)' : undefined,
                      borderColor: isCurrentlyPreviewed ? 'var(--accent-primary)' : undefined,
                      boxShadow: isCurrentlyPreviewed ? '0 0 16px var(--glow-color)' : undefined,
                    }}
                    title={`Click to preview ${o.hindiName}`}
                  >
                    <div className="w-14 h-16 rounded-lg overflow-hidden mb-1 border border-white/20 relative shadow-inner">
                      <img 
                        src={o.image} 
                        alt={o.name} 
                        className="w-full h-full object-cover object-top transition duration-300 group-hover:scale-110" 
                      />
                      {isCurrentlyWorn && (
                        <div className="absolute top-1 left-1 bg-emerald-500/90 text-white rounded-full p-0.5 shadow">
                          <Check size={10} className="font-bold" />
                        </div>
                      )}
                      {isCurrentlyPreviewed && (
                        <div className="absolute inset-0 bg-black/40 backdrop-blur-[1px] flex items-center justify-center text-cyan-300 font-bold">
                          <Eye size={14} className="animate-pulse" />
                        </div>
                      )}
                    </div>

                    <span className={`text-[11px] font-semibold leading-tight line-clamp-1 ${
                      isCurrentlyPreviewed ? 'text-white' : 'text-gray-300'
                    }`}>
                      {o.shortTag}
                    </span>
                    <span className="text-[9px] text-gray-400 leading-tight">
                      {isCurrentlyWorn ? 'पहना हुआ' : o.category}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Active Fitting Room Showcase */}
          <div 
            className="w-full rounded-3xl p-4 border-2 shadow-2xl relative overflow-hidden transition-all duration-500 backdrop-blur-md"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: isPreviewingDifferentOutfit ? 'var(--accent-primary)' : emotion.auraColor,
              boxShadow: isPreviewingDifferentOutfit 
                ? '0 0 35px var(--glow-color)' 
                : `0 0 35px ${emotion.auraColor}33`,
            }}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-bold font-mono flex items-center gap-1.5" style={{ color: 'var(--accent-primary)' }}>
                {isPreviewingDifferentOutfit ? (
                  <>
                    <Eye size={13} className="text-cyan-400 animate-pulse" />
                    <span>PREVIEW ROOM • पूर्वावलोकन</span>
                  </>
                ) : (
                  <>
                    <Sparkles size={13} />
                    <span>CURRENT ATTIRE • वर्तमान पोशाक</span>
                  </>
                )}
              </span>

              {isPreviewingDifferentOutfit ? (
                <button
                  onClick={() => setPreviewOutfitId(null)}
                  className="text-[10px] px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 flex items-center gap-1 hover:bg-red-500/30 transition"
                >
                  <X size={10} /> रद्द करें
                </button>
              ) : (
                <span className="text-[11px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center gap-1">
                  <Check size={12} /> Active Look
                </span>
              )}
            </div>

            <div className="flex gap-4 items-center">
              <div className="w-28 h-40 rounded-2xl overflow-hidden border-2 border-white/20 flex-shrink-0 relative shadow-xl">
                <AnimatePresence mode="wait">
                  <motion.img 
                    key={displayedOutfit.id}
                    src={displayedOutfit.image} 
                    alt={displayedOutfit.name} 
                    initial={{ opacity: 0, scale: 1.05 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35 }}
                    className="w-full h-full object-cover object-top" 
                  />
                </AnimatePresence>
                <div className="absolute bottom-1 right-1 bg-black/75 px-1.5 py-0.5 rounded text-[9px] font-mono text-cyan-300 z-10 pointer-events-none">
                  {displayedOutfit.category}
                </div>
              </div>

              <div className="flex-grow">
                <h3 className="text-base font-extrabold text-white leading-tight">
                  {displayedOutfit.hindiName}
                </h3>
                <p className="text-xs font-medium text-gray-300 mb-1">
                  {displayedOutfit.name}
                </p>
                <p className="text-xs text-gray-300 leading-snug mb-2 line-clamp-2">
                  {displayedOutfit.hindiDescription}
                </p>
                <div className="text-[10px] text-gray-400 mb-2.5 flex items-center gap-1 font-mono">
                  <Tag size={10} /> {displayedOutfit.fabrics}
                </div>

                <div className="flex items-center gap-2">
                  {displayedOutfit.id !== outfitId ? (
                    <button
                      onClick={() => handleConfirmWearOutfit(displayedOutfit.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl text-xs font-bold transition shadow-md hover:opacity-95 active:scale-95"
                      style={{
                        backgroundColor: 'var(--accent-primary)',
                        color: '#0a0f1e',
                        boxShadow: '0 0 15px var(--glow-color)',
                      }}
                    >
                      <Shirt size={14} /> कपड़े पहनाएं (Wear)
                    </button>
                  ) : (
                    <div 
                      className="flex-1 py-1.5 px-3 rounded-xl text-xs font-semibold text-center border border-emerald-500/40 bg-emerald-500/10 text-emerald-300 flex items-center justify-center gap-1"
                    >
                      <Check size={13} /> पहना हुआ है
                    </div>
                  )}

                  <button
                    onClick={() => playCustomAudio(displayedOutfit.voiceReactionHindi, displayedOutfit.id, currentLanguage.voiceLangCode)}
                    className="p-2 rounded-xl border border-white/10 hover:border-white/30 text-gray-300 hover:text-white transition bg-black/40"
                    title="माया की आवाज सुनें"
                  >
                    <Volume2 size={15} className={playingVoiceId === displayedOutfit.id ? 'text-pink-400 animate-bounce' : ''} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Search & Filter Bar */}
          <div className="space-y-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={outfitSearch}
                onChange={(e) => setOutfitSearch(e.target.value)}
                placeholder="55+ कपड़ों में खोजें (Saree, Kurti, Jeans, Lehenga, Silk...)"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
              />
              {outfitSearch && (
                <button onClick={() => setOutfitSearch('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Category Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              <span className="text-[11px] text-gray-400 flex items-center gap-1 mr-1 flex-shrink-0">
                <Filter size={11} /> वर्ग:
              </span>
              {(['All', 'Traditional', 'Western', 'Ethnic', 'Casual', 'Formal', 'Festive', 'Cyberpunk'] as OutfitCategoryFilter[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setOutfitCategory(cat)}
                  className={`flex-shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-medium border transition ${
                    outfitCategory === cat 
                      ? 'font-bold' 
                      : 'bg-black/30 border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                  }`}
                  style={{
                    backgroundColor: outfitCategory === cat ? 'var(--accent-primary)' : undefined,
                    borderColor: outfitCategory === cat ? 'var(--accent-primary)' : undefined,
                    color: outfitCategory === cat ? '#0a0f1e' : undefined,
                  }}
                >
                  {cat === 'All' ? `सभी (${outfits.length})` : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Full Outfits List */}
          <div className="space-y-3">
            <div className="flex justify-between items-center px-1">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                उपलब्ध संग्रह ({filteredOutfits.length} पोशाकें)
              </h4>
              <span className="text-[10px] text-emerald-400 font-mono">
                50+ Complete Catalog
              </span>
            </div>

            {filteredOutfits.map((o) => {
              const isSelected = outfitId === o.id;
              const isPreviewed = displayedOutfit.id === o.id;

              return (
                <div
                  key={o.id}
                  className={`rounded-2xl border p-3.5 transition-all duration-300 flex flex-col gap-3 ${
                    isSelected ? 'ring-2 shadow-xl' : 'border-white/10 hover:border-white/20'
                  }`}
                  style={{
                    backgroundColor: isSelected ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                    borderColor: isSelected ? 'var(--accent-primary)' : isPreviewed ? 'cyan' : undefined,
                    boxShadow: isSelected ? '0 0 20px var(--glow-color)' : undefined,
                  }}
                >
                  <div className="flex gap-3.5 items-start">
                    <button
                      onClick={() => handleOutfitThumbnailClick(o.id)}
                      className="w-20 h-24 rounded-xl overflow-hidden border border-white/20 flex-shrink-0 relative shadow-md cursor-pointer group text-left"
                      title="पूर्वावलोकन के लिए क्लिक करें"
                    >
                      <img 
                        src={o.image} 
                        alt={o.name} 
                        className="w-full h-full object-cover object-top transition duration-300 group-hover:scale-110" 
                      />
                      {isSelected ? (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <Check size={20} className="text-white drop-shadow font-bold" />
                        </div>
                      ) : (
                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 flex items-center justify-center transition">
                          <Eye size={18} className="text-white opacity-0 group-hover:opacity-100 transition drop-shadow" />
                        </div>
                      )}
                    </button>

                    <div className="flex-grow">
                      <div className="flex items-center justify-between">
                        <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                          {o.hindiName}
                        </h4>
                        <span 
                          className="text-[10px] px-2 py-0.5 rounded-full font-mono font-medium border"
                          style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.05)',
                            borderColor: 'rgba(255, 255, 255, 0.15)',
                            color: 'var(--accent-primary)',
                          }}
                        >
                          {o.category}
                        </span>
                      </div>
                      <p className="text-xs text-gray-300 font-medium mt-0.5">
                        {o.name}
                      </p>
                      <p className="text-xs text-gray-400 mt-1 leading-snug line-clamp-2">
                        {o.hindiDescription}
                      </p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {o.styleTags.slice(0, 3).map((tag, idx) => (
                          <span key={idx} className="text-[9px] bg-white/5 border border-white/10 px-1.5 py-0.5 rounded text-gray-300">
                            #{tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-1 border-t border-white/10">
                    <button
                      onClick={() => handleOutfitThumbnailClick(o.id)}
                      className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-white/15 bg-black/40 hover:bg-white/10 text-gray-200 transition flex items-center gap-1"
                    >
                      <Eye size={13} /> प्रीव्यू
                    </button>

                    <button
                      onClick={() => handleConfirmWearOutfit(o.id)}
                      disabled={isSelected}
                      className={`flex-1 py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 ${
                        isSelected 
                          ? 'opacity-90 cursor-default' 
                          : 'hover:opacity-90 active:scale-95'
                      }`}
                      style={{
                        backgroundColor: isSelected ? 'var(--accent-primary)' : 'rgba(255, 255, 255, 0.12)',
                        color: isSelected ? '#0a0f1e' : '#ffffff',
                      }}
                    >
                      {isSelected ? (
                        <>
                          <Check size={14} /> पहना हुआ है
                        </>
                      ) : (
                        <>
                          <Shirt size={14} /> कपड़े पहनाएं (Wear)
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => playCustomAudio(o.voiceReactionHindi, o.id, currentLanguage.voiceLangCode)}
                      className="p-2 rounded-xl border border-white/10 hover:border-white/30 text-gray-300 hover:text-white transition bg-black/40"
                      title="माया की आवाज सुनें"
                    >
                      <Volume2 size={16} className={playingVoiceId === o.id ? 'text-pink-400 animate-pulse' : ''} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================== TAB 2: HAIRSTYLES (40+ HAIRSTYLES) ============================== */}
      {activeTab === 'hairstyles' && (
        <div className="w-full space-y-4">
          {/* Active Hairstyle Showcase */}
          <div 
            className="w-full rounded-3xl p-4 border-2 shadow-2xl relative overflow-hidden transition-all duration-500 backdrop-blur-md"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--accent-primary)',
              boxShadow: '0 0 30px var(--glow-color)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold font-mono flex items-center gap-1.5" style={{ color: 'var(--accent-primary)' }}>
                <Scissors size={14} />
                <span>ACTIVE HAIRSTYLE • वर्तमान केश-सज्जा</span>
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-semibold flex items-center gap-1">
                <CheckCircle2 size={11} /> {displayedHairstyle.length} • {displayedHairstyle.texture}
              </span>
            </div>

            <div className="flex items-center gap-3.5">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-3xl border shadow-lg flex-shrink-0"
                style={{
                  backgroundColor: 'rgba(0,0,0,0.5)',
                  borderColor: displayedHairstyle.colorHint || 'var(--accent-primary)',
                  boxShadow: `0 0 20px ${displayedHairstyle.colorHint || '#22d3ee'}44`,
                }}
              >
                {displayedHairstyle.iconTag}
              </div>

              <div className="flex-grow">
                <h3 className="text-base font-extrabold text-white leading-tight">
                  {displayedHairstyle.hindiName}
                </h3>
                <p className="text-xs font-medium text-gray-300">
                  {displayedHairstyle.name}
                </p>
                <p className="text-xs text-gray-400 mt-1 line-clamp-2">
                  {displayedHairstyle.description}
                </p>
              </div>

              <button
                onClick={() => playCustomAudio(displayedHairstyle.voiceReaction, displayedHairstyle.id, currentLanguage.voiceLangCode)}
                className="p-3 rounded-2xl border border-white/15 bg-black/50 hover:bg-white/10 transition text-cyan-300"
                title="माया की आवाज में हेयरस्टाइल की प्रतिक्रिया सुनें"
              >
                <Volume2 size={18} className={playingVoiceId === displayedHairstyle.id ? 'animate-bounce text-pink-400' : ''} />
              </button>
            </div>
          </div>

          {/* Search & Category Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={hairstyleSearch}
                onChange={(e) => setHairstyleSearch(e.target.value)}
                placeholder="40+ हेयरस्टाइल में खोजें (Gajra, Parandi, Bun, Waves, Braid...)"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
              />
              {hairstyleSearch && (
                <button onClick={() => setHairstyleSearch('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
              <span className="text-[11px] text-gray-400 flex items-center gap-1 mr-1 flex-shrink-0">
                <Filter size={11} /> श्रेणी:
              </span>
              {(['All', 'Traditional', 'Modern', 'Casual', 'Formal', 'Cyberpunk'] as HairstyleCategoryFilter[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setHairstyleCategory(cat)}
                  className={`flex-shrink-0 px-2.5 py-1 rounded-xl text-[11px] font-medium border transition ${
                    hairstyleCategory === cat 
                      ? 'font-bold' 
                      : 'bg-black/30 border-white/10 text-gray-400 hover:border-white/20 hover:text-white'
                  }`}
                  style={{
                    backgroundColor: hairstyleCategory === cat ? 'var(--accent-primary)' : undefined,
                    borderColor: hairstyleCategory === cat ? 'var(--accent-primary)' : undefined,
                    color: hairstyleCategory === cat ? '#0a0f1e' : undefined,
                  }}
                >
                  {cat === 'All' ? `सभी (${hairstyles.length})` : cat}
                </button>
              ))}
            </div>
          </div>

          {/* Hairstyles Grid / List */}
          <div className="space-y-2.5">
            <div className="flex justify-between items-center px-1">
              <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider">
                हेयरस्टाइल संग्रह ({filteredHairstyles.length} शैलियाँ)
              </h4>
              <span className="text-[10px] text-pink-400 font-mono">
                40+ Available
              </span>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {filteredHairstyles.map((h) => {
                const isSelected = hairstyleId === h.id;

                return (
                  <div
                    key={h.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isSelected ? 'ring-2 shadow-xl' : 'border-white/10 hover:border-white/20'
                    }`}
                    style={{
                      backgroundColor: isSelected ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                      borderColor: isSelected ? 'var(--accent-primary)' : undefined,
                      boxShadow: isSelected ? '0 0 15px var(--glow-color)' : undefined,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border flex-shrink-0"
                        style={{
                          backgroundColor: 'rgba(0,0,0,0.4)',
                          borderColor: h.colorHint || 'rgba(255,255,255,0.15)',
                        }}
                      >
                        {h.iconTag}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-xs font-bold text-white leading-tight">
                            {h.hindiName}
                          </h4>
                          <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-gray-300 font-mono">
                            {h.length}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-300">{h.name}</p>
                        <p className="text-[10px] text-gray-400 line-clamp-1 mt-0.5">{h.description}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => playCustomAudio(h.voiceReaction, h.id, currentLanguage.voiceLangCode)}
                        className="p-2 rounded-xl border border-white/10 hover:border-white/20 text-gray-300 hover:text-white transition bg-black/30"
                        title="माया की आवाज सुनें"
                      >
                        <Volume2 size={14} className={playingVoiceId === h.id ? 'text-pink-400 animate-pulse' : ''} />
                      </button>

                      <button
                        onClick={() => handleApplyHairstyle(h)}
                        disabled={isSelected}
                        className={`py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                          isSelected 
                            ? 'opacity-90 cursor-default' 
                            : 'hover:opacity-90 active:scale-95'
                        }`}
                        style={{
                          backgroundColor: isSelected ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                          color: isSelected ? '#0a0f1e' : '#ffffff',
                        }}
                      >
                        {isSelected ? (
                          <>
                            <Check size={12} /> लगाया है
                          </>
                        ) : (
                          <>
                            <Scissors size={12} /> लगाएं
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================== TAB 3: ACCESSORIES & JEWELRY (16+ ACCESSORIES) ============================== */}
      {activeTab === 'accessories' && (
        <div className="w-full space-y-4">
          {/* Active Accessory Banner */}
          <div 
            className="w-full rounded-3xl p-4 border-2 shadow-2xl relative overflow-hidden transition-all duration-500 backdrop-blur-md"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--accent-primary)',
              boxShadow: '0 0 30px var(--glow-color)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold font-mono flex items-center gap-1.5" style={{ color: 'var(--accent-primary)' }}>
                <Crown size={14} />
                <span>ACTIVE ACCESSORY • वर्तमान आभूषण</span>
              </span>
              {currentAccessory && (
                <button
                  onClick={() => setAccessoryId(null, true)}
                  className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30 transition"
                >
                  हटाएं (Remove)
                </button>
              )}
            </div>

            {currentAccessory ? (
              <div className="flex items-center gap-3.5">
                <div 
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-3xl border shadow-lg flex-shrink-0"
                  style={{
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    borderColor: currentAccessory.colorHint,
                  }}
                >
                  {currentAccessory.icon}
                </div>
                <div className="flex-grow">
                  <h3 className="text-base font-extrabold text-white">{currentAccessory.hindiName}</h3>
                  <p className="text-xs text-gray-300">{currentAccessory.name}</p>
                  <p className="text-xs text-gray-400 line-clamp-1 mt-0.5">{currentAccessory.hindiDescription}</p>
                </div>
              </div>
            ) : (
              <p className="text-xs text-gray-400 italic">कोई आभूषण नहीं पहना है। नीचे दी गई सूची से चुनें!</p>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={accessorySearch}
              onChange={(e) => setAccessorySearch(e.target.value)}
              placeholder="गहनों में खोजें (Maang Tikka, Nath, Jhumke, Choker, Visor...)"
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
            />
          </div>

          {/* Accessories Grid */}
          <div className="grid grid-cols-1 gap-2.5">
            {filteredAccessories.map((acc) => {
              const isSelected = accessoryId === acc.id;

              return (
                <div
                  key={acc.id}
                  className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                    isSelected ? 'ring-2 shadow-xl' : 'border-white/10 hover:border-white/20'
                  }`}
                  style={{
                    backgroundColor: isSelected ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                    borderColor: isSelected ? 'var(--accent-primary)' : undefined,
                    boxShadow: isSelected ? '0 0 15px var(--glow-color)' : undefined,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl border flex-shrink-0"
                      style={{
                        backgroundColor: 'rgba(0,0,0,0.4)',
                        borderColor: acc.colorHint,
                      }}
                    >
                      {acc.icon}
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-bold text-white">{acc.hindiName}</h4>
                        <span className="text-[9px] px-1.5 py-0.2 rounded bg-white/10 text-cyan-300 font-mono">
                          {acc.placement}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-300">{acc.name}</p>
                      <p className="text-[10px] text-gray-400 line-clamp-1">{acc.hindiDescription}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 flex-shrink-0">
                    <button
                      onClick={() => playCustomAudio(acc.voiceReaction, acc.id, currentLanguage.voiceLangCode)}
                      className="p-2 rounded-xl border border-white/10 hover:border-white/20 text-gray-300 hover:text-white transition bg-black/30"
                    >
                      <Volume2 size={14} className={playingVoiceId === acc.id ? 'text-pink-400 animate-pulse' : ''} />
                    </button>

                    <button
                      onClick={() => handleApplyAccessory(acc)}
                      className={`py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                        isSelected ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-white/10 text-white hover:bg-white/20'
                      }`}
                    >
                      {isSelected ? <Check size={13} /> : <Crown size={13} />}
                      <span>{isSelected ? 'पहना है' : 'पहनाएं'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================== TAB 4: POSES & GESTURE CONTROL ============================== */}
      {activeTab === 'poses' && (
        <div className="w-full space-y-4">
          <div className="text-left mb-2">
            <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
              <Zap size={14} className="text-cyan-400" />
              <span>माया की मुद्राएं (Body Poses & Gesture Control)</span>
            </h3>
            <p className="text-xs text-gray-400">
              माया के बॉडी पोस्टर और गेस्चर भाव को रीयल-टाइम में बदलें
            </p>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {posesList.map((p) => {
              const isSelected = poseState === p.id;

              return (
                <button
                  key={p.id}
                  onClick={() => setPoseState(p.id, true)}
                  className={`p-3.5 rounded-2xl border text-left transition flex items-center justify-between ${
                    isSelected ? 'ring-2 shadow-xl border-2' : 'border-white/10 hover:border-white/20 bg-black/30'
                  }`}
                  style={{
                    backgroundColor: isSelected ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                    borderColor: isSelected ? 'var(--accent-primary)' : undefined,
                    boxShadow: isSelected ? '0 0 20px var(--glow-color)' : undefined,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-3xl">{p.icon}</span>
                    <div>
                      <h4 className="text-sm font-bold text-white flex items-center gap-2">
                        {p.hindiTitle}
                        {isSelected && <span className="text-[9px] bg-cyan-400 text-black px-1.5 py-0.5 rounded font-bold">ACTIVE</span>}
                      </h4>
                      <p className="text-xs text-gray-300">{p.title}</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">{p.desc}</p>
                    </div>
                  </div>

                  <div 
                    className={`w-7 h-7 rounded-full border flex items-center justify-center ${
                      isSelected ? 'bg-cyan-400 text-black border-cyan-400 font-bold' : 'border-white/20 text-gray-500'
                    }`}
                  >
                    {isSelected ? <Check size={14} /> : <Zap size={12} />}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* ============================== TAB 5: LANGUAGES (20+ LANGUAGES) ============================== */}
      {activeTab === 'languages' && (
        <div className="w-full space-y-4">
          <div 
            className="w-full rounded-3xl p-4 border-2 shadow-2xl relative overflow-hidden transition-all duration-500 backdrop-blur-md"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: 'var(--accent-primary)',
              boxShadow: '0 0 30px var(--glow-color)',
            }}
          >
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold font-mono flex items-center gap-1.5" style={{ color: 'var(--accent-primary)' }}>
                <Globe size={14} />
                <span>ACTIVE LANGUAGE • सक्रिय भाषा</span>
              </span>
              <span className="text-[10px] px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold">
                Speech & Chat Synced
              </span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-4xl">{currentLanguage.flag}</span>
              <div className="flex-grow">
                <h3 className="text-base font-extrabold text-white">
                  {currentLanguage.nativeName} ({currentLanguage.name})
                </h3>
                <p className="text-xs text-gray-300 font-mono">
                  Locale: {currentLanguage.code} • Voice: {currentLanguage.voiceLangCode}
                </p>
                <p className="text-xs text-cyan-300 italic mt-1 line-clamp-2">
                  "{currentLanguage.sampleGreeting}"
                </p>
              </div>

              <button
                onClick={() => playCustomAudio(currentLanguage.sampleGreeting, currentLanguage.code, currentLanguage.voiceLangCode)}
                className="p-3 rounded-2xl border border-white/15 bg-black/50 hover:bg-white/10 transition text-cyan-300"
                title="इस भाषा में माया का अभिवादन सुनें"
              >
                <Volume2 size={18} className={playingVoiceId === currentLanguage.code ? 'animate-bounce text-pink-400' : ''} />
              </button>
            </div>
          </div>

          {/* Search & Region Filter */}
          <div className="space-y-2">
            <div className="relative">
              <Search size={14} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={languageSearch}
                onChange={(e) => setLanguageSearch(e.target.value)}
                placeholder="20+ भाषाओं में खोजें (Hindi, Gujarati, Tamil, Bengali, French...)"
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/40 border border-white/10 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-cyan-400"
              />
              {languageSearch && (
                <button onClick={() => setLanguageSearch('')} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white">
                  <X size={13} />
                </button>
              )}
            </div>

            {/* Region Filter Pills */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-gray-400 flex items-center gap-1">
                <Compass size={11} /> क्षेत्र:
              </span>
              {(['All', 'India', 'Global'] as LanguageRegionFilter[]).map((reg) => (
                <button
                  key={reg}
                  onClick={() => setLanguageRegion(reg)}
                  className={`flex-1 py-1.5 rounded-xl text-xs font-semibold border transition ${
                    languageRegion === reg 
                      ? 'font-bold' 
                      : 'bg-black/30 border-white/10 text-gray-400 hover:text-white'
                  }`}
                  style={{
                    backgroundColor: languageRegion === reg ? 'var(--accent-primary)' : undefined,
                    borderColor: languageRegion === reg ? 'var(--accent-primary)' : undefined,
                    color: languageRegion === reg ? '#0a0f1e' : undefined,
                  }}
                >
                  {reg === 'All' ? `सभी (${languages.length})` : reg === 'India' ? '🇮🇳 भारत (Regional)' : '🌐 Global (अंतर्राष्ट्रीय)'}
                </button>
              ))}
            </div>
          </div>

          {/* Languages Grid */}
          <div className="space-y-2.5">
            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1">
              समर्थित भाषाएं ({filteredLanguages.length})
            </h4>

            <div className="grid grid-cols-1 gap-2.5">
              {filteredLanguages.map((l) => {
                const isSelected = languageCode === l.code;

                return (
                  <div
                    key={l.code}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isSelected ? 'ring-2 shadow-xl' : 'border-white/10 hover:border-white/20'
                    }`}
                    style={{
                      backgroundColor: isSelected ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                      borderColor: isSelected ? 'var(--accent-primary)' : undefined,
                      boxShadow: isSelected ? '0 0 15px var(--glow-color)' : undefined,
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-3xl">{l.flag}</span>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-white">
                            {l.nativeName}
                          </h4>
                          <span className="text-xs text-gray-300 font-medium">
                            ({l.name})
                          </span>
                          <span className="text-[9px] px-1.5 py-0.5 rounded bg-white/10 text-gray-300 font-mono">
                            {l.region}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-400 line-clamp-1 mt-0.5 italic">
                          "{l.sampleGreeting}"
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      <button
                        onClick={() => playCustomAudio(l.sampleGreeting, l.code, l.voiceLangCode)}
                        className="p-2 rounded-xl border border-white/10 hover:border-white/20 text-gray-300 hover:text-white transition bg-black/30"
                        title="इस भाषा में माया की आवाज सुनें"
                      >
                        <Volume2 size={14} className={playingVoiceId === l.code ? 'text-pink-400 animate-pulse' : ''} />
                      </button>

                      <button
                        onClick={() => handleSelectLanguage(l.code)}
                        disabled={isSelected}
                        className={`py-1.5 px-3 rounded-xl text-xs font-bold transition flex items-center gap-1 ${
                          isSelected 
                            ? 'opacity-90 cursor-default' 
                            : 'hover:opacity-90 active:scale-95'
                        }`}
                        style={{
                          backgroundColor: isSelected ? 'var(--accent-primary)' : 'rgba(255,255,255,0.1)',
                          color: isSelected ? '#0a0f1e' : '#ffffff',
                        }}
                      >
                        {isSelected ? (
                          <>
                            <Check size={12} /> चुनी हुई
                          </>
                        ) : (
                          <>
                            <CheckCircle2 size={12} /> चुनें
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ============================== TAB 6: 3D HOLOGRAPHIC MODELS ============================== */}
      {activeTab === 'models' && (
        <div className="w-full space-y-4">
          <div className="grid grid-cols-1 gap-4 w-full">
            {avatars.map((a) => (
              <button
                key={a.id}
                onClick={() => setAvatar({ color: a.color, shape: a.shape })}
                className={`group p-4 rounded-3xl border transition-all duration-300 flex items-center gap-4 text-left ${
                  avatar.color === a.color 
                    ? 'shadow-xl border-2' 
                    : 'border-white/10 hover:border-white/20'
                }`}
                style={{
                  backgroundColor: avatar.color === a.color ? 'var(--bg-elevated)' : 'var(--bg-surface)',
                  borderColor: avatar.color === a.color ? 'var(--accent-primary)' : undefined,
                  boxShadow: avatar.color === a.color ? '0 0 25px var(--glow-color)' : undefined,
                }}
              >
                <div className="w-20 h-20 rounded-2xl overflow-hidden bg-black/60 border border-white/10 flex-shrink-0 flex items-center justify-center">
                  <MayaAvatar3D color={a.color} shape={a.shape} />
                </div>
                <div className="flex-grow">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    {a.name}
                    {avatar.color === a.color && (
                      <span 
                        className="text-[10px] px-2 py-0.5 rounded-full font-mono font-bold"
                        style={{
                          backgroundColor: 'var(--accent-primary)',
                          color: '#0a0f1e',
                        }}
                      >
                        ACTIVE
                      </span>
                    )}
                  </h3>
                  <p className="text-xs text-gray-400 mt-0.5">{a.desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
