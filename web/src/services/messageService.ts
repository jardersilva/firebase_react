import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
  Timestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Message } from '../types';

const COLLECTION = 'messages';

export const createMessage = async (userId: string, connectionId: string, contactIds: string[], content: string, scheduledAt: string | null = null): Promise<string> => {
  const now = new Date();
  const isScheduled = scheduledAt && new Date(scheduledAt) > now;

  const data: Partial<Message> = {
    content,
    contactIds,
    connectionId,
    userId,
    status: isScheduled ? 'scheduled' : 'sent',
    scheduledAt: scheduledAt ? Timestamp.fromDate(new Date(scheduledAt)) : null,
    sentAt: isScheduled ? undefined : (serverTimestamp() as any),
    createdAt: serverTimestamp() as any,
    updatedAt: serverTimestamp() as any,
  };

  const docRef = await addDoc(collection(db, COLLECTION), data);
  return docRef.id;
};

export const updateMessage = async (id: string, data: Partial<Message> & { scheduledAt?: string }): Promise<void> => {
  const updateData: any = { ...data, updatedAt: serverTimestamp() };

  if (data.scheduledAt) {
    const now = new Date();
    const schedDate = new Date(data.scheduledAt);
    updateData.scheduledAt = Timestamp.fromDate(schedDate);
    updateData.status = schedDate > now ? 'scheduled' : 'sent';
    if (schedDate <= now) {
      updateData.sentAt = serverTimestamp();
    }
  }

  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, updateData);
};

export const deleteMessage = async (id: string): Promise<void> => {
  const ref = doc(db, COLLECTION, id);
  await deleteDoc(ref);
};
