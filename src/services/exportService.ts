import { Message } from './chatService';

export interface ExportOptions {
  title?: string;
  languageName?: string;
  outfitName?: string;
  hairstyleName?: string;
  format?: 'txt' | 'json' | 'md';
}

/**
 * Formats conversation messages into a clean human-readable text transcript
 */
export function formatConversationText(messages: Message[], options: ExportOptions = {}): string {
  const { title = 'Maya AI Conversation', languageName = 'Hindi/English', outfitName, hairstyleName } = options;
  const dateStr = new Date().toLocaleString();

  let transcript = `==================================================\n`;
  transcript += `       MAYA AI CONVERSATION TRANSCRIPT EXPORT     \n`;
  transcript += `==================================================\n`;
  transcript += `Title: ${title}\n`;
  transcript += `Date: ${dateStr}\n`;
  if (languageName) transcript += `Language: ${languageName}\n`;
  if (outfitName) transcript += `Maya Outfit: ${outfitName}\n`;
  if (hairstyleName) transcript += `Maya Hairstyle: ${hairstyleName}\n`;
  transcript += `Creator & Developer: Rk Hacker (आरके हैकर)\n`;
  transcript += `==================================================\n\n`;

  messages.forEach((msg, idx) => {
    const sender = msg.role === 'user' ? 'YOU' : 'MAYA AI';
    const timestamp = msg.createdAt?.toDate 
      ? msg.createdAt.toDate().toLocaleTimeString() 
      : new Date().toLocaleTimeString();
    
    transcript += `[${idx + 1}] ${sender} (${timestamp}):\n${msg.content}\n\n`;
  });

  transcript += `--------------------------------------------------\n`;
  transcript += `Exported via MAYA AI Companion (Owner: Rk Hacker)\n`;
  transcript += `--------------------------------------------------\n`;

  return transcript;
}

/**
 * Exports a snippet or full conversation history to local device storage (.txt, .md, or .json)
 */
export function exportConversationToStorage(messages: Message[], options: ExportOptions = {}): boolean {
  if (!messages || messages.length === 0) return false;

  const format = options.format || 'txt';
  const sanitizeTitle = (options.title || 'Maya_Chat').replace(/[^a-zA-Z0-9_-]/g, '_');
  const filename = `${sanitizeTitle}_${Date.now()}.${format}`;

  let blob: Blob;
  if (format === 'json') {
    const data = {
      exportMetadata: {
        title: options.title || 'Maya AI Chat',
        exportedAt: new Date().toISOString(),
        owner: 'Rk Hacker',
        app: 'Maya AI Companion',
        language: options.languageName,
        outfit: options.outfitName,
        hairstyle: options.hairstyleName,
      },
      messages: messages.map(m => ({
        role: m.role,
        content: m.content,
        timestamp: m.createdAt,
      })),
    };
    blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  } else {
    const textContent = formatConversationText(messages, options);
    blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
  }

  try {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    return true;
  } catch (err) {
    console.error('Error downloading conversation file:', err);
    return false;
  }
}

/**
 * Shares a snippet of the conversation via Web Share API or copies to clipboard
 */
export async function shareConversationSnippet(messages: Message[], options: ExportOptions = {}): Promise<{ shared: boolean; method: 'web-share' | 'clipboard' }> {
  if (!messages || messages.length === 0) {
    return { shared: false, method: 'clipboard' };
  }

  // Take the last 4-6 messages for a concise share snippet
  const snippetMessages = messages.slice(-6);
  const formattedText = formatConversationText(snippetMessages, options);

  if (typeof navigator !== 'undefined' && navigator.share) {
    try {
      await navigator.share({
        title: options.title || 'Maya AI Conversation',
        text: formattedText,
      });
      return { shared: true, method: 'web-share' };
    } catch (shareErr) {
      // User cancelled share or browser rejected; fallback to clipboard below
    }
  }

  // Fallback to Clipboard Copy
  try {
    await navigator.clipboard.writeText(formattedText);
    return { shared: true, method: 'clipboard' };
  } catch (clipErr) {
    console.error('Failed to copy conversation to clipboard:', clipErr);
    return { shared: false, method: 'clipboard' };
  }
}
