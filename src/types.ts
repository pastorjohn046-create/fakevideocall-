export interface Message {
  id: string;
  sender: string;
  content: string;
  timestamp: string;
  chatId: string;
  type?: 'text' | 'audio' | 'image' | 'sticker';
  duration?: number;
  mediaUrl?: string;
}

export interface Chat {
  id: string;
  name: string;
  avatar: string;
  lastMessage?: string;
  unreadCount?: number;
}

export interface CallSignal {
  type: 'offer' | 'answer' | 'candidate';
  signal: any;
  from: string;
  chatId: string;
}

export interface Persona {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'video';
}

export interface User {
  id: string;
  username: string;
  avatar: string;
  bio?: string;
  location?: string;
  website?: string;
  joinedAt?: string;
  status?: 'online' | 'away' | 'busy' | 'offline';
  aiPersona?: string; // For "DeepFake" mode
  settings?: {
    notifications: boolean;
    darkMode: boolean;
    readReceipts: boolean;
    deepfakeEnabled?: boolean;
  };
  customPersonas?: Persona[];
  stats?: {
    messagesSent: number;
    groupsJoined: number;
    mediaShared: number;
  };
}
