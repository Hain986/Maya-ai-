import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAvatar } from '../context/AvatarContext';
import { useEmotion } from '../context/EmotionContext';
import { Sparkles, Shirt } from 'lucide-react';

interface MayaAvatarProps {
  size?: 'sm' | 'md' | 'lg' | 'hero' | 'circle' | 'full';
  className?: string;
  onClick?: () => void;
  showBadge?: boolean;
  showAuraRipple?: boolean;
  interactive?: boolean;
  overrideImage?: string;
  customAuraColor?: string;
  alt?: string;
  children?: React.ReactNode;
  enableBreathing?: boolean;
  enableGazeTracking?: boolean;
}

export const MayaAvatar: React.FC<MayaAvatarProps> = ({
  size = 'hero',
  className = '',
  onClick,
  showBadge = true,
  showAuraRipple = true,
  interactive = true,
  overrideImage,
  customAuraColor,
  alt = 'Maya AI Avatar',
  children,
  enableBreathing = true,
  enableGazeTracking = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { currentOutfit, isTransitioningOutfit, transitionKey } = useAvatar();
  const { emotion } = useEmotion();

  const auraColor = customAuraColor || emotion.auraColor || '#00ffff';
  const displayImage = overrideImage || currentOutfit.image;
  const isIdle = emotion.animationState === 'idle';
  const isThinking = emotion.animationState === 'thinking';
  const isSpeaking = emotion.animationState === 'speaking';
  const isIntense = emotion.intensity >= 92;
  const shouldBreathe = enableBreathing && isIdle && !isTransitioningOutfit;

  // Cinematic Camera Focus Zoom Calculation
  let camZoomScale = 1.0;
  let camZoomOffsetY = 0; // percentage shift towards face

  if (isThinking) {
    camZoomScale = 1.18; // Close-up focus on Maya's eyes & face during deep reflection
    camZoomOffsetY = -4; // Shift focus upward to eyes
  } else if (isSpeaking) {
    camZoomScale = 1.09; // Intimate portrait zoom during vocalization
    camZoomOffsetY = -2;
  } else if (isIntense) {
    camZoomScale = 1.05;
    camZoomOffsetY = -1;
  }

  // Real-girl full body movement animation class based on active animationState
  const movementClass = 
    isSpeaking 
      ? 'maya-real-girl-speaking-movement' 
      : isThinking 
      ? 'maya-real-girl-thinking-movement' 
      : emotion.animationState === 'nodding' 
      ? 'maya-real-girl-nodding-movement' 
      : emotion.animationState === 'waving' 
      ? 'maya-real-girl-waving-movement' 
      : emotion.animationState === 'checking-watch' 
      ? 'maya-real-girl-checking-watch-movement' 
      : emotion.animationState === 'hugging' 
      ? 'maya-real-girl-hugging-movement' 
      : !isTransitioningOutfit 
      ? 'maya-real-girl-idle-movement' 
      : '';

  // Gaze-tracking coordinates [-1 to 1]
  const [gaze, setGaze] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (!enableGazeTracking) return;

    let rafId: number;
    let targetX = 0;
    let targetY = 0;
    let currentX = 0;
    let currentY = 0;

    const handlePointerMove = (clientX: number, clientY: number) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height * 0.35; // centered around Maya's eye line

      const dx = (clientX - centerX) / (window.innerWidth / 2);
      const dy = (clientY - centerY) / (window.innerHeight / 2);

      // Clamp between -1 and 1
      targetX = Math.max(-1, Math.min(1, dx));
      targetY = Math.max(-1, Math.min(1, dy));
    };

    const onMouseMove = (e: MouseEvent) => {
      handlePointerMove(e.clientX, e.clientY);
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches && e.touches[0]) {
        handlePointerMove(e.touches[0].clientX, e.touches[0].clientY);
      }
    };

    const onMouseLeave = () => {
      targetX = 0;
      targetY = 0;
    };

    const loop = () => {
      // Smooth lerp for natural human eye and head tracking (fluid 60fps)
      currentX += (targetX - currentX) * 0.12;
      currentY += (targetY - currentY) * 0.12;

      setGaze({
        x: Number(currentX.toFixed(4)),
        y: Number(currentY.toFixed(4)),
      });

      rafId = requestAnimationFrame(loop);
    };

    window.addEventListener('mousemove', onMouseMove, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    document.addEventListener('mouseleave', onMouseLeave);
    rafId = requestAnimationFrame(loop);

    return () => {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('touchmove', onTouchMove);
      document.removeEventListener('mouseleave', onMouseLeave);
      cancelAnimationFrame(rafId);
    };
  }, [enableGazeTracking]);

  // Size preset configurations
  const sizeStyles: Record<string, { container: string; imgAspect: string }> = {
    sm: { container: 'w-10 h-10 rounded-full', imgAspect: 'w-full h-full' },
    md: { container: 'w-20 h-24 rounded-2xl', imgAspect: 'w-full h-full' },
    lg: { container: 'w-32 h-44 rounded-3xl', imgAspect: 'w-full h-full' },
    circle: { container: 'w-64 h-64 rounded-full', imgAspect: 'w-full h-full' },
    hero: { container: 'w-full h-[410px] rounded-3xl', imgAspect: 'w-full h-full' },
    full: { container: 'w-full h-full rounded-2xl', imgAspect: 'w-full h-full' },
  };

  const currentSize = sizeStyles[size] || sizeStyles.hero;

  // Gaze CSS transform calculations
  const headRotateY = gaze.x * 5.0; // degrees
  const headRotateX = -gaze.y * 3.8; // degrees
  const gazeShiftX = gaze.x * 6.0; // pixels parallax
  const gazeShiftY = gaze.y * 4.5; // pixels parallax
  const pupilCatchlightX = gaze.x * 9.5; // pupil specular catchlight shift
  const pupilCatchlightY = gaze.y * 6.5;

  return (
    <div
      ref={containerRef}
      onClick={interactive ? onClick : undefined}
      className={`relative overflow-hidden select-none transition-all duration-700 ${currentSize.container} ${
        interactive ? 'cursor-pointer group' : ''
      } ${className}`}
      style={{
        borderColor: auraColor,
        boxShadow: `0 0 30px ${auraColor}44`,
        perspective: '800px',
      }}
    >
      {/* Outer Holographic Energy Aura Wave (Flashes on outfit change) */}
      {showAuraRipple && isTransitioningOutfit && (
        <motion.div
          key={`aura-${transitionKey}`}
          initial={{ opacity: 0.9, scale: 0.95 }}
          animate={{ opacity: 0, scale: 1.15 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="absolute inset-0 rounded-inherit pointer-events-none z-20 border-4"
          style={{
            borderColor: auraColor,
            boxShadow: `0 0 50px ${auraColor}`,
          }}
        />
      )}

      {/* Cinematic Depth-of-Field Edge Vignette Blur when Thinking */}
      <AnimatePresence>
        {isThinking && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="absolute inset-0 z-20 pointer-events-none rounded-inherit"
            style={{
              boxShadow: `inset 0 0 45px ${auraColor}bb`,
              backdropFilter: 'contrast(1.05)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Main Avatar 3D Gaze-Tracking & Full Body Real-Girl Movement Wrapper */}
      <div 
        className={`w-full h-full relative will-change-transform ${movementClass}`}
        style={{
          transform: enableGazeTracking 
            ? `perspective(800px) rotateY(${headRotateY}deg) rotateX(${headRotateX}deg)` 
            : undefined,
          transition: 'transform 0.15s cubic-bezier(0.2, 0.8, 0.2, 1)',
        }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentOutfit.id + '-' + transitionKey}
            initial={{ 
              opacity: 0, 
              scale: 1.05, 
              filter: 'blur(10px) brightness(1.4)' 
            }}
            animate={{ 
              opacity: 1, 
              scale: 1, 
              filter: 'blur(0px) brightness(1)' 
            }}
            exit={{ 
              opacity: 0, 
              scale: 0.97, 
              filter: 'blur(6px) brightness(0.8)' 
            }}
            transition={{ 
              duration: 0.65, 
              ease: [0.16, 1, 0.3, 1] 
            }}
            className="w-full h-full relative"
          >
            {/* Subtle Realistic Breathing Chest Glow Overlay */}
            {shouldBreathe && (
              <div 
                className="absolute inset-0 pointer-events-none maya-chest-breath-glow z-10"
                style={{
                  background: 'radial-gradient(ellipse 35% 25% at 50% 55%, rgba(255, 255, 255, 0.08) 0%, transparent 75%)',
                }}
              />
            )}

            {/* Eye Gaze-Tracking Specular Catchlights (Placed over Maya's eye region) */}
            {enableGazeTracking && (size === 'hero' || size === 'circle' || size === 'lg') && (
              <div 
                className="absolute inset-0 pointer-events-none z-10 maya-eye-blink-layer"
                style={{
                  transform: `translate(${pupilCatchlightX}px, ${pupilCatchlightY}px)`,
                  transition: 'transform 0.1s ease-out',
                }}
              >
                {/* Left Eye Specular Reflection */}
                <div 
                  className="absolute top-[32%] left-[45%] w-2 h-2 rounded-full bg-cyan-200/40 blur-[1px] maya-gaze-catchlight"
                  style={{
                    boxShadow: `0 0 6px ${auraColor}aa`,
                  }}
                />
                {/* Right Eye Specular Reflection */}
                <div 
                  className="absolute top-[32%] right-[44%] w-2 h-2 rounded-full bg-cyan-200/40 blur-[1px] maya-gaze-catchlight"
                  style={{
                    boxShadow: `0 0 6px ${auraColor}aa`,
                  }}
                />
              </div>
            )}

            {/* Avatar Portrait with Eye-Gaze Parallax Shift, Breathing & Cinematic Camera Zoom Focus */}
            <img
              src={displayImage}
              alt={`${alt} - ${currentOutfit.name}`}
              className={`w-full h-full object-cover object-top will-change-transform ${
                shouldBreathe ? 'maya-breathing-idle' : ''
              }`}
              style={{
                transform: enableGazeTracking 
                  ? `translate(${gazeShiftX}px, ${gazeShiftY}px) translateY(${camZoomOffsetY}%) scale(${1.025 * camZoomScale})` 
                  : `translateY(${camZoomOffsetY}%) scale(${camZoomScale})`,
                transformOrigin: '50% 25%',
                transition: 'transform 0.85s cubic-bezier(0.16, 1, 0.3, 1), filter 0.8s ease',
              }}
              loading="eager"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Futuristic Holographic Scanline Sweep on Outfit Change */}
      <AnimatePresence>
        {isTransitioningOutfit && (
          <motion.div
            key={`scanline-${transitionKey}`}
            initial={{ top: '-15%', opacity: 0 }}
            animate={{ 
              top: ['-10%', '110%'], 
              opacity: [0, 1, 1, 0] 
            }}
            transition={{ duration: 0.75, ease: 'easeInOut' }}
            className="absolute inset-x-0 h-16 pointer-events-none z-30"
            style={{
              background: `linear-gradient(to bottom, transparent, ${auraColor}88, #ffffff, ${auraColor}88, transparent)`,
              boxShadow: `0 0 25px ${auraColor}`,
            }}
          />
        )}
      </AnimatePresence>

      {/* Gentle Bottom Dark Vignette Gradient */}
      <div className="absolute inset-0 bg-gradient-to-t from-[var(--bg-base)] via-black/20 to-black/20 pointer-events-none" />

      {/* Floating Outfit Materialized Notification on Change */}
      <AnimatePresence>
        {isTransitioningOutfit && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.9 }}
            transition={{ duration: 0.35 }}
            className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-40 bg-black/85 backdrop-blur-md px-4 py-2 rounded-2xl border flex items-center gap-2 shadow-2xl pointer-events-none"
            style={{
              borderColor: auraColor,
              boxShadow: `0 0 25px ${auraColor}66`,
            }}
          >
            <Sparkles size={14} style={{ color: auraColor }} className="animate-spin" />
            <div className="text-center">
              <span className="text-[10px] font-mono uppercase tracking-wider block text-gray-300">
                पोशाक बदली गई (Outfit Changed)
              </span>
              <span className="text-xs font-bold text-white block">
                {currentOutfit.hindiName}
              </span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Top Floating Badge (Optional) */}
      {showBadge && size === 'hero' && (
        <div className="absolute top-4 right-4 z-10 pointer-events-none">
          <motion.div 
            key={`badge-${currentOutfit.id}`}
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="backdrop-blur-md px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-1.5 text-white"
            style={{
              backgroundColor: 'rgba(10, 15, 30, 0.85)',
              borderColor: 'var(--accent-primary)',
              boxShadow: '0 0 15px rgba(0, 255, 255, 0.2)',
            }}
          >
            <Shirt size={12} style={{ color: 'var(--accent-primary)' }} />
            <span>{currentOutfit.hindiName}</span>
          </motion.div>
        </div>
      )}

      {/* Custom Children Overlays */}
      {children}
    </div>
  );
};
