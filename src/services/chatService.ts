import { collection, addDoc, query, orderBy, onSnapshot, serverTimestamp, getDocs, deleteDoc, doc, where } from 'firebase/firestore';
import { db } from '../firebase';

export interface Message {
  id?: string;
  conversationId: string;
  role: 'user' | 'assistant';
  content: string;
  createdAt: any;
}

export interface Conversation {
  id: string;
  title: string;
  createdAt: any;
  updatedAt: any;
}

export const createConversation = async (userId: string = 'guest', title: string = 'New Chat'): Promise<string> => {
  try {
    const convsRef = collection(db, 'conversations');
    const docRef = await addDoc(convsRef, {
      userId,
      title,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (err) {
    console.error("Error creating conversation:", err);
    return 'default_conv';
  }
};

export const subscribeToConversations = (userId: string = 'guest', callback: (convs: Conversation[]) => void) => {
  try {
    const convsRef = collection(db, 'conversations');
    const q = query(convsRef, orderBy('updatedAt', 'desc'));
    
    return onSnapshot(q, (snapshot) => {
      const convs = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Conversation));
      callback(convs.length > 0 ? convs : [{ id: 'default_conv', title: 'Maya General Chat', createdAt: new Date(), updatedAt: new Date() }]);
    }, (error) => {
      console.warn("Conversations listener fallback:", error);
      callback([{ id: 'default_conv', title: 'Maya General Chat', createdAt: new Date(), updatedAt: new Date() }]);
    });
  } catch (err) {
    console.error("Error subscribing to conversations:", err);
    callback([{ id: 'default_conv', title: 'Maya General Chat', createdAt: new Date(), updatedAt: new Date() }]);
    return () => {};
  }
};

export const sendMessage = async (conversationId: string, role: 'user' | 'assistant', content: string) => {
  try {
    const messagesRef = collection(db, `conversations/${conversationId}/messages`);
    await addDoc(messagesRef, {
      conversationId,
      role,
      content,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("Error sending message:", err);
  }
};

export const subscribeToMessages = (conversationId: string, callback: (messages: Message[]) => void) => {
  try {
    const messagesRef = collection(db, `conversations/${conversationId}/messages`);
    const q = query(messagesRef, orderBy('createdAt', 'asc'));
    
    return onSnapshot(q, (snapshot) => {
      const messages = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      } as Message));
      callback(messages);
    }, (error) => {
      console.warn("Snapshot listener fallback or permission warning:", error);
      callback([]);
    });
  } catch (err) {
    console.error("Error subscribing to messages:", err);
    callback([]);
    return () => {};
  }
};
