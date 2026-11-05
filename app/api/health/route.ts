import {NextResponse} from 'next/server';
import {row} from '@/lib/db';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export function GET(){
  try {
    row('SELECT 1 AS healthy');
    return NextResponse.json({status:'ok'},{headers:{'Cache-Control':'no-store'}});
  } catch {
    return NextResponse.json({status:'unavailable'},{status:503});
  }
}
