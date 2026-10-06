import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    feeNgn: 5000,
    paystackLive: Boolean(process.env.PAYSTACK_SECRET_KEY),
    aiReady: Boolean(process.env.GROQ_API_KEY),
  });
}
