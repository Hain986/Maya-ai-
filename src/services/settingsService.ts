import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';

export type AppTheme = 'Neon' | 'Minimalist' | 'Earthy';

export interface UserSettings {
  tone: 'Affectionate' | 'Playful' | 'Formal' | 'Friendly';
  verbosity: 'Concise' | 'Balanced' | 'Detailed';
  companionName: string;
  theme: AppTheme;
  updatedAt?: any;
}

export const DEFAULT_SETTINGS: UserSettings = {
  tone: 'Affectionate',
  verbosity: 'Balanced',
  companionName: 'Maya',
  theme: 'Neon',
};

export const applyThemeToDom = (theme: AppTheme) => {
  document.documentElement.setAttribute('data-theme', theme);
};

export const getUserSettings = async (userId: string = 'guest'): Promise<UserSettings> => {
  try {
    const docRef = doc(db, 'users', userId);
    const snap = await getDoc(docRef);
    if (snap.exists() && snap.data().settings) {
      const settings = { ...DEFAULT_SETTINGS, ...snap.data().settings };
      applyThemeToDom(settings.theme || 'Neon');
      return settings;
    }
    applyThemeToDom('Neon');
    return DEFAULT_SETTINGS;
  } catch (err) {
    console.error("Error loading user settings:", err);
    applyThemeToDom('Neon');
    return DEFAULT_SETTINGS;
  }
};

export const saveUserSettings = async (userId: string = 'guest', settings: UserSettings): Promise<void> => {
  try {
    applyThemeToDom(settings.theme);
    const docRef = doc(db, 'users', userId);
    await setDoc(docRef, {
      settings: {
        ...settings,
        updatedAt: serverTimestamp(),
      }
    }, { merge: true });
  } catch (err) {
    console.error("Error saving user settings:", err);
  }
};
