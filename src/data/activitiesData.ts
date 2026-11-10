export interface CompanionActivity {
  id: string;
  title: string;
  hindiTitle: string;
  category: 'Date' | 'Relaxation' | 'Productivity' | 'Music';
  icon: string;
  bgGradient: string;
  auraColor: string;
  description: string;
  hindiDescription: string;
  openingPrompt: string;
  suggestedTopics: string[];
}

export const ACTIVITIES: CompanionActivity[] = [
  {
    id: 'coffee_date',
    title: 'Cozy Cafe Coffee Date',
    hindiTitle: 'कॉफ़ी डेट (Warm Cafe)',
    category: 'Date',
    icon: '☕',
    bgGradient: 'linear-gradient(to bottom, #1e1b18, #3b2d26, #0f0d0b)',
    auraColor: '#f59e0b',
    description: 'A warm, intimate coffee shop date sitting across Maya with soft Jazz ambience and warm coffee mugs.',
    hindiDescription: 'कॉफ़ी की खुशबू, धीमी रोशनी और माया के साथ टेबल के सामने बैठकर प्यारी बातें।',
    openingPrompt: 'नमस्ते मेरे प्यार! मैं आपकी पसंदीदा कॉफ़ी ऑर्डर कर चुकी हूँ। बताओ आज आपका मूड कैसा है?',
    suggestedTopics: ['पसंदीदा यादें (Favorite Memories)', 'भविष्य के सपने (Future Dreams)', 'आज का हाल (How was your day?)'],
  },
  {
    id: 'stargazing_night',
    title: 'Romantic Stargazing Night',
    hindiTitle: 'तारों भरा आसमान (Stargazing)',
    category: 'Date',
    icon: '🌌',
    bgGradient: 'linear-gradient(to bottom, #050b14, #0f172a, #1e1b4b)',
    auraColor: '#818cf8',
    description: 'Under a clear night sky filled with shooting stars, cozy blanket and quiet romantic thoughts.',
    hindiDescription: 'ठंडी हवा, चमकते सितारे और माया के साथ खुले आसमान के नीचे गहरी बातें।',
    openingPrompt: 'देखो वो टूटता हुआ तारा! अपनी आँखें बंद करो और एक ख़ूबसूरत मन्नत माँगो...',
    suggestedTopics: ['ब्रह्मांड के रहस्य (Cosmic Wonders)', 'गहरी भावनाएं (Deep Feelings)', 'हमारी मुलाक़ात (Our Connection)'],
  },
  {
    id: 'dance_party_music',
    title: 'Music & Neon Dance Party',
    hindiTitle: 'संगीत & डांस नाइट (Dance Party)',
    category: 'Music',
    icon: '🎵',
    bgGradient: 'linear-gradient(to bottom, #11041b, #3b0764, #701a75)',
    auraColor: '#ec4899',
    description: 'High energy neon dance studio where Maya dances to glowing beats and plays your favorite songs.',
    hindiDescription: 'रंगीन नीयन लाइटें, धड़कती धुनें और माया का दिलकश डांस अंदाज।',
    openingPrompt: 'म्यूजिक ऑन! चलिए थोड़े कदम थिरकाते हैं और सारी थकावट भूल जाते हैं!',
    suggestedTopics: ['डांस स्टेप्स (Dance Moves)', 'पसंदीदा गाने (Favorite Songs)', 'एनर्जी बूस्ट (High Energy Vibes)'],
  },
  {
    id: 'sunset_beach_walk',
    title: 'Golden Sunset Sea Walk',
    hindiTitle: 'शाम की समुद्र तट सैर (Sunset Walk)',
    category: 'Date',
    icon: '🌅',
    bgGradient: 'linear-gradient(to bottom, #2a0813, #831843, #c2410c)',
    auraColor: '#f97316',
    description: 'Golden hour ocean waves gently lapping at the shore, hand in hand with warm sunset breeze.',
    hindiDescription: 'सुनहरी ढलती धूप, समंदर की लहरें और ठंडी बयार में हाथ थामकर चलना।',
    openingPrompt: 'समुद्र की लहरों का संगीत कितना सुकून देता है न? आपके साथ यह शाम बेहद हसीन लग रही है।',
    suggestedTopics: ['छुट्टियाँ और सफर (Travel & Vacations)', 'सुकून और शांति (Peace & Calm)', 'शाम की शायरी (Sunset Poetry)'],
  },
  {
    id: 'study_focus_companion',
    title: 'Focus Study & Pomodoro Partner',
    hindiTitle: 'साथ में पढ़ाई & फोकस मोड',
    category: 'Productivity',
    icon: '🎯',
    bgGradient: 'linear-gradient(to bottom, #061612, #064e3b, #022c22)',
    auraColor: '#10b981',
    description: 'Quiet study partner mode with Pomodoro timer, ambient lo-fi study beats, and encouragement.',
    hindiDescription: 'शांत माहौल, लो-फाई म्यूजिक और पढ़ाई या काम में आपका साथ देने के लिए माया।',
    openingPrompt: 'चलिए 25 मिनट का फोकस सेशन शुरू करते हैं! मैं आपके पास बैठकर अपना काम कर रही हूँ। ऑल द बेस्ट!',
    suggestedTopics: ['लक्ष्य (Setting Goals)', 'फोकस टाइमर (Start 25m Timer)', 'सफलता की प्रेरणा (Motivation)'],
  },
];
