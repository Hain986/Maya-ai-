import { Outlet, Link, useLocation } from 'react-router-dom';
import { Home, MessageCircle, Mic, User, Settings, HeartHandshake } from 'lucide-react';
import { MayaAvatar3D } from './MayaAvatar3D';
import { DynamicBackground } from './DynamicBackground';
import { OfflineIndicator } from './OfflineIndicator';
import { PWAInstallButton } from './PWAInstallButton';
import { useAvatar } from '../context/AvatarContext';
import { useEmotion } from '../context/EmotionContext';
import { AutoReconnectBanner } from './AutoReconnectBanner';

export const Layout = () => {
  const location = useLocation();
  const { avatar, outfitId, transitionKey } = useAvatar();
  const { emotion } = useEmotion();

  const navItems = [
    { path: '/', icon: Home, label: 'Home' },
    { path: '/chat', icon: MessageCircle, label: 'Chat' },
    { path: '/voice', icon: Mic, label: 'Voice' },
    { path: '/activities', icon: HeartHandshake, label: 'Dates' },
    { path: '/avatar', icon: User, label: 'Studio' },
    { path: '/settings', icon: Settings, label: 'Settings' },
  ];

  return (
    <div 
      className="min-h-screen text-white flex flex-col relative transition-colors duration-500 overflow-x-hidden"
      style={{ backgroundColor: 'var(--bg-base)' }}
    >
      {/* Dynamic Background System */}
      <DynamicBackground />

      {/* Auto Reconnect & Server Connection Status Banner */}
      <div className="z-30 relative w-full max-w-md mx-auto">
        <AutoReconnectBanner />
      </div>

      {/* Offline Connectivity Toast Indicator */}
      <OfflineIndicator />

      {/* 3D Scene Overlay reacting in real-time to emotional sentiment & avatar selection */}
      <div className="absolute inset-0 z-0 pointer-events-none opacity-40">
        <div className="w-full h-full flex items-center justify-center">
          <MayaAvatar3D 
            color={emotion.threeColor || avatar.color} 
            shape={avatar.shape} 
            animationState={emotion.animationState}
            outfitId={outfitId}
            fadeKey={transitionKey}
          />
        </div>
      </div>

      {/* Top Header Bar with PWA Install Prompt Button */}
      <header className="w-full max-w-md mx-auto p-2 pt-3 flex justify-end z-20 pointer-events-auto">
        <PWAInstallButton />
      </header>
      
      <main className="flex-grow p-4 z-10 relative">
        <Outlet />
      </main>

      <nav 
        className="fixed bottom-0 left-0 right-0 z-20 backdrop-blur-xl border-t flex justify-around p-1.5 transition-all duration-500 max-w-md mx-auto"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
          boxShadow: '0 -5px 25px rgba(0, 0, 0, 0.4)'
        }}
      >
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 p-1.5 rounded-xl transition ${
                isActive ? 'font-bold' : 'text-gray-400 hover:text-gray-200'
              }`}
              style={{
                color: isActive ? 'var(--accent-primary)' : undefined,
                backgroundColor: isActive ? 'rgba(255, 255, 255, 0.05)' : 'transparent',
              }}
            >
              <Icon size={18} />
              <span className="text-[10px] font-semibold">{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
};
