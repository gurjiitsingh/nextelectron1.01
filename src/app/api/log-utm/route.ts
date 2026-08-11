// app/api/log-utm/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const docRef = await addDoc(collection(db, 'googleVisitors'), {
      ...body,
      createdAt: serverTimestamp(),
    });

    return NextResponse.json({ status: 'ok', id: docRef.id });
  } catch (error) {
    console.error('UTM Tracking Error:', error);
    return NextResponse.json({ error: 'Failed to log UTM data' }, { status: 500 });
  }
}
