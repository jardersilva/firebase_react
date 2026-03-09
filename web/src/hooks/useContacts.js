import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';

const useContacts = (userId, connectionId) => {
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
          .map((doc) => ({ id: doc.id, ...doc.data() }))
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
