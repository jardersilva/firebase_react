import { onSchedule } from 'firebase-functions/v2/scheduler';
import { initializeApp } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

initializeApp();

const db = getFirestore();

export const processScheduledMessages = onSchedule(
  { schedule: 'every 1 minutes', timeZone: 'America/Sao_Paulo' },
  async () => {
    const now = new Date();

    const snapshot = await db
      .collection('messages')
      .where('status', '==', 'scheduled')
      .where('scheduledAt', '<=', now)
      .get();

    if (snapshot.empty) {
      return;
    }

    const batch = db.batch();
    let count = 0;

    snapshot.docs.forEach((doc) => {
      batch.update(doc.ref, {
        status: 'sent',
        sentAt: FieldValue.serverTimestamp(),
        updatedAt: FieldValue.serverTimestamp(),
      });
      count++;
    });

    await batch.commit();
    console.log(`[ScheduledTask] ${count} mensagem(ns) processada(s) com sucesso.`);
  }
);
