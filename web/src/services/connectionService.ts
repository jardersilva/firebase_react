import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { Connection } from '../types';

const COLLECTION = 'connections';

export const createConnection = async (userId: string, name: string): Promise<string> => {
  const docRef = await addDoc(collection(db, COLLECTION), {
    name,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateConnection = async (id: string, data: Partial<Connection>): Promise<void> => {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteConnection = async (id: string): Promise<void> => {
  const ref = doc(db, COLLECTION, id);
  await deleteDoc(ref);
};
