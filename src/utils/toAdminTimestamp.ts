
import admin from 'firebase-admin';

export  function toAdminTimestamp(
  value?: string | null
): admin.firestore.Timestamp | null {
  if (!value) return null;

  const d = new Date(value);
  if (isNaN(d.getTime())) return null;

  return admin.firestore.Timestamp.fromDate(d);
}
