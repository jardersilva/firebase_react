import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Contact } from '../types';

const COLLECTION = 'contacts';

export const createContact = async (userId: string, connectionId: string, name: string, phone: string): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTION), {
    name,
    phone,
    connectionId,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateContact = async (id: string, data: Partial<Contact>): Promise<void> => {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteContact = async (id: string): Promise<void> => {
  const ref = doc(db, COLLECTION, id);
  await deleteDoc(ref);
};
