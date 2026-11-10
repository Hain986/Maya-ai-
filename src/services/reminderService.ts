import { collection, addDoc, getDocs, doc, deleteDoc, updateDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase';

export interface ScheduledReminder {
  id: string;
  title: string;
  time: string; // HH:MM in 24h format (e.g. "08:30", "14:00")
  category: 'Health' | 'Work' | 'Study' | 'Personal' | 'Fitness';
  enabled: boolean;
  completedToday?: boolean;
}

const DEFAULT_REMINDERS: ScheduledReminder[] = [
  { id: 'def_1', title: 'Morning Hydration (पानी पीयें)', time: '08:00', category: 'Health', enabled: true, completedToday: false },
  { id: 'def_2', title: 'Healthy Lunch Break (लंच टाइम)', time: '13:00', category: 'Health', enabled: true, completedToday: false },
  { id: 'def_3', title: 'Evening Walk (शाम की सैर)', time: '18:00', category: 'Fitness', enabled: true, completedToday: false },
  { id: 'def_4', title: 'Night Reflection (आज का आभार)', time: '22:00', category: 'Personal', enabled: true, completedToday: false },
];

export const getScheduledReminders = async (userId: string = 'guest'): Promise<ScheduledReminder[]> => {
  try {
    const local = localStorage.getItem(`maya_reminders_${userId}`);
    if (local) {
      return JSON.parse(local);
    }

    if (db && userId !== 'guest') {
      const q = query(collection(db, 'reminders'), where('userId', '==', userId));
      const snap = await getDocs(q);
      if (!snap.empty) {
        const list: ScheduledReminder[] = [];
        snap.forEach((d) => list.push({ id: d.id, ...(d.data() as any) }));
        localStorage.setItem(`maya_reminders_${userId}`, JSON.stringify(list));
        return list;
      }
    }
  } catch (e) {
    console.warn('Error reading reminders from Cloud, using defaults:', e);
  }

  // Save default
  localStorage.setItem(`maya_reminders_${userId}`, JSON.stringify(DEFAULT_REMINDERS));
  return DEFAULT_REMINDERS;
};

export const saveScheduledReminder = async (userId: string = 'guest', reminder: Omit<ScheduledReminder, 'id'>): Promise<ScheduledReminder[]> => {
  const current = await getScheduledReminders(userId);
  const newObj: ScheduledReminder = {
    ...reminder,
    id: 'rem_' + Date.now(),
    completedToday: false,
  };
  const updated = [...current, newObj];
  localStorage.setItem(`maya_reminders_${userId}`, JSON.stringify(updated));

  try {
    if (db && userId !== 'guest') {
      await addDoc(collection(db, 'reminders'), {
        userId,
        ...newObj,
      });
    }
  } catch (e) {
    console.warn('Error saving reminder to Firestore:', e);
  }

  return updated;
};

export const toggleReminderStatus = async (userId: string = 'guest', reminderId: string): Promise<ScheduledReminder[]> => {
  const current = await getScheduledReminders(userId);
  const updated = current.map((r) => (r.id === reminderId ? { ...r, enabled: !r.enabled } : r));
  localStorage.setItem(`maya_reminders_${userId}`, JSON.stringify(updated));
  return updated;
};

export const toggleReminderCompletedToday = async (userId: string = 'guest', reminderId: string): Promise<ScheduledReminder[]> => {
  const current = await getScheduledReminders(userId);
  const updated = current.map((r) => (r.id === reminderId ? { ...r, completedToday: !r.completedToday } : r));
  localStorage.setItem(`maya_reminders_${userId}`, JSON.stringify(updated));
  return updated;
};

export const deleteScheduledReminder = async (userId: string = 'guest', reminderId: string): Promise<ScheduledReminder[]> => {
  const current = await getScheduledReminders(userId);
  const updated = current.filter((r) => r.id !== reminderId);
  localStorage.setItem(`maya_reminders_${userId}`, JSON.stringify(updated));

  try {
    if (db && userId !== 'guest') {
      await deleteDoc(doc(db, 'reminders', reminderId));
    }
  } catch (e) {
    console.warn('Error deleting reminder from Firestore:', e);
  }

  return updated;
};

// Check for active or upcoming due reminders for the current hour
export const getActiveDueReminder = (reminders: ScheduledReminder[]): ScheduledReminder | null => {
  const now = new Date();
  const currentHour = now.getHours();
  const currentMin = now.getMinutes();

  for (const rem of reminders) {
    if (!rem.enabled || rem.completedToday) continue;
    const [h, m] = rem.time.split(':').map(Number);
    // Matches if current hour equals reminder hour or within 45 mins after scheduled time
    if (h === currentHour && currentMin >= m) {
      return rem;
    }
  }
  return null;
};
