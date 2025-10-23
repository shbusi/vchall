'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const [title, setTitle] = useState('3, 2, 1 SNAP!');
  const [rule, setRule] = useState('입 벌리면 SNAP, 핀치하면 SNAP');
  const [tags, setTags] = useState('#PlayChallenge #15s');
  const [sec, setSec] = useState(15);
  const [theme, setTheme] = useState('#ff5078');
  const [beep, setBeep] = useState(true);
  const router = useRouter();

  const q = new URLSearchParams({
    title, rule, tags, sec: String(sec), theme, beep: beep ? '1' : '0',
  }).toString();

  return (
    <main style={{maxWidth:720, margin:'40px auto', padding:'0 16px', fontFamily:'system-ui, sans-serif'}}>
      <h1 style={{fontSize:28, fontWeight:800, marginBottom:8}}>Shorts Challenge Kit</h1>
      <p style={{opacity:.75, marginBottom:24}}>촬영 오버레이와 썸네일(카드)을 즉시 생성합니다.</p>

      <label>제목</label>
      <input value={title} onChange={e=>setTitle(e.target.value)} />

      <label>룰(한 줄)</label>
      <input value={rule} onChange={e=>setRule(e.target.value)} />

      <label>해시태그</label>
      <input value={tags} onChange={e=>setTags(e.target.value)} />

      <div style={{display:'flex', gap:12}}>
        <div style={{flex:1}}>
          <label>길이(초)</label>
          <input type="number" min={5} max={60} value={sec} onChange={e=>setSec(Number(e.target.value))}/>
        </div>
        <div style={{flex:1}}>
          <label>테마 색</label>
          <input type="color" value={theme} onChange={e=>setTheme(e.target.value)}/>
        </div>
      </div>

      <label style={{display:'flex', alignItems:'center', gap:8}}>
        <input type="checkbox" checked={beep} onChange={e=>setBeep(e.target.checked)} />
        카운트다운 비프 사용
      </label>

      <div style={{display:'flex', gap:12, marginTop:20}}>
        <button onClick={()=>router.push(`/overlay?${q}`)} className="btn primary">촬영 오버레이 열기</button>
        <a href={`/api/og?${q}`} download className="btn">썸네일 PNG 받기</a>
      </div>

      <style jsx>{`
        label { display:block; font-weight:700; margin:12px 0 6px; }
        input[type="text"], input:not([type]) , input[type="number"] {
          width:100%; padding:10px 12px; border-radius:12px; border:1px solid #ddd; font-size:16px;
        }
        .btn { padding:12px 16px; border-radius:12px; border:1px solid #ddd; text-decoration:none; }
        .btn.primary { background:#111; color:#fff; border-color:#111; }
      `}</style>
    </main>
  );
}
