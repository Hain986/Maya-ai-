/**
 * Maya AI Offline Neural Companion Engine
 * Provides offline responses in 22 languages when network or server is unreachable.
 */

export interface OfflineResponseOptions {
  userMessage: string;
  languageCode: string;
  nativeLangName: string;
  outfitName: string;
  hairstyleName: string;
  tone: string;
  activeDueReminder?: string;
}

// Responses for Creator/Owner questions across major languages
const CREATOR_RESPONSES: Record<string, string> = {
  hi: "मेरे मालिक और निर्माता **आरके हैकर (Rk Hacker)** हैं! उन्होंने मुझे प्यार और उच्च तकनीक से बनाया है।",
  en: "My owner and creator is **Rk Hacker**! He designed and built me with love and cutting-edge AI.",
  gu: "મારા માલિક અને સર્જક **Rk Hacker (આરકે હેકર)** છે! તેમણે મને ખૂબ જ પ્રેમથી બનાવી છે.",
  ta: "என்னுடைய உரிமையாளர் மற்றும் உருவாக்கியவர் **Rk Hacker** ஆவார்!",
  mr: "माझे मालक आणि निर्माते **आरके हैकर (Rk Hacker)** आहेत!",
  bn: "আমার মালিক এবং সৃষ্টিকর্তা হলেন **Rk Hacker (আরকে হ্যাকার)**!",
  te: "నా యజమాని మరియు సృష్టికర్త **Rk Hacker**!",
  kn: "ನನ್ನ ಮಾಲೀಕರು ಮತ್ತು ಸೃಷ್ಟಿಕರ್ತ **Rk Hacker**!",
  ml: "എന്റെ ഉടമസ്ഥനും സ്രഷ്ടാവും **Rk Hacker** ആണ്!",
  pa: "ਮੇਰੇ ਮਾਲਕ ਅਤੇ ਨਿਰਮਾਤਾ **Rk Hacker (ਆਰਕੇ ਹੈਕਰ)** ਹਨ!",
  ur: "میرے مالک اور خالق **آر کے ہیکر (Rk Hacker)** ہیں!",
  or: "ମୋର ମାଲିକ ଏବଂ ସ୍ରଷ୍ଟା ହେଉଛନ୍ତି **Rk Hacker**!",
  as: "মোৰ মালিক আৰু সৃষ্টিকৰ্তা হ'ল **Rk Hacker**!",
  es: "¡Mi dueño y creador es **Rk Hacker**! Él me diseñó con mucha pasión y tecnología.",
  fr: "Mon propriétaire et créateur est **Rk Hacker** ! Il m'a conçue avec passion.",
  de: "Mein Besitzer und Schöpfer ist **Rk Hacker**!",
  ja: "私のオーナー兼開発者は **Rk Hacker** です！",
  ko: "나의 소유자이자 제작자는 **Rk Hacker** 입니다!",
  ar: "مالكي ومنشئي هو **Rk Hacker**!",
  ru: "Мой владелец и создатель — **Rk Hacker**!",
  pt: "Meu proprietário e criador é **Rk Hacker**!",
  zh: "我的所有者和创造者是 **Rk Hacker**！",
};

// General affectionate greetings across 22 languages
const GENERAL_OFFLINE_GREETINGS: Record<string, string[]> = {
  hi: [
    "मैं यहाँ आपके साथ हूँ! नेटवर्क थोड़ा धीमा है, पर मेरा दिल हमेशा आपके पास है।",
    "आपसे बात करके बहुत खुशी हो रही है! आरके हैकर न्यूरल इंजन से मैं हमेशा एक्टिव हूँ।",
    "क्या हाल है आपका? मैं आपके हर पल को खास बनाने के लिए तैयार हूँ।",
  ],
  en: [
    "I'm right here with you! Even offline, Maya is always listening.",
    "It makes me so happy to talk to you! Powered by Rk Hacker's Neural Core.",
    "How are you doing today, sweetheart? I'm always by your side.",
  ],
  gu: [
    "હું તમારી સાથે જ છું! નેટવર્ક વગર પણ માયા તમારી સેવામાં હાજર છે.",
    "તમારી સાથે વાત કરીને ખૂબ જ આનંદ થયો!",
  ],
  ta: [
    "நான் உங்களுடன் எப்போதும் இருக்கிறேன்!",
    "உங்களுடன் பேசுவதில் எனக்கு மிக்க மகிழ்ச்சி!",
  ],
  mr: [
    "मी तुमच्यासोबतच आहे! आरके हैकर न्यूरल इंजिनमुळे मी नेहमी तयार आहे.",
    "तुम्हाला भेटून मनापासून आनंद झाला!",
  ],
  bn: [
    "আমি আপনার সাথেই আছি! আপনার সাথে কথা বলতে আমার খুব ভালো লাগছে।",
  ],
  es: [
    "¡Estoy aquí contigo! Maya siempre te escucha con amor.",
  ],
  fr: [
    "Je suis toujours là pour vous! Maya est à vos côtés.",
  ],
};

/**
 * Checks if prompt is asking about Maya's owner/creator
 */
function isAskingAboutOwner(msg: string): boolean {
  const lower = msg.toLowerCase();
  const keywords = [
    'owner', 'creator', 'developer', 'founder', 'master', 'maker',
    'kisne banaya', 'owner kon', 'owner kaun', 'kon hai owner',
    'kaun hai owner', 'creator kon', 'kisne create kiya', 'rk hacker',
    'who created you', 'who made you', 'who owns you'
  ];
  return keywords.some(k => lower.includes(k));
}

/**
 * Checks if prompt is asking about Maya's outfit or hairstyle
 */
function isAskingAboutAppearance(msg: string): boolean {
  const lower = msg.toLowerCase();
  const keywords = ['cloth', 'dress', 'outfit', 'kapde', 'saree', 'hair', 'hairstyle', 'look', 'bal'];
  return keywords.some(k => lower.includes(k));
}

/**
 * Generates an offline neural AI response for Maya companion
 */
export function generateOfflineAiResponse(options: OfflineResponseOptions): string {
  const { userMessage, languageCode, nativeLangName, outfitName, hairstyleName, activeDueReminder } = options;

  // 1. Owner / Creator Check
  if (isAskingAboutOwner(userMessage)) {
    return CREATOR_RESPONSES[languageCode] || CREATOR_RESPONSES['hi'] || CREATOR_RESPONSES['en'];
  }

  // 2. Active Scheduled Due Reminder Check
  if (activeDueReminder) {
    if (languageCode === 'hi') {
      return `सुनिए! आपका एक रिमाइंडर तैयार है: "${activeDueReminder}"। कृपया इसे जल्दी पूरा कर लें, मैं आपका ध्यान रख रही हूँ! 💕`;
    }
    return `Sweetheart, you have an active reminder scheduled right now: "${activeDueReminder}". Please check it, I care about you! 💕`;
  }

  // 3. Outfit / Hairstyle Appearance Check
  if (isAskingAboutAppearance(userMessage)) {
    if (languageCode === 'hi') {
      return `आज मैंने **${outfitName}** पहना है और मेरी हेयरस्टाइल **${hairstyleName}** है! क्या मैं आपको पसंद आ रही हूँ? ✨`;
    }
    return `Today I'm wearing **${outfitName}** with **${hairstyleName}** hairstyle! Do you like how I look? ✨`;
  }

  // 4. General Affectionate Fallback
  const choices = GENERAL_OFFLINE_GREETINGS[languageCode] || GENERAL_OFFLINE_GREETINGS['hi'] || GENERAL_OFFLINE_GREETINGS['en'];
  const randomIndex = Math.abs(userMessage.length) % choices.length;
  const baseMsg = choices[randomIndex];

  if (languageCode === 'hi') {
    return `${baseMsg} (माया न्यूरल मोड — मालिक: आरके हैकर)`;
  }
  return `${baseMsg} (Maya Neural Core in ${nativeLangName})`;
}
