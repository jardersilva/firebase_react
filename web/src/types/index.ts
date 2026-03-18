import { Timestamp } from 'firebase/firestore';
import { User } from 'firebase/auth';

export interface Connection {
  id: string;
  name: string;
  userId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Contact {
  id: string;
  name: string;
  phone: string;
  connectionId: string;
  userId: string;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface Message {
  id: string;
  content: string;
  contactIds: string[];
  connectionId: string;
  userId: string;
  status: 'sent' | 'scheduled';
  scheduledAt?: Timestamp | null;
  sentAt?: Timestamp;
  createdAt?: Timestamp;
  updatedAt?: Timestamp;
}

export interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, pass: string) => Promise<void>;
  signUp: (email: string, pass: string) => Promise<void>;
  logout: () => Promise<void>;
}
