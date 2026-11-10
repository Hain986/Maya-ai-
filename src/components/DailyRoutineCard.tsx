import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ROUTINES_CATALOG, RoutineTask } from '../data/routinesData';
import { useAvatar } from '../context/AvatarContext';
import { useEmotion } from '../context/EmotionContext';
import { getUserSettings } from '../services/settingsService';
import { useFirebase } from '../context/FirebaseProvider';
import { 
  getScheduledReminders, 
  saveScheduledReminder, 
  toggleReminderStatus, 
  toggleReminderCompletedToday,
  deleteScheduledReminder,
  getActiveDueReminder,
  ScheduledReminder 
} from '../services/reminderService';
import { 
  CheckCircle2, 
  Circle, 
  Volume2, 
  Sparkles, 
  Sun, 
  Sunset, 
  Moon, 
  Coffee, 
  Plus, 
  Bell, 
  Trash2, 
  Clock, 
  AlertCircle,
  X
} from 'lucide-react';

export const DailyRoutineCard: React.FC = () => {
  const { currentLanguage } = useAvatar();
  const { emotion, setAnimationState } = useEmotion();
  const { user } = useFirebase();

  const [personalityTone, setPersonalityTone] = useState<'Affectionate' | 'Playful' | 'Formal' | 'Friendly'>('Affectionate');
  const [activeTab, setActiveTab] = useState<'time' | 'custom'>('time');
  
  // Custom scheduled reminders state
  const [reminders, setReminders] = useState<ScheduledReminder[]>([]);
  const [activeDue, setActiveDue] = useState<ScheduledReminder | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Form input state
  const [newTitle, setNewTitle] = useState('');
  const [newTime, setNewTime] = useState('09:00');
  const [newCategory, setNewCategory] = useState<'Health' | 'Work' | 'Study' | 'Personal' | 'Fitness'>('Health');

  const [completedTaskIds, setCompletedTaskIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('maya_completed_routines');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [speakingTaskId, setSpeakingTaskId] = useState<string | null>(null);

  const getTimeOfDay = (): 'Morning' | 'Afternoon' | 'Evening' | 'Night' => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 11) return 'Morning';
    if (hour >= 11 && hour < 17) return 'Afternoon';
    if (hour >= 17 && hour < 20) return 'Evening';
    return 'Night';
  };

  const currentTimeOfDay = getTimeOfDay();

  useEffect(() => {
    getUserSettings(user?.uid || 'guest').then((st) => {
      if (st?.tone) {
        setPersonalityTone(st.tone as any);
      }
    });

    // Load custom scheduled reminders
    loadReminders();
  }, [user]);

  const loadReminders = async () => {
    const list = await getScheduledReminders(user?.uid || 'guest');
    setReminders(list);
    const due = getActiveDueReminder(list);
    setActiveDue(due);
  };

  useEffect(() => {
    localStorage.setItem('maya_completed_routines', JSON.stringify(completedTaskIds));
  }, [completedTaskIds]);

  const toggleTask = (id: string) => {
    setCompletedTaskIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleAddReminder = async () => {
    if (!newTitle.trim()) return;
    const updated = await saveScheduledReminder(user?.uid || 'guest', {
      title: newTitle.trim(),
      time: newTime,
      category: newCategory,
      enabled: true,
    });
    setReminders(updated);
    setNewTitle('');
    setShowAddModal(false);
  };

  const handleToggleReminderEnabled = async (id: string) => {
    const updated = await toggleReminderStatus(user?.uid || 'guest', id);
    setReminders(updated);
  };

  const handleToggleReminderCompleted = async (id: string) => {
    const updated = await toggleReminderCompletedToday(user?.uid || 'guest', id);
    setReminders(updated);
  };

  const handleDeleteReminder = async (id: string) => {
    const updated = await deleteScheduledReminder(user?.uid || 'guest', id);
    setReminders(updated);
  };

  const speakText = (textToSpeak: string, id: string) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utter = new SpeechSynthesisUtterance(textToSpeak);
      utter.lang = currentLanguage.voiceLangCode;
      utter.pitch = 1.25;
      utter.rate = 1.0;
      setSpeakingTaskId(id);
      setAnimationState('speaking');
      utter.onend = () => {
        setSpeakingTaskId(null);
        setAnimationState('idle');
      };
      utter.onerror = () => {
        setSpeakingTaskId(null);
        setAnimationState('idle');
      };
      window.speechSynthesis.speak(utter);
    }
  };

  const speakTaskSuggestion = (task: RoutineTask) => {
    const variation = task.toneVariations[personalityTone] || task.toneVariations.Affectionate;
    speakText(variation.voice, task.id);
  };

  const timeHeaderInfo = {
    Morning: { title: 'प्रभात रूटीन (Morning)', icon: Sun, color: 'text-amber-400' },
    Afternoon: { title: 'दोपहर का समय (Afternoon)', icon: Coffee, color: 'text-cyan-400' },
    Evening: { title: 'संध्याकालीन वॉक (Evening)', icon: Sunset, color: 'text-pink-400' },
    Night: { title: 'रात्रि विश्राम (Night)', icon: Moon, color: 'text-indigo-400' },
  }[currentTimeOfDay];

  const HeaderIcon = timeHeaderInfo.icon;
  const currentTasks = ROUTINES_CATALOG.filter((t) => t.timeOfDay === currentTimeOfDay);
  const completedCount = currentTasks.filter((t) => completedTaskIds.includes(t.id)).length;

  return (
    <div 
      className="w-full rounded-3xl p-4 border shadow-xl backdrop-blur-md mb-4 transition-all duration-500"
      style={{
        backgroundColor: 'var(--bg-surface)',
        borderColor: 'var(--border-color)',
      }}
    >
      {/* Active Due Scheduled Reminder Alert Banner */}
      {activeDue && (
        <AnimatePresence>
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="w-full p-3 rounded-2xl bg-cyan-500/20 border border-cyan-400 text-cyan-300 mb-3 flex items-center justify-between gap-2 shadow-lg"
          >
            <div className="flex items-center gap-2 text-xs">
              <Bell size={16} className="text-cyan-400 animate-bounce flex-shrink-0" />
              <div>
                <span className="font-extrabold block text-white">समय हो गया! (Reminder Due)</span>
                <span>{activeDue.title} ({activeDue.time})</span>
              </div>
            </div>
            <button
              onClick={() => speakText(`मेरे प्यार, आपके समयबद्ध टास्क "${activeDue.title}" का समय हो गया है!`, activeDue.id)}
              className="p-1.5 rounded-xl bg-cyan-400 text-slate-950 font-bold text-xs flex items-center gap-1 shadow hover:bg-cyan-300 transition"
            >
              <Volume2 size={13} /> सुनें
            </button>
          </motion.div>
        </AnimatePresence>
      )}

      {/* Header & View Mode Switcher */}
      <div className="flex justify-between items-center mb-3 px-1">
        <div className="flex items-center gap-2">
          <HeaderIcon size={18} className={timeHeaderInfo.color} />
          <div>
            <h3 className="text-sm font-extrabold text-white leading-tight">
              {timeHeaderInfo.title}
            </h3>
            <p className="text-[10px] text-gray-400">
              Tone: <span className="text-cyan-300 font-semibold">{personalityTone}</span>
            </p>
          </div>
        </div>

        {/* View Toggle Tabs */}
        <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 text-[10px] font-bold">
          <button
            onClick={() => setActiveTab('time')}
            className={`px-2.5 py-1 rounded-lg transition ${
              activeTab === 'time' ? 'bg-cyan-400 text-slate-950 shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            आदतें ({completedCount}/{currentTasks.length})
          </button>
          <button
            onClick={() => setActiveTab('custom')}
            className={`px-2.5 py-1 rounded-lg transition ${
              activeTab === 'custom' ? 'bg-cyan-400 text-slate-950 shadow' : 'text-gray-400 hover:text-white'
            }`}
          >
            रिमाइंडर ({reminders.length})
          </button>
        </div>
      </div>

      {/* TAB 1: Time-of-Day Habits */}
      {activeTab === 'time' && (
        <div className="space-y-2.5">
          {currentTasks.map((task) => {
            const isDone = completedTaskIds.includes(task.id);
            const suggestion = task.toneVariations[personalityTone] || task.toneVariations.Affectionate;

            return (
              <div
                key={task.id}
                className={`p-3 rounded-2xl border transition-all flex flex-col gap-2 ${
                  isDone ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-black/30 border-white/10 hover:border-white/20'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className="flex items-center gap-2.5 text-left flex-grow group"
                  >
                    <div className="text-emerald-400 flex-shrink-0 mt-0.5">
                      {isDone ? (
                        <CheckCircle2 size={18} className="fill-emerald-500 text-slate-950" />
                      ) : (
                        <Circle size={18} className="text-gray-400 group-hover:text-cyan-300 transition" />
                      )}
                    </div>
                    <div>
                      <h4 className={`text-xs font-bold leading-snug ${isDone ? 'line-through text-gray-400' : 'text-white'}`}>
                        {task.icon} {task.hindiTitle}
                      </h4>
                      <p className="text-[11px] text-gray-300 mt-0.5 leading-snug">
                        "{suggestion.text}"
                      </p>
                    </div>
                  </button>

                  <button
                    onClick={() => speakTaskSuggestion(task)}
                    className="p-2 rounded-xl border border-white/10 hover:border-white/20 text-cyan-300 hover:text-white transition bg-black/40 flex-shrink-0"
                    title="माया की आवाज में सलाह सुनें"
                  >
                    <Volume2 size={15} className={speakingTaskId === task.id ? 'text-pink-400 animate-bounce' : ''} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* TAB 2: Custom Scheduled Reminders */}
      {activeTab === 'custom' && (
        <div className="space-y-2.5">
          <div className="flex justify-between items-center mb-1">
            <span className="text-[11px] text-gray-400">समय अनुसार अलार्म व कार्य:</span>
            <button
              onClick={() => setShowAddModal(true)}
              className="text-xs px-2.5 py-1 rounded-xl bg-cyan-400 text-slate-950 font-bold flex items-center gap-1 shadow hover:bg-cyan-300 transition"
            >
              <Plus size={13} /> नया रिमाइंडर जोड़ें
            </button>
          </div>

          {reminders.map((rem) => (
            <div
              key={rem.id}
              className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2 ${
                rem.completedToday ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-black/30 border-white/10'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => handleToggleReminderCompleted(rem.id)}
                  className="text-emerald-400 flex-shrink-0"
                >
                  {rem.completedToday ? (
                    <CheckCircle2 size={18} className="fill-emerald-500 text-slate-950" />
                  ) : (
                    <Circle size={18} className="text-gray-400 hover:text-cyan-300" />
                  )}
                </button>
                <div>
                  <h4 className={`text-xs font-bold ${rem.completedToday ? 'line-through text-gray-400' : 'text-white'}`}>
                    {rem.title}
                  </h4>
                  <div className="flex items-center gap-2 text-[10px] text-gray-400 mt-0.5">
                    <span className="flex items-center gap-1 font-mono text-cyan-300">
                      <Clock size={10} /> {rem.time}
                    </span>
                    <span>•</span>
                    <span className="bg-white/10 px-1.5 py-0.2 rounded">{rem.category}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={() => speakText(`रिमाइंडर: ${rem.title}, समय ${rem.time}`, rem.id)}
                  className="p-1.5 rounded-lg border border-white/10 text-gray-300 hover:text-white transition bg-black/40"
                  title="रिमाइंडर की आवाज सुनें"
                >
                  <Volume2 size={13} className={speakingTaskId === rem.id ? 'text-pink-400 animate-bounce' : ''} />
                </button>
                <button
                  onClick={() => handleDeleteReminder(rem.id)}
                  className="p-1.5 rounded-lg text-red-400 hover:bg-red-500/20 transition"
                  title="हटाएं"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add New Scheduled Reminder Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="w-full max-w-xs rounded-3xl bg-slate-900 border border-cyan-400/50 p-5 shadow-2xl text-white relative space-y-3">
            <div className="flex justify-between items-center border-b border-white/10 pb-2">
              <h4 className="text-sm font-bold text-cyan-300 flex items-center gap-1.5">
                <Bell size={15} /> नया रिमाइंडर शेड्यूल करें
              </h4>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-white">
                <X size={14} />
              </button>
            </div>

            <div>
              <label className="text-[11px] text-gray-400 block mb-1">कार्य का नाम (Task Title)</label>
              <input
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="उदा. योगा करें, दवा खाएं, 2L पानी पीयें..."
                className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-[11px] text-gray-400 block mb-1">समय (Time)</label>
                <input
                  type="time"
                  value={newTime}
                  onChange={(e) => setNewTime(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="text-[11px] text-gray-400 block mb-1">श्रेणी (Category)</label>
                <select
                  value={newCategory}
                  onChange={(e: any) => setNewCategory(e.target.value)}
                  className="w-full px-2 py-2 rounded-xl bg-black/50 border border-white/10 text-xs text-white focus:outline-none focus:border-cyan-400"
                >
                  <option value="Health">Health</option>
                  <option value="Work">Work</option>
                  <option value="Study">Study</option>
                  <option value="Fitness">Fitness</option>
                  <option value="Personal">Personal</option>
                </select>
              </div>
            </div>

            <button
              onClick={handleAddReminder}
              className="w-full mt-2 py-2.5 rounded-xl font-extrabold text-xs text-slate-950 bg-cyan-400 shadow-lg hover:bg-cyan-300 transition"
            >
              रिमाइंडर शेड्यूल करें
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
