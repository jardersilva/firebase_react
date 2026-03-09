import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';

const COLLECTION = 'connections';

export const createConnection = async (userId, name) => {
  const docRef = await addDoc(collection(db, COLLECTION), {
    name,
    userId,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
  return docRef.id;
};

export const updateConnection = async (id, data) => {
  const ref = doc(db, COLLECTION, id);
  await updateDoc(ref, {
    ...data,
    updatedAt: serverTimestamp(),
  });
};

export const deleteConnection = async (id) => {
  const ref = doc(db, COLLECTION, id);
  await deleteDoc(ref);
};
