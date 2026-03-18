import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Contact } from '../types';

const useContacts = (userId: string | undefined, connectionId: string | undefined) => {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId || !connectionId) {
      setContacts([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'contacts'),
      where('userId', '==', userId),
      where('connectionId', '==', connectionId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() } as Contact))
          .sort((a, b) => {
            const ta = a.createdAt?.toMillis?.() || 0;
            const tb = b.createdAt?.toMillis?.() || 0;
            return tb - ta;
          });
        setContacts(data);
        setLoading(false);
      },
      (err) => {
        console.error('Erro ao carregar contatos:', err);
        setError(err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [userId, connectionId]);

  return { contacts, loading, error };
};

export default useContacts;
