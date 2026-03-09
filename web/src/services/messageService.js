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

const COLLECTION = 'messages';

export const createMessage = async (userId, connectionId, contactIds, content, scheduledAt = null) => {
  const now = new Date();
  const isScheduled = scheduledAt && new Date(scheduledAt) > now;

  const data = {
    content,
    contactIds,
    connectionId,
    userId,
    status: isScheduled ? 'scheduled' : 'sent',
    scheduledAt: scheduledAt ? Timestamp.fromDate(new Date(scheduledAt)) : null,
    sentAt: isScheduled ? null : serverTimestamp(),
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  };

  const docRef = await addDoc(collection(db, COLLECTION), data);
  return docRef.id;
};

export const updateMessage = async (id, data) => {
  const updateData = { ...data, updatedAt: serverTimestamp() };

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

export const deleteMessage = async (id) => {
  const ref = doc(db, COLLECTION, id);
  await deleteDoc(ref);
};
