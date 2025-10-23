import { ImageResponse } from 'next/og';

// API Route에서는 runtime만 사용 (alt/size/contentType X)
export const runtime = 'edge';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const title = searchParams.get('title') ?? '3, 2, 1 SNAP!';
  const rule  = searchParams.get('rule')  ?? '입 벌리면 SNAP';
  const tags  = searchParams.get('tags')  ?? '#PlayChallenge #15s';
  const sec   = Math.max(5, Math.min(60, Number(searchParams.get('sec') ?? '15')));
  const theme = searchParams.get('theme') ?? '#ff5078';

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%',
          display:'flex', flexDirection:'column', justifyContent:'space-between',
          background: 'linear-gradient(180deg, #0b0b0f 0%, #000 60%)',
          color:'#fff', fontFamily:'system-ui, Segoe UI, Arial', padding: 80
        }}
      >
        <div style={{fontSize:48, opacity:.85}}>#PlayChallenge</div>
        <div style={{textAlign:'center'}}>
          <div style={{fontSize:96, fontWeight:900, lineHeight:1.05, marginBottom:20}}>{title}</div>
          <div style={{display:'inline-block', padding:'12px 20px', borderRadius:999, background:theme, color:'#000', fontWeight:900}}>
            {sec}s
          </div>
          <div style={{marginTop:36, fontSize:44, opacity:.9}}>{rule}</div>
        </div>
        <div style={{display:'flex', justifyContent:'space-between', alignItems:'center'}}>
          <div style={{width:200, height:200, borderRadius:32, background:'#121219', border:`4px solid ${theme}`}} />
          <div style={{textAlign:'right', fontSize:40, opacity:.85}}>{tags}</div>
        </div>
      </div>
    ),
    // 여기서 width/height 지정 (API Route에서는 옵션으로 전달)
    { width: 1080, height: 1920 }
  );
}
