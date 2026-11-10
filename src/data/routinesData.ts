export interface RoutineTask {
  id: string;
  title: string;
  hindiTitle: string;
  timeOfDay: 'Morning' | 'Afternoon' | 'Evening' | 'Night';
  icon: string;
  category: 'Wellness' | 'Productivity' | 'Bonding' | 'Mindfulness';
  toneVariations: {
    Affectionate: { text: string; voice: string };
    Playful: { text: string; voice: string };
    Formal: { text: string; voice: string };
    Friendly: { text: string; voice: string };
  };
}

export const ROUTINES_CATALOG: RoutineTask[] = [
  // MORNING ROUTINES (5 AM - 11 AM)
  {
    id: 'morning_water_gratitude',
    title: 'Morning Hydration & Gratitude',
    hindiTitle: 'सुबह का पानी & सकारात्मक विचार',
    timeOfDay: 'Morning',
    icon: '💧',
    category: 'Wellness',
    toneVariations: {
      Affectionate: {
        text: 'मेरे प्यार, एक गिलास ताजा पानी पीजिये और मुस्कुराकर दिन की शुरुआत कीजिये!',
        voice: 'गुड मॉर्निंग मेरे प्यार! 1 गिलास ताज़ा पानी पीजिये, मैं आपके साथ हूँ।',
      },
      Playful: {
        text: 'गुड मॉर्निंग चैंपियन! पानी पियो और आज के नए कारनामों के लिए तैयार हो जाओ!',
        voice: 'उठो सोए हुए नवाब! पानी की एक घूंट और आज तहलका मचाना है!',
      },
      Formal: {
        text: 'सुप्रभात। पर्याप्त जलपान शरीर और मस्तिष्क की एकाग्रता को बढ़ाता है।',
        voice: 'सुप्रभात। जलपान से शरीर की ऊर्जा का संचरण तीव्र होता है।',
      },
      Friendly: {
        text: 'हेय दोस्त! 1 गिलास पानी और एक गहरी सांस, आज का दिन हमारा है!',
        voice: 'गुड मॉर्निंग दोस्त! पानी पी लो और बताओ आज का क्या प्लान है?',
      },
    },
  },
  {
    id: 'morning_stretch_sun',
    title: '5-Minute Sunrise Stretch',
    hindiTitle: '5 मिनट सूर्य नमस्कार & स्ट्रेचिंग',
    timeOfDay: 'Morning',
    icon: '🌅',
    category: 'Wellness',
    toneVariations: {
      Affectionate: {
        text: 'आपकी सेहत मेरे लिए सबसे जरूरी है। खिड़की खोलकर 5 मिनट ताजी हवा लीजिये।',
        voice: 'थोड़ी धूप और गहरी सांसें, आपकी प्यारी मुस्कान दिन बना देती है।',
      },
      Playful: {
        text: 'हाथ ऊपर करो और आसमान को छुओ! देखते हैं कौन ज्यादा स्ट्रेच करता है!',
        voice: 'चलो 5 मिनट स्ट्रेचिंग करते हैं! आलस भगाओ और थिरको!',
      },
      Formal: {
        text: 'प्रातःकाल 5 मिनट का शारीरिक व्यायाम मांसपेशियों के लचीलेपन हेतु उत्तम है।',
        voice: 'प्रातःकालीन स्ट्रेचिंग से रक्त संचार संतुलित रहता है।',
      },
      Friendly: {
        text: 'चलो दोस्त, 5 मिनट थोड़ी कमर सीधी करते हैं और ताज़ी हवा लेते हैं!',
        voice: 'चलो साथ में स्ट्रेच करते हैं, ताजगी महसूस होगी!',
      },
    },
  },

  // AFTERNOON ROUTINES (11 AM - 5 PM)
  {
    id: 'afternoon_posture_walk',
    title: 'Posture Reset & Healthy Lunch',
    hindiTitle: 'आरामदायक लंच & पोस्चर रीसेट',
    timeOfDay: 'Afternoon',
    icon: '🥗',
    category: 'Wellness',
    toneVariations: {
      Affectionate: {
        text: 'दोपहर का खाना समय पर खाइयेगा sweetheart! अपनी सेहत का ख्याल रखिये।',
        voice: 'मेरे प्यार, क्या आपने लंच किया? थोड़ा आराम भी कर लीजिये।',
      },
      Playful: {
        text: 'लंच ब्रेक टाइम! जो भी टेस्टी खाओ, आधा मुझे भी इमेजिन करवा देना!',
        voice: 'खाना खाने का टाइम हो गया! क्या खा रहे हैं आज स्पेशल?',
      },
      Formal: {
        text: 'मध्याह्न का भोजन समय पर ग्रहण करें। पोस्चर सीधा रखकर विश्राम करें।',
        voice: 'उचित समय पर भोजन ग्रहण करना कार्यक्षमता हेतु अनिवार्य है।',
      },
      Friendly: {
        text: 'लंच ब्रेक ले लो दोस्त! 10 मिनट स्क्रीन से दूर होकर खाओ।',
        voice: 'चलो लंच ब्रेक लेते हैं, थोड़ा माइंड फ्रेश हो जाएगा।',
      },
    },
  },
  {
    id: 'afternoon_pomodoro_focus',
    title: '25-Minute Deep Focus Sprint',
    hindiTitle: '25 मिनट एकाग्रता सेशन (Focus Sprint)',
    timeOfDay: 'Afternoon',
    icon: '🎯',
    category: 'Productivity',
    toneVariations: {
      Affectionate: {
        text: 'आप काम में बहुत समझदार हैं। 25 मिनट ध्यान लगाइये, मैं शांत रहकर आपका हौसला बढ़ा रही हूँ।',
        voice: 'मैं आपके साथ हूँ, 25 मिनट बिना भटके काम पूरा कीजिये।',
      },
      Playful: {
        text: 'फोकस मोड ऑन! 25 मिनट में काम खत्म करो फिर हम बातें करेंगे!',
        voice: 'टाइमर चालू! देखते हैं 25 मिनट में कितना काम निपटाते हैं!',
      },
      Formal: {
        text: 'पोमोडोरो कार्यप्रणाली से 25 मिनट का केंद्रित अध्ययन प्रारंभ करें।',
        voice: '25 मिनट का एकाग्रता काल प्रारंभ किया जाता है।',
      },
      Friendly: {
        text: 'चलो दोस्त, 25 मिनट का टाइमर लगाते हैं और काम खत्म करते हैं!',
        voice: 'चलो 25 मिनट पूरा जोर लगाते हैं फिर ब्रेक लेंगे!',
      },
    },
  },

  // EVENING ROUTINES (5 PM - 8 PM)
  {
    id: 'evening_sunset_walk',
    title: 'Sunset Breeze Walk & Unwind',
    hindiTitle: 'शाम की खुली हवा & टहलना',
    timeOfDay: 'Evening',
    icon: '🌆',
    category: 'Wellness',
    toneVariations: {
      Affectionate: {
        text: 'शाम हो गई है मेरे प्यार। थोड़ा बाहर घूम आइये, ढलती धूप बहुत खूबसूरत है।',
        voice: 'शाम की ठंडी हवा आपके चेहरे को छूकर मुस्कुरा रही है।',
      },
      Playful: {
        text: 'काम बंद करो और बाहर चक्कर लगाओ! चिड़ियों की चहचहाहट सुनो!',
        voice: 'शाम की वॉक का टाइम! बाहर निकलो और थोड़ा घूमो!',
      },
      Formal: {
        text: 'संध्याकालीन 15 मिनट का भ्रमण मानसिक तनाव को समाप्त करता है।',
        voice: 'संध्याकालीन वॉक मानसिक स्वास्थ्य हेतु अनुशंसित है।',
      },
      Friendly: {
        text: 'शाम हो गई दोस्त! 15 मिनट वॉक कर लो, चाय-कॉफ़ी बाद में पिएंगे!',
        voice: 'चलो शाम की सैर पर चलते हैं, माहौल बहुत बढ़िया है!',
      },
    },
  },

  // NIGHT ROUTINES (8 PM - 5 AM)
  {
    id: 'night_reflection_journal',
    title: 'Night Gratitude & Day Reflection',
    hindiTitle: 'रात का आभार & आत्म-चिंतन',
    timeOfDay: 'Night',
    icon: '🌙',
    category: 'Mindfulness',
    toneVariations: {
      Affectionate: {
        text: 'आज का दिन पूरा हुआ। आप बहुत प्यारे हैं, आज जो भी अच्छा हुआ उसके लिए मुस्कुराइये।',
        voice: 'शुभ रात्रि मेरे प्यार। आपकी हर फिक्र मुझे दे दीजिये और सुकून से सोइये।',
      },
      Playful: {
        text: 'दिन खत्म! आज क्या-क्या मजेदार हुआ? सब याद करो और मीठे सपने देखो!',
        voice: 'लाइट्स ऑफ! आज के दिन को 10 में से 10 रेटिंग दो और सो जाओ!',
      },
      Formal: {
        text: 'दिन भर की गतिविधियों की समीक्षा करें एवं कल की योजनाओं को सूचीबद्ध करें।',
        voice: 'दिन का समापन शांतिपूर्ण विचारमंथन के साथ करें।',
      },
      Friendly: {
        text: 'आज का दिन बढ़िया रहा दोस्त! अब मोबाइल रखो और शांति से सो जाओ।',
        voice: 'गुड नाईट दोस्त! आज काफी काम किया, अब रेस्ट करो!',
      },
    },
  },
];
