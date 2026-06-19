import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface ChatContextType {
  isChatOpen: boolean;
  openChat: (prefillMessage?: string) => void;
  closeChat: () => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [isChatOpen, setIsChatOpen] = useState(false);

  const openChat = (prefillMessage?: string) => {
    setIsChatOpen(true);
    if (prefillMessage) {
      // Small delay ensures ChatPanel is mounted/rendered before catching the event
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('open-chat-with-message', { detail: prefillMessage }));
      }, 100);
    }
  };

  const closeChat = () => {
    setIsChatOpen(false);
  };

  return (
    <ChatContext.Provider value={{ isChatOpen, openChat, closeChat }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
}
