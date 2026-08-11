import { db } from '@/lib/firebaseConfig';
import { collection, addDoc } from 'firebase/firestore';
import { ReservationFormDataType } from '../types/ReservationFormData';


export async function saveReservationToFirestore(data: ReservationFormDataType) {
  
  try {
    const docRef = await addDoc(collection(db, 'reservations'), {
      ...data,
      createdAt: new Date().toISOString(),
    });

    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('❌ Failed to save reservation:', error);
    return { success: false, error: 'Firestore save failed' };
  }
}
