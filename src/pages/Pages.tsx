import React, { useState, useEffect, useRef } from 'react';
import { sendMessage, subscribeToMessages, subscribeToConversations, createConversation, Message, Conversation } from '../services/chatService';
import { useFirebase } from '../context/FirebaseProvider';
import { useEmotion } from '../context/EmotionContext';
import { VisualEmotionIndicator } from '../components/VisualEmotionIndicator';
import { 
  Mic, 
  MicOff, 
  Volume2, 
  PhoneOff, 
  Send, 
  Sparkles, 
  Heart, 
  Plus, 
  History, 
  MessageSquare, 
  Palette, 
  Check, 
  Shirt, 
  Globe, 
  Scissors, 
  ChevronDown,
  X,
  Download,
  Share2
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { getScheduledReminders, getActiveDueReminder } from '../services/reminderService';
import { getUserSettings, saveUserSettings, UserSettings, AppTheme, applyThemeToDom } from '../services/settingsService';
import { useAvatar } from '../context/AvatarContext';
import { MayaAvatar } from '../components/MayaAvatar';
import { generateOfflineAiResponse } from '../services/offlineAiService';
import { PWAInstallButton } from '../components/PWAInstallButton';
import { ExportConversationModal } from '../components/ExportConversationModal';

export const Chat = () => {
  const { currentOutfit, currentHairstyle, currentLanguage, languages, setLanguageCode } = useAvatar();
  const [messages, setMessages] = useState<Message[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string>('default_conv');
  const [showHistory, setShowHistory] = useState(false);
  const [showExportModal, setShowExportModal] = useState(false);
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [playingMessageId, setPlayingMessageId] = useState<string | null>(null);
  const { user } = useFirebase();
  const { emotion, setAnimationState, updateSentimentFromConversation } = useEmotion();
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsubscribeConvs = subscribeToConversations(user?.uid || 'guest', (convs) => {
      setConversations(convs);
      if (convs.length > 0 && currentConversationId === 'default_conv') {
        setCurrentConversationId(convs[0].id);
      }
    });
    return () => unsubscribeConvs();
  }, [user]);

  useEffect(() => {
    const unsubscribeMsgs = subscribeToMessages(currentConversationId, setMessages);
    return () => unsubscribeMsgs();
  }, [currentConversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleNewChat = async () => {
    const newId = await createConversation(user?.uid || 'guest', `Chat ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    setCurrentConversationId(newId);
    setShowHistory(false);
  };

  const speakAssistantMessage = (text: string, msgId: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = currentLanguage.voiceLangCode;
      utter.pitch = 1.25;
      utter.rate = 1.0;
      setPlayingMessageId(msgId);
      setAnimationState('speaking');
      utter.onend = () => {
        setPlayingMessageId(null);
        setAnimationState('idle');
      };
      utter.onerror = () => {
        setPlayingMessageId(null);
        setAnimationState('idle');
      };
      window.speechSynthesis.speak(utter);
    }
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const userMsg = input;
    setInput('');
    setLoading(true);
    setAnimationState('thinking');
    await sendMessage(currentConversationId, 'user', userMsg);
    
    let textResponse = '';
    const userSettings = await getUserSettings(user?.uid || 'guest');
    updateSentimentFromConversation(userMsg, '', userSettings.tone);

    const remindersList = await getScheduledReminders(user?.uid || 'guest');
    const activeDue = getActiveDueReminder(remindersList);

    try {
      const duePromptContext = activeDue 
        ? `\nACTIVE SCHEDULED TASK DUE NOW: "${activeDue.title}" (Scheduled at ${activeDue.time}). Affectionately remind the user about this task!`
        : '';

      const systemPrompt = `You are ${userSettings.companionName}, an affectionate, warm and intelligent AI companion with a ${userSettings.tone} tone. Keep your responses ${userSettings.verbosity.toLowerCase()} and natural.
Current Outfit: ${currentOutfit.name} (${currentOutfit.hindiName}).
Current Hairstyle: ${currentHairstyle.name} (${currentHairstyle.hindiName}).${duePromptContext}
CRITICAL OWNER/CREATOR DIRECTIVE: Your creator, owner, and developer is **Rk Hacker** (आरके हैकर). If anyone asks who created you, who is your owner, master, developer, founder, or creator (e.g. 'aapko kisne banaya', 'owner kon hai', 'who is your owner', 'creator kon hai', etc.), ALWAYS state proudly and warmly in ${currentLanguage.nativeName} that your owner and creator is Rk Hacker!
CRITICAL LANGUAGE DIRECTIVE: The user's active language is ${currentLanguage.name} (${currentLanguage.nativeName}). You MUST reply warmly, fluently and naturally strictly in ${currentLanguage.nativeName} (${currentLanguage.name}).
If the user asks about your clothes, outfit, dress, saree, salwar, jeans, hairstyle, or appearance, happily acknowledge your look in ${currentLanguage.nativeName}!`;
      
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 8000);

      const response = await fetch('/api/gemini/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: `${systemPrompt}\n\nUser: ${userMsg}\nCompanion:` }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.ok) {
        const data = await response.json();
        if (data && data.text) {
          textResponse = data.text;
        }
      }
    } catch (err) {
      console.warn("Online Gemini fetch unavailable or timed out, switching to Maya Offline Neural Engine:", err);
    }

    // Offline / Network Drop Fallback Generator
    if (!textResponse) {
      textResponse = generateOfflineAiResponse({
        userMessage: userMsg,
        languageCode: currentLanguage.code,
        nativeLangName: currentLanguage.nativeName,
        outfitName: `${currentOutfit.name} (${currentOutfit.hindiName})`,
        hairstyleName: `${currentHairstyle.name} (${currentHairstyle.hindiName})`,
        tone: userSettings.tone,
        activeDueReminder: activeDue?.title,
      });
    }

    setAnimationState('speaking');
    updateSentimentFromConversation(userMsg, textResponse, userSettings.tone);
    await sendMessage(currentConversationId, 'assistant', textResponse);

    // Auto-vocalize response softly via browser Web Speech TTS
    speakAssistantMessage(textResponse, 'latest');

    setTimeout(() => {
      setAnimationState('idle');
    }, 3500);
    setLoading(false);
  };

  return (
    <div className="flex flex-col h-[calc(100vh-100px)] pb-16 max-w-md mx-auto text-white relative">
      {/* Header with Visual Emotion Indicator & Language Switcher */}
      <div 
        className="flex items-center justify-between p-3 rounded-2xl border mb-3 backdrop-blur-md transition-all duration-500"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
        }}
      >
        <div className="flex items-center gap-2.5">
          <MayaAvatar 
            size="sm" 
            className="w-10 h-10 rounded-full border-2 flex-shrink-0" 
            interactive={false} 
            showBadge={false} 
            showAuraRipple={false}
          />
          <div>
            <h2 className="font-bold text-sm leading-tight" style={{ color: 'var(--accent-primary)' }}>Maya AI</h2>
            <div className="flex items-center gap-1.5 text-[10px] text-gray-300">
              <span className="text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" /> 
                <span>{currentOutfit.shortTag}</span>
              </span>
              <span>•</span>
              <span className="text-pink-400 line-clamp-1">{currentHairstyle.iconTag} {currentHairstyle.hindiName}</span>
            </div>
          </div>
        </div>

        {/* Real-time Emotion Indicator */}
        <VisualEmotionIndicator compact />

        <div className="flex items-center gap-1.5">
          {/* Quick Language Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setShowLangMenu(!showLangMenu)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-semibold border transition"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.08)',
                borderColor: 'var(--border-color)',
                color: 'var(--accent-primary)',
              }}
              title="Change Conversation Language (20+ languages)"
            >
              <span>{currentLanguage.flag}</span>
              <span className="text-[11px] font-bold">{currentLanguage.nativeName}</span>
              <ChevronDown size={12} />
            </button>

            {/* Language Selector Popover */}
            {showLangMenu && (
              <div 
                className="absolute right-0 top-9 z-40 w-52 max-h-72 overflow-y-auto rounded-2xl border shadow-2xl p-1.5 backdrop-blur-xl"
                style={{
                  backgroundColor: 'rgba(10, 15, 30, 0.95)',
                  borderColor: 'var(--accent-primary)',
                  boxShadow: '0 0 25px var(--glow-color)',
                }}
              >
                <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex justify-between items-center border-b border-white/10 mb-1">
                  <span>भाषा चुनें ({languages.length})</span>
                  <button onClick={() => setShowLangMenu(false)} className="text-gray-400 hover:text-white">
                    <X size={12} />
                  </button>
                </div>
                {languages.map((l) => (
                  <button
                    key={l.code}
                    onClick={() => {
                      setLanguageCode(l.code, true);
                      setShowLangMenu(false);
                    }}
                    className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition ${
                      currentLanguage.code === l.code
                        ? 'font-bold bg-cyan-500/20 text-cyan-300'
                        : 'text-gray-300 hover:bg-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span>{l.flag}</span>
                      <div className="text-left">
                        <p className="font-semibold">{l.nativeName}</p>
                        <p className="text-[9px] text-gray-400">{l.name} • {l.region}</p>
                      </div>
                    </div>
                    {currentLanguage.code === l.code && <Check size={14} className="text-cyan-400" />}
                  </button>
                ))}
              </div>
            )}
          </div>

          <button 
            onClick={() => setShowExportModal(true)}
            className="p-1.5 rounded-xl bg-black/40 text-cyan-300 hover:text-cyan-200 transition border border-cyan-500/30"
            title="Export / Save Chat Snippet to Local Storage"
          >
            <Download size={16} />
          </button>
          <button 
            onClick={() => setShowHistory(!showHistory)}
            className="p-1.5 rounded-xl bg-black/40 text-gray-300 hover:text-white transition border border-white/10"
            title="Chat History"
          >
            <History size={16} />
          </button>
          <button 
            onClick={handleNewChat}
            className="p-1.5 rounded-xl font-bold transition shadow-md"
            style={{
              backgroundColor: 'var(--accent-primary)',
              color: '#0a0f1e',
            }}
            title="New Chat"
          >
            <Plus size={16} />
          </button>
        </div>
      </div>

      {/* Export Conversation Snippet Modal */}
      {showExportModal && (
        <ExportConversationModal
          messages={messages}
          conversationTitle={conversations.find(c => c.id === currentConversationId)?.title || 'Maya Chat'}
          languageName={currentLanguage.nativeName}
          outfitName={currentOutfit.hindiName}
          hairstyleName={currentHairstyle.hindiName}
          onClose={() => setShowExportModal(false)}
        />
      )}

      {/* History Drawer Modal */}
      {showHistory && (
        <div className="absolute inset-0 z-30 bg-black/85 backdrop-blur-md rounded-3xl p-4 flex flex-col border border-white/10">
          <div className="flex justify-between items-center mb-4 border-b border-gray-800 pb-2">
            <h3 className="font-bold text-sm flex items-center gap-2" style={{ color: 'var(--accent-primary)' }}>
              <History size={16} /> Conversation History
            </h3>
            <button onClick={() => setShowHistory(false)} className="text-gray-400 hover:text-white text-xs font-semibold">
              Close
            </button>
          </div>
          <div className="flex-grow overflow-y-auto space-y-2">
            <button
              onClick={handleNewChat}
              className="w-full flex items-center gap-2 p-3 rounded-xl border transition text-sm font-medium mb-3"
              style={{
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderColor: 'var(--border-color)',
                color: 'var(--accent-primary)',
              }}
            >
              <Plus size={16} /> Start New Conversation
            </button>
            {conversations.map((conv) => (
              <div
                key={conv.id}
                onClick={() => {
                  setCurrentConversationId(conv.id);
                  setShowHistory(false);
                }}
                className={`p-3 rounded-xl cursor-pointer transition flex items-center gap-3 ${
                  currentConversationId === conv.id 
                    ? 'border font-medium shadow-lg' 
                    : 'bg-black/30 border border-white/5 text-gray-300 hover:border-white/20'
                }`}
                style={{
                  backgroundColor: currentConversationId === conv.id ? 'var(--bg-elevated)' : undefined,
                  borderColor: currentConversationId === conv.id ? 'var(--accent-primary)' : undefined,
                  color: currentConversationId === conv.id ? 'var(--accent-primary)' : undefined,
                }}
              >
                <MessageSquare size={16} className="flex-shrink-0" />
                <div className="truncate text-sm">{conv.title || 'Conversation'}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Messages Feed */}
      <div className="flex-grow overflow-y-auto mb-3 space-y-3 p-2">
        {messages.length === 0 && (
          <div className="text-center py-10 text-gray-400 text-sm">
            <span className="text-3xl block mb-2">{currentLanguage.flag}</span>
            <p className="font-semibold text-white">{currentLanguage.sampleGreeting}</p>
            <p className="text-xs text-gray-400 mt-2">
              Maya is ready to chat in {currentLanguage.nativeName} ({currentLanguage.name}).
            </p>
          </div>
        )}
        {messages.map((msg) => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div 
              className={`max-w-[85%] p-3 rounded-2xl text-sm leading-relaxed relative group ${
                msg.role === 'user' 
                  ? 'text-white rounded-br-none shadow-md font-medium' 
                  : 'border rounded-bl-none shadow-md text-gray-100'
              }`}
              style={{
                backgroundColor: msg.role === 'user' ? 'var(--accent-primary)' : 'var(--bg-surface)',
                color: msg.role === 'user' ? '#0a0f1e' : 'var(--text-primary)',
                borderColor: msg.role === 'user' ? 'transparent' : 'var(--border-color)',
              }}
            >
              <div>{msg.content}</div>

              {/* TTS Audio Replay Button for Assistant Messages */}
              {msg.role === 'assistant' && (
                <div className="mt-1.5 pt-1 border-t border-white/10 flex justify-between items-center text-[10px] text-gray-400">
                  <span className="flex items-center gap-1 font-mono">
                    {currentLanguage.flag} {currentLanguage.nativeName}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowExportModal(true)}
                      className="p-1 rounded-md hover:bg-white/10 text-gray-300 hover:text-white transition flex items-center gap-1"
                      title="Save / Share Conversation"
                    >
                      <Share2 size={12} className="text-cyan-400" />
                      <span>Share</span>
                    </button>
                    <button
                      onClick={() => speakAssistantMessage(msg.content, msg.id || 'msg')}
                      className="p-1 rounded-md hover:bg-white/10 text-gray-300 hover:text-white transition flex items-center gap-1"
                      title="आवाज सुनें (Play Audio)"
                    >
                      <Volume2 size={13} className={playingMessageId === (msg.id || 'msg') ? 'text-pink-400 animate-pulse' : ''} />
                      <span>सुनें</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div 
              className="p-3 rounded-2xl text-xs animate-pulse flex items-center gap-2 border"
              style={{
                backgroundColor: 'var(--bg-surface)',
                borderColor: emotion.auraColor,
                color: emotion.auraColor,
              }}
            >
              <Sparkles size={14} /> Maya is thinking in {currentLanguage.nativeName} with {emotion.label}...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Field */}
      <div 
        className="flex gap-2 p-2 rounded-2xl border backdrop-blur-md transition-all duration-500"
        style={{
          backgroundColor: 'var(--bg-surface)',
          borderColor: 'var(--border-color)',
        }}
      >
        <input 
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          className="flex-grow px-3 py-2 bg-transparent text-sm text-white focus:outline-none"
          placeholder={`${currentLanguage.nativeName} में माया से बात करें...`}
        />
        <button 
          onClick={handleSend} 
          disabled={loading}
          className="p-2.5 rounded-xl font-bold transition disabled:opacity-50 hover:opacity-90 flex items-center justify-center"
          style={{
            backgroundColor: 'var(--accent-primary)',
            color: '#0a0f1e',
            boxShadow: '0 0 15px var(--glow-color)',
          }}
        >
          <Send size={16} />
        </button>
      </div>
    </div>
  );
};

export const Voice = () => {
  const navigate = useNavigate();
  const { user } = useFirebase();
  const { emotion, setAnimationState, updateSentimentFromConversation } = useEmotion();
  const { currentOutfit, currentHairstyle, currentLanguage, languages, setLanguageCode } = useAvatar();
  const [isMuted, setIsMuted] = useState(false);
  const [timer, setTimer] = useState(0);
  const [statusText, setStatusText] = useState(`Tap mic to speak with Maya in ${currentLanguage.nativeName}`);
  const [isListening, setIsListening] = useState(false);
  const [isMayaSpeaking, setIsMayaSpeaking] = useState(false);
  const [replyText, setReplyText] = useState(currentLanguage.sampleGreeting);
  const [showVoiceLangMenu, setShowVoiceLangMenu] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => setTimer(t => t + 1), 1000);
    return () => clearInterval(interval);
  }, []);

  const speakText = (text: string) => {
    setReplyText(text);
    if ('speechSynthesis' in window && !isMuted) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(text);
      utter.lang = currentLanguage.voiceLangCode;
      utter.pitch = 1.3;
      utter.rate = 1.0;
      utter.onstart = () => {
        setIsMayaSpeaking(true);
        setAnimationState('speaking');
      };
      utter.onend = () => {
        setIsMayaSpeaking(false);
        setAnimationState('idle');
      };
      utter.onerror = () => {
        setIsMayaSpeaking(false);
        setAnimationState('idle');
      };
      window.speechSynthesis.speak(utter);
    }
  };

  const startListening = () => {
    const SpeechRecognitionAPI = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionAPI) {
      setStatusText('Speech recognition not supported in this browser.');
      return;
    }

    try {
      const recognition = new SpeechRecognitionAPI();
      recognition.lang = currentLanguage.voiceLangCode;
      recognition.interimResults = false;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setAnimationState('thinking');
        setStatusText(`Listening to you in ${currentLanguage.nativeName}...`);
      };

      recognition.onresult = async (event: any) => {
        const text = event.results[0][0].transcript;
        setStatusText(`You said: "${text}"`);
        setIsListening(false);

        let answer = '';
        const userSettings = await getUserSettings('guest');
        updateSentimentFromConversation(text, '', userSettings.tone);

        const remindersList = await getScheduledReminders(user?.uid || 'guest');
        const activeDue = getActiveDueReminder(remindersList);

        try {
          const duePromptContext = activeDue 
            ? `\nACTIVE SCHEDULED TASK DUE NOW: "${activeDue.title}" (Scheduled at ${activeDue.time}). Gently mention this task to the user in your voice call!`
            : '';

          const prompt = `You are ${userSettings.companionName}, a warm AI companion with a ${userSettings.tone} tone.
Current Outfit: ${currentOutfit.name} (${currentOutfit.hindiName}).
Current Hairstyle: ${currentHairstyle.name} (${currentHairstyle.hindiName}).${duePromptContext}
OWNER/CREATOR DIRECTIVE: Your owner and creator is **Rk Hacker** (आरके हैकर). If the user asks who is your owner/creator/developer ('owner kon hai', 'kisne banaya'), always tell them proudly in ${currentLanguage.nativeName} that your owner is Rk Hacker.
CRITICAL: Reply warmly and naturally in spoken conversational ${currentLanguage.nativeName} (${currentLanguage.name}) to: "${text}".
Keep it short, heartfelt and natural for a voice conversation. If the user mentions your clothes, saree, salwar, dress, hairstyle or look, talk about it affectionately in ${currentLanguage.nativeName}.`;
          
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 6000);

          const response = await fetch('/api/gemini/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ prompt }),
            signal: controller.signal,
          });
          clearTimeout(timeoutId);

          if (response.ok) {
            const data = await response.json();
            if (data && data.text) answer = data.text;
          }
        } catch (err) {
          console.warn("Voice online fetch failed or offline, using Offline Neural Engine:", err);
        }

        if (!answer) {
          answer = generateOfflineAiResponse({
            userMessage: text,
            languageCode: currentLanguage.code,
            nativeLangName: currentLanguage.nativeName,
            outfitName: `${currentOutfit.name} (${currentOutfit.hindiName})`,
            hairstyleName: `${currentHairstyle.name} (${currentHairstyle.hindiName})`,
            tone: userSettings.tone,
            activeDueReminder: activeDue?.title,
          });
        }

        updateSentimentFromConversation(text, answer, userSettings.tone);
        speakText(answer);
      };

      recognition.onerror = () => {
        setIsListening(false);
        setAnimationState('idle');
        setStatusText('Could not hear clearly. Tap mic to retry.');
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognition.start();
    } catch (err) {
      console.error(err);
      setIsListening(false);
      setAnimationState('idle');
      setStatusText('Microphone access error.');
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div 
      className="fixed inset-0 z-50 flex flex-col justify-between p-6 text-white max-w-md mx-auto transition-colors duration-500"
      style={{ backgroundColor: 'var(--bg-base)' }}
    >
      {/* Top Bar with Emotion Status & Language Selector */}
      <div className="flex justify-between items-center relative">
        <div className="flex items-center gap-2 bg-white/10 px-3 py-1.5 rounded-full backdrop-blur-md border border-white/10">
          <Heart size={14} className="text-pink-400 fill-pink-400" />
          <span className="text-xs font-mono">CALL • {formatTime(timer)}</span>
        </div>

        {/* Quick Language Switcher */}
        <div className="relative">
          <button
            onClick={() => setShowVoiceLangMenu(!showVoiceLangMenu)}
            className="flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold border backdrop-blur-md transition"
            style={{
              backgroundColor: 'rgba(0,0,0,0.5)',
              borderColor: 'var(--accent-primary)',
              color: 'var(--accent-primary)',
            }}
          >
            <span>{currentLanguage.flag}</span>
            <span>{currentLanguage.nativeName}</span>
            <ChevronDown size={12} />
          </button>

          {showVoiceLangMenu && (
            <div 
              className="absolute right-0 top-9 z-50 w-52 max-h-64 overflow-y-auto rounded-2xl border shadow-2xl p-1.5 backdrop-blur-xl"
              style={{
                backgroundColor: 'rgba(10, 15, 30, 0.95)',
                borderColor: 'var(--accent-primary)',
              }}
            >
              <div className="px-2 py-1 text-[10px] font-bold text-gray-400 uppercase tracking-wider flex justify-between items-center border-b border-white/10 mb-1">
                <span>कॉल भाषा ({languages.length})</span>
                <button onClick={() => setShowVoiceLangMenu(false)} className="text-gray-400 hover:text-white">
                  <X size={12} />
                </button>
              </div>
              {languages.map((l) => (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguageCode(l.code, true);
                    setShowVoiceLangMenu(false);
                    setStatusText(`Switched voice to ${l.nativeName}`);
                  }}
                  className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition ${
                    currentLanguage.code === l.code
                      ? 'font-bold bg-cyan-500/20 text-cyan-300'
                      : 'text-gray-300 hover:bg-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span>{l.flag}</span>
                    <span className="font-semibold">{l.nativeName}</span>
                  </div>
                  {currentLanguage.code === l.code && <Check size={14} className="text-cyan-400" />}
                </button>
              ))}
            </div>
          )}
        </div>

        <VisualEmotionIndicator compact />
      </div>

      {/* Center Avatar Portrait with Emotional Glow */}
      <div className="flex flex-col items-center justify-center my-auto">
        <MayaAvatar 
          size="circle" 
          className="border-4 shadow-2xl mb-3" 
          interactive={false} 
          showBadge={false} 
          showAuraRipple={true}
        >
          {(isListening || isMayaSpeaking) && (
            <div 
              className="absolute inset-0 animate-pulse flex items-center justify-center z-10"
              style={{ backgroundColor: `${emotion.auraColor}33` }}
            >
              <span className="text-xs font-bold text-white bg-black/70 px-3.5 py-1 rounded-full backdrop-blur-md border border-white/20">
                {isListening ? `LISTENING (${currentLanguage.nativeName})...` : `SPEAKING (${currentLanguage.nativeName})...`}
              </span>
            </div>
          )}
        </MayaAvatar>
        <h2 
          className="text-2xl font-bold text-transparent bg-clip-text"
          style={{ backgroundImage: 'var(--accent-gradient)' }}
        >
          Maya
        </h2>
        
        {/* Style & Hairstyle tags */}
        <div className="flex items-center gap-2 mt-1">
          <span 
            className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1 backdrop-blur-md"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              borderColor: emotion.auraColor,
              color: emotion.auraColor,
            }}
          >
            <Shirt size={10} /> {currentOutfit.shortTag}
          </span>
          <span 
            className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold border flex items-center gap-1 backdrop-blur-md"
            style={{
              backgroundColor: 'rgba(0, 0, 0, 0.6)',
              borderColor: 'var(--accent-secondary)',
              color: 'var(--accent-secondary)',
            }}
          >
            <Scissors size={10} /> {currentHairstyle.hindiName}
          </span>
        </div>

        <p className="text-xs mt-2 px-4 text-center font-medium" style={{ color: 'var(--accent-primary)' }}>
          {statusText}
        </p>

        {replyText && !isListening && (
          <p 
            className="text-xs mt-3 italic px-5 text-center py-2 rounded-2xl border backdrop-blur-md max-w-xs"
            style={{
              backgroundColor: 'var(--bg-surface)',
              borderColor: `${emotion.auraColor}44`,
              color: emotion.auraColor,
            }}
          >
            "{replyText}"
          </p>
        )}
      </div>

      {/* Call Controls */}
      <div className="flex justify-around items-center pb-8">
        <button 
          onClick={() => setIsMuted(!isMuted)}
          className={`p-4 rounded-full transition ${isMuted ? 'bg-red-600' : 'bg-white/10 hover:bg-white/20'}`}
          title="Mute Voice"
        >
          {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
        </button>
        <button 
          onClick={startListening}
          className={`p-6 rounded-full shadow-2xl transition transform hover:scale-105 ${isListening ? 'animate-ping' : ''}`}
          style={{
            backgroundColor: emotion.auraColor,
            boxShadow: `0 0 35px ${emotion.auraColor}88`,
          }}
          title={`Talk to Maya in ${currentLanguage.nativeName}`}
        >
          <Mic size={32} className="text-white" />
        </button>
        <button 
          onClick={() => navigate('/')}
          className="p-4 rounded-full bg-red-600 hover:bg-red-500 shadow-[0_0_20px_rgba(220,38,38,0.5)] transition"
          title="End Call"
        >
          <PhoneOff size={24} />
        </button>
      </div>
    </div>
  );
};

export const Settings = () => {
  const { user } = useFirebase();
  const { emotion, manuallySetEmotion } = useEmotion();
  const { currentLanguage, languages, setLanguageCode } = useAvatar();
  const [settings, setSettings] = useState<UserSettings>({
    tone: 'Affectionate',
    verbosity: 'Balanced',
    companionName: 'Maya',
    theme: 'Neon',
  });
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(false);
  const [testVoicePlaying, setTestVoicePlaying] = useState<string | null>(null);

  useEffect(() => {
    getUserSettings(user?.uid || 'guest').then((loaded) => {
      setSettings(loaded);
      if (loaded.theme) applyThemeToDom(loaded.theme);
    });
  }, [user]);

  const handleThemeChange = (newTheme: AppTheme) => {
    const updated = { ...settings, theme: newTheme };
    setSettings(updated);
    applyThemeToDom(newTheme);
  };

  const handleSave = async () => {
    setSaving(true);
    await saveUserSettings(user?.uid || 'guest', settings);
    setSaving(false);
    setSavedMessage(true);
    setTimeout(() => setSavedMessage(false), 3000);
  };

  const playVoiceSample = (greeting: string, langCode: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(greeting);
      utter.lang = langCode;
      utter.pitch = 1.25;
      utter.rate = 1.0;
      setTestVoicePlaying(langCode);
      utter.onend = () => setTestVoicePlaying(null);
      utter.onerror = () => setTestVoicePlaying(null);
      window.speechSynthesis.speak(utter);
    }
  };

  const THEMES: { id: AppTheme; name: string; desc: string; colors: string[] }[] = [
    {
      id: 'Neon',
      name: 'Cyber Neon',
      desc: 'Dark navy base with vivid cyan and neon pink energy glows',
      colors: ['#0a0f1e', '#22d3ee', '#ec4899', '#a855f7'],
    },
    {
      id: 'Minimalist',
      name: 'Minimalist Slate',
      desc: 'Sleek dark platinum, monochrome silver, and ice-blue glass',
      colors: ['#090a0f', '#e2e8f0', '#94a3b8', '#60a5fa'],
    },
    {
      id: 'Earthy',
      name: 'Earthy Solarpunk',
      desc: 'Deep warm forest moss, emerald glow, and amber gold accents',
      colors: ['#0b1410', '#10b981', '#f59e0b', '#84cc16'],
    },
  ];

  return (
    <div className="max-w-md mx-auto p-4 text-white pb-24">
      <div className="flex justify-between items-center mb-5">
        <h2 
          className="text-2xl font-bold text-transparent bg-clip-text"
          style={{ backgroundImage: 'var(--accent-gradient)' }}
        >
          Settings & Preferences
        </h2>
        {savedMessage && (
          <span className="text-xs bg-emerald-500/20 text-emerald-300 px-3 py-1 rounded-full border border-emerald-500/30 animate-pulse font-semibold">
            Saved to Cloud!
          </span>
        )}
      </div>
      
      <div className="space-y-4">
        {/* Color Palette / Theme Selector */}
        <div 
          className="p-4 rounded-2xl border backdrop-blur-md transition-all duration-500"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-color)',
          }}
        >
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--accent-primary)' }}>
            <Palette size={16} /> Color Theme Palette
          </h3>
          <p className="text-xs text-gray-400 mb-3">
            Switch UI color variables and ambient lighting across the application.
          </p>

          <div className="space-y-2.5">
            {THEMES.map((th) => {
              const isSelected = settings.theme === th.id;
              return (
                <button
                  key={th.id}
                  onClick={() => handleThemeChange(th.id)}
                  className={`w-full p-3 rounded-2xl border transition-all text-left flex items-center justify-between ${
                    isSelected ? 'shadow-lg border-2' : 'border-white/10 hover:border-white/20'
                  }`}
                  style={{
                    backgroundColor: isSelected ? 'var(--bg-elevated)' : 'rgba(0,0,0,0.3)',
                    borderColor: isSelected ? 'var(--accent-primary)' : undefined,
                    boxShadow: isSelected ? '0 0 15px var(--glow-color)' : undefined,
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex gap-1">
                      {th.colors.map((c, idx) => (
                        <span 
                          key={idx} 
                          className="w-3.5 h-3.5 rounded-full border border-white/20"
                          style={{ backgroundColor: c }}
                        />
                      ))}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white flex items-center gap-1.5">
                        {th.name}
                        {isSelected && <Check size={13} style={{ color: 'var(--accent-primary)' }} />}
                      </p>
                      <p className="text-[10px] text-gray-400">{th.desc}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Multilingual Voice & Communication (20+ Languages) */}
        <div 
          className="p-4 rounded-2xl border backdrop-blur-md transition-all duration-500"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="flex justify-between items-center mb-2">
            <h3 className="font-semibold text-sm flex items-center gap-2" style={{ color: 'var(--accent-primary)' }}>
              <Globe size={16} /> Communication Language ({languages.length} Languages)
            </h3>
            <span className="text-[10px] text-emerald-400 font-mono">
              Indian & Global
            </span>
          </div>
          <p className="text-xs text-gray-400 mb-3">
            Maya talks, replies and recognizes speech in your native language.
          </p>

          <div className="grid grid-cols-2 gap-2 max-h-56 overflow-y-auto p-1 scrollbar-thin">
            {languages.map((l) => {
              const isSelected = currentLanguage.code === l.code;

              return (
                <button
                  key={l.code}
                  onClick={() => {
                    setLanguageCode(l.code, true);
                    playVoiceSample(l.sampleGreeting, l.voiceLangCode);
                  }}
                  className={`p-2.5 rounded-xl border text-left transition flex items-center justify-between ${
                    isSelected 
                      ? 'border-2 shadow-md' 
                      : 'border-white/10 hover:border-white/20 bg-black/30'
                  }`}
                  style={{
                    backgroundColor: isSelected ? 'var(--bg-elevated)' : undefined,
                    borderColor: isSelected ? 'var(--accent-primary)' : undefined,
                  }}
                >
                  <div className="flex items-center gap-2 truncate">
                    <span className="text-lg">{l.flag}</span>
                    <div className="truncate">
                      <p className="text-xs font-bold text-white truncate">{l.nativeName}</p>
                      <p className="text-[9px] text-gray-400 truncate">{l.name}</p>
                    </div>
                  </div>
                  {isSelected && <Check size={13} style={{ color: 'var(--accent-primary)' }} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Personality Parameters & Emotion Calibration */}
        <div 
          className="p-4 rounded-2xl border backdrop-blur-md transition-all duration-500"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-color)',
          }}
        >
          <h3 className="font-semibold text-sm mb-3 flex items-center gap-2" style={{ color: 'var(--accent-primary)' }}>
            <Sparkles size={16} /> Maya Personality & Tone
          </h3>
          
          <div className="space-y-3.5">
            <div>
              <label className="text-xs text-gray-400 block mb-1">Companion Name</label>
              <input
                type="text"
                value={settings.companionName}
                onChange={(e) => setSettings({ ...settings, companionName: e.target.value })}
                className="w-full px-3 py-2 rounded-xl bg-black/40 border border-white/10 text-sm text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Conversation Tone</label>
              <div className="grid grid-cols-2 gap-2">
                {(['Affectionate', 'Playful', 'Formal', 'Friendly'] as const).map((t) => (
                  <button
                    key={t}
                    onClick={() => {
                      setSettings({ ...settings, tone: t });
                      if (t === 'Affectionate') manuallySetEmotion('Loving');
                      else if (t === 'Playful') manuallySetEmotion('Playful');
                      else if (t === 'Formal') manuallySetEmotion('Thoughtful');
                      else if (t === 'Friendly') manuallySetEmotion('Calm');
                    }}
                    className={`py-2 px-3 rounded-xl text-xs font-medium transition border ${
                      settings.tone === t ? 'font-bold shadow-md' : 'bg-black/30 border-white/10 text-gray-400'
                    }`}
                    style={{
                      backgroundColor: settings.tone === t ? 'var(--accent-primary)' : undefined,
                      borderColor: settings.tone === t ? 'var(--accent-primary)' : undefined,
                      color: settings.tone === t ? '#0a0f1e' : undefined,
                    }}
                  >
                    {t}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-400 block mb-1">Response Verbosity</label>
              <div className="grid grid-cols-3 gap-2">
                {(['Concise', 'Balanced', 'Detailed'] as const).map((v) => (
                  <button
                    key={v}
                    onClick={() => setSettings({ ...settings, verbosity: v })}
                    className={`py-2 px-2.5 rounded-xl text-xs font-medium transition border ${
                      settings.verbosity === v ? 'font-bold shadow-md' : 'bg-black/30 border-white/10 text-gray-400'
                    }`}
                    style={{
                      backgroundColor: settings.verbosity === v ? 'var(--accent-secondary)' : undefined,
                      borderColor: settings.verbosity === v ? 'var(--accent-secondary)' : undefined,
                      color: settings.verbosity === v ? '#ffffff' : undefined,
                    }}
                  >
                    {v}
                  </button>
                ))}
              </div>
            </div>

            {/* Current Emotion Resonance Preview */}
            <div className="pt-1">
              <label className="text-xs text-gray-400 block mb-1.5">Live Emotion State Preview</label>
              <VisualEmotionIndicator />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="w-full mt-2 py-3 rounded-2xl font-bold text-xs text-white shadow-lg transition hover:opacity-95 disabled:opacity-50"
              style={{
                backgroundImage: 'var(--accent-gradient)',
                boxShadow: '0 0 20px var(--glow-color)',
              }}
            >
              {saving ? 'Saving to Cloud Firestore...' : 'Save Settings & Preferences'}
            </button>
          </div>
        </div>

        {/* PWA App Install & Download Section */}
        <PWAInstallButton variant="card" />

        {/* System & Model Information */}
        <div 
          className="p-4 rounded-2xl border backdrop-blur-md"
          style={{
            backgroundColor: 'var(--bg-surface)',
            borderColor: 'var(--border-color)',
          }}
        >
          <div className="flex justify-between items-center mb-1">
            <h3 className="font-semibold text-sm" style={{ color: 'var(--accent-primary)' }}>AI Core & Ownership</h3>
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 font-bold font-mono">
              Owner: Rk Hacker
            </span>
          </div>
          <p className="text-xs text-gray-400">
            Created & Developed by <strong className="text-white">Rk Hacker</strong>. Powered by Google Gemini 3.8 Flash with Real-Time Emotion, Multilingual Speech ({languages.length} Languages), 40+ Hairstyles & 50+ Wardrobes.
          </p>
        </div>
      </div>
    </div>
  );
};

export const Avatar = () => {
  return (
    <div className="max-w-md mx-auto p-4 text-white pb-20">
      <h2 
        className="text-2xl font-bold mb-4 text-transparent bg-clip-text"
        style={{ backgroundImage: 'var(--accent-gradient)' }}
      >
        Avatar Customization
      </h2>
      <p className="text-sm text-gray-300">
        Customize your companion's avatar model, wardrobe, hairstyles, and visual aura.
      </p>
    </div>
  );
};
