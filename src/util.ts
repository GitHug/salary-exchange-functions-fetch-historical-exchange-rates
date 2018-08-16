import * as admin from 'firebase-admin';

export const getTimestamp = () => {
  return admin.firestore.FieldValue.serverTimestamp();
}