import { NextRequest, NextResponse } from 'next/server';
import { sendReservationConfirmationEmail } from '@/lib/email/sendReservationConfirmationEmail';
import { saveReservationToFirestore } from '@/lib/firestore/saveReservationToFirestore';
import { reservationSchema } from '@/lib/types/ReservationFormData';


export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = reservationSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json({ success: false, error: 'Invalid input' }, { status: 400 });
    }

    const data = parsed.data;

    //  Save to Firestore first
    const saveResult = await saveReservationToFirestore(data);

    if (!saveResult.success) {
      return NextResponse.json({ success: false, error: saveResult.error }, { status: 500 });
    }

    //  Then send email
    const result = await sendReservationConfirmationEmail(data);

    if (result.success) {
      return NextResponse.json({ success: true, message: 'Reservation saved and email sent' });
    } else {
      return NextResponse.json({ success: false, error: result.message || 'Email send failed' }, { status: 500 });
    }

  } catch (err) {
    console.error('Server error:', err);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
