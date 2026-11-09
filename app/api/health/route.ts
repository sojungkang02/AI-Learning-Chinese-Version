import {NextResponse} from 'next/server';
import {row} from '@/lib/db';
export const runtime='nodejs';
export const dynamic='force-dynamic';
export function GET(){
  try {
    row('SELECT 1 AS healthy');
    return NextResponse.json({status:'ok',release:'natural-outfits-preview-v1',commit:process.env.RENDER_GIT_COMMIT?.slice(0,7)||'local'},{headers:{'Cache-Control':'no-store'}});
  } catch {
    return NextResponse.json({status:'unavailable'},{status:503});
  }
}
