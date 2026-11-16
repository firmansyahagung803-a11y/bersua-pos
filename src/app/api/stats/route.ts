import { NextResponse } from 'next/server';
import { getDashboardStats } from '@/backend/services/stats.service';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || 'today';
    const stats = await getDashboardStats(period);
    return NextResponse.json(stats);
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Error' }, { status: 500 });
  }
}
