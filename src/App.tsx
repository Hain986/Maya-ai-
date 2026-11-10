/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { FirebaseProvider } from './context/FirebaseProvider';
import { AvatarProvider } from './context/AvatarContext';
import { EmotionProvider } from './context/EmotionContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { Chat, Voice, Settings } from './pages/Pages';
import { AvatarSelection } from './pages/AvatarSelection';
import { Activities } from './pages/Activities';
import { VoiceAuthModal } from './components/VoiceAuthModal';
import { getUserSettings, applyThemeToDom } from './services/settingsService';

export default function App() {
  const [authenticated, setAuthenticated] = useState(false);

  useEffect(() => {
    // Initialize saved theme from Firestore on boot
    getUserSettings('guest').then((settings) => {
      if (settings?.theme) {
        applyThemeToDom(settings.theme);
      }
    });
  }, []);

  return (
    <FirebaseProvider>
      <AvatarProvider>
        <EmotionProvider>
          {!authenticated && (
            <VoiceAuthModal onAuthenticated={() => setAuthenticated(true)} />
          )}
          <BrowserRouter>
            <Routes>
              <Route element={<Layout />}>
                <Route path="/" element={<Home />} />
                <Route path="/chat" element={<Chat />} />
                <Route path="/voice" element={<Voice />} />
                <Route path="/activities" element={<Activities />} />
                <Route path="/avatar" element={<AvatarSelection />} />
                <Route path="/settings" element={<Settings />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </EmotionProvider>
      </AvatarProvider>
    </FirebaseProvider>
  );
}
