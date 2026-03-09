import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION = 'contacts';

export const createContact = async (userId, connectionId, name, phone) => {
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

export const updateContact = async (id, data) => {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteContact = async (id) => {
  const ref = doc(db, COLLECTION, id);
  await deleteDoc(ref);
};
