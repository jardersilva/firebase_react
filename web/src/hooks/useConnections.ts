import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Connection } from '../types';

const useConnections = (userId: string | undefined) => {
  const [connections, setConnections] = useState<Connection[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId) {
      setConnections([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'connections'),
      where('userId', '==', userId)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() } as Connection))
          .sort((a, b) => {
            const ta = a.createdAt?.toMillis?.() || 0;
            const tb = b.createdAt?.toMillis?.() || 0;
            return tb - ta;
          });
        setConnections(data);
        setLoading(false);
      },
      (err) => {
        console.error('Erro ao carregar conexões:', err);
        setError(err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [userId]);

  return { connections, loading, error };
};

export default useConnections;
