import { useState, useEffect } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../config/firebase';
import { Message } from '../types';

const useMessages = (userId: string | undefined, connectionId: string | undefined, statusFilter: string | null = null) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!userId || !connectionId) {
      setMessages([]);
      setLoading(false);
      return;
    }

    const constraints = [
      where('userId', '==', userId),
      where('connectionId', '==', connectionId),
    ];

    if (statusFilter) {
      constraints.push(where('status', '==', statusFilter));
    }

    const q = query(collection(db, 'messages'), ...constraints);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const data = snapshot.docs
          .map((doc) => ({ id: doc.id, ...doc.data() } as Message))
          .sort((a, b) => {
            const ta = a.createdAt?.toMillis?.() || 0;
            const tb = b.createdAt?.toMillis?.() || 0;
            return tb - ta;
          });
        setMessages(data);
        setLoading(false);
      },
      (err) => {
        console.error('Erro ao carregar mensagens:', err);
        setError(err);
        setLoading(false);
      }
    );

    return unsubscribe;
  }, [userId, connectionId, statusFilter]);

  return { messages, loading, error };
};

export default useMessages;
