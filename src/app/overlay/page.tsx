'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { FilesetResolver, FaceLandmarker, HandLandmarker, type FaceLandmarkerResult, type HandLandmarkerResult } from '@mediapipe/tasks-vision';

function useQuery() {
  if (typeof window === 'undefined') return new URLSearchParams();
  return new URLSearchParams(window.location.search);
}

export default function Overlay() {
  // ---------- URL Params ----------
  const q = useQuery();
  const title = q.get('title') ?? '3, 2, 1 SNAP!';
  const rule  = q.get('rule')  ?? '손가락 튕기면 폭죽!';
  const tags  = q.get('tags')  ?? '#PlayChallenge #15s';
  const sec   = Math.max(5, Math.min(60, Number(q.get('sec') ?? '15')));
  const theme = q.get('theme') ?? '#ff5078';
  const doBeep = (q.get('beep') ?? '1') === '1';

  // ---------- UI & timer ----------
  const [phase, setPhase] = useState<'idle'|'count'|'run'|'done'>('idle');
  const [t, setT] = useState(0); // remaining seconds
  const raf = useRef<number | null>(null);
  const startAt = useRef<number | null>(null);

  // ---------- Camera ----------
  const videoRef = useRef<HTMLVideoElement|null>(null);
  const [useCam, setUseCam] = useState(true);
  const [facing, setFacing] = useState<'user'|'environment'>('user');

  async function startCam() {
    if (!videoRef.current) return;
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: facing, width: { ideal: 1080 }, height: { ideal: 1920 } },
      audio: false,
    });
    videoRef.current.srcObject = stream;
    await videoRef.current.play();
  }
  function stopCam() {
    const s = (videoRef.current?.srcObject as MediaStream|undefined);
    s?.getTracks().forEach(t=>t.stop());
  }
  useEffect(()=>{ useCam ? startCam() : stopCam(); return ()=>stopCam(); }, [useCam, facing]);

  // ---------- Beep/Vibrate ----------
  const beep = useMemo(()=> {
    if (!doBeep) return () => {};
    const ctx = typeof window !== 'undefined' ? new (window.AudioContext || (window as any).webkitAudioContext)() : null;
    return (freq=880, ms=120) => {
      if (!ctx) return;
      const o = ctx.createOscillator(); const g = ctx.createGain();
      o.type='square'; o.frequency.value=freq;
      o.connect(g); g.connect(ctx.destination);
      g.gain.setValueAtTime(0.22, ctx.currentTime);
      o.start();
      setTimeout(()=>{ o.stop(); }, ms);
    };
  }, [doBeep]);
  function vibr(ms=60){ if (navigator.vibrate) navigator.vibrate(ms); }

  // ---------- Progress ring ----------
  const ringSize = 240;
  const stroke = 10;
  const radius = (ringSize - stroke)/2;
  const length = 2*Math.PI*radius;

  // ---------- Effects ----------
  const [flash, setFlash] = useState(false);
  const [snapText, setSnapText] = useState<string | null>(null);
  const lastSnapAt = useRef(0);
  function triggerSnap(label='SNAP!') {
    const now = performance.now();
    if (now - lastSnapAt.current < 800) return; // debounce
    lastSnapAt.current = now;
    setSnapText(label);
    setFlash(true);
    beep(1000,160); vibr(90);
    setTimeout(()=>setFlash(false), 120);
    setTimeout(()=>setSnapText(null), 500);
  }

  // ---------- Timer loop ----------
  function start() {
    setPhase('count');
    let c = 3;
    const step = () => {
      beep(700,120); vibr(50);
      if (c === 1) { // GO
        beep(1000,180); vibr(80);
        setPhase('run');
        setT(sec);
        startAt.current = performance.now();
        raf.current = requestAnimationFrame(loop);
      } else {
        setTimeout(step, 750);
      }
      c--;
    };
    step();
  }
  function loop() {
    if (phase !== 'run') return;
    const now = performance.now();
    const elapsed = (now - (startAt.current ?? now)) / 1000;
    const remain = Math.max(0, sec - elapsed);
    setT(remain);
    if (remain <= 0.01) { setPhase('done'); beep(500,300); vibr(120); return; }
    raf.current = requestAnimationFrame(loop);
  }
  useEffect(()=>()=>{ if (raf.current) cancelAnimationFrame(raf.current); }, []);

  // ---------- MediaPipe (Face + Hand) ----------
  const faceRef = useRef<FaceLandmarker | null>(null);
  const handRef = useRef<HandLandmarker | null>(null);
  const [dbg, setDbg] = useState({ mouthOpen: 0, eyeBlinkL: 0, eyeBlinkR: 0, pinch: 1 });

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const vision = await FilesetResolver.forVisionTasks(
          'https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm'
        );

        const face = await FaceLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: '/models/face_landmarker.task' },
          numFaces: 1,
          runningMode: 'VIDEO',
          outputFaceBlendshapes: true,
          outputFacialTransformationMatrixes: false,
        });

        const hand = await HandLandmarker.createFromOptions(vision, {
          baseOptions: { modelAssetPath: '/models/hand_landmarker.task' },
          numHands: 1,
          runningMode: 'VIDEO',
        });

        if (!mounted) return;
        faceRef.current = face;
        handRef.current = hand;
      } catch (e) {
        console.error('Model load/init failed. Put .task files under /public/models', e);
        alert('모델(.task) 파일이 없습니다. /public/models/ 에 face_landmarker.task, hand_landmarker.task를 넣어주세요.');
      }
    })();

    return () => { mounted = false; };
  }, []);

  // detection loop (~30fps)
  useEffect(() => {
    let rafId: number | null = null;
    let lastT = 0;

    const step = () => {
      rafId = requestAnimationFrame(step);
      if (phase !== 'run') return;
      const v = videoRef.current;
      if (!v || v.readyState < 2) return;

      const now = performance.now();
      if (now - lastT < 33) return; // ~30fps
      lastT = now;

      // FACE
      const fRes: FaceLandmarkerResult | undefined = faceRef.current?.detectForVideo(v);
      let mouthOpen = 0, eyeL = 0, eyeR = 0;
      if (fRes?.faceBlendshapes?.length) {
        const cats = fRes.faceBlendshapes[0].categories;
        const val = (name: string) => cats.find(c=>c.categoryName===name)?.score ?? 0;
        mouthOpen = val('mouthOpen');
        eyeL = val('eyeBlinkLeft');
        eyeR = val('eyeBlinkRight');
        if (mouthOpen > 0.65) triggerSnap('MOUTH!');
        if (eyeL > 0.75 && eyeR < 0.35) triggerSnap('WINK!');
        if (eyeR > 0.75 && eyeL < 0.35) triggerSnap('WINK!');
      }

      // HAND (엄지-검지 핀치)
      const hRes: HandLandmarkerResult | undefined = handRef.current?.detectForVideo(v);
      let pinch = 1;
      if (hRes?.landmarks?.length) {
        const lm = hRes.landmarks[0];
        const tip4 = lm[4];  // thumb tip
        const tip8 = lm[8];  // index tip
        const dx = tip4.x - tip8.x, dy = tip4.y - tip8.y;
        pinch = Math.hypot(dx, dy);
        if (pinch < 0.055) triggerSnap('PINCH!');
      }

      setDbg({ mouthOpen, eyeBlinkL: eyeL, eyeBlinkR: eyeR, pinch });
    };

    rafId = requestAnimationFrame(step);
    return () => { if (rafId) cancelAnimationFrame(rafId); };
  }, [phase]);

  const progress = phase==='run' ? (1 - (t/sec)) : 0;

  return (
    <div style={{position:'fixed', inset:0, background:'#000', color:'#fff', fontFamily:'system-ui, sans-serif'}}>
      {/* camera layer */}
      {useCam && (
        <video
          ref={videoRef}
          playsInline autoPlay muted
          style={{
            position:'fixed', inset:0, width:'100%', height:'100%',
            objectFit:'cover', transform: facing==='user'?'scaleX(-1)':'none', zIndex:0
          }}
        />
      )}

      <div style={{position:'absolute', inset:'0', pointerEvents:'none', outline:'2px dashed rgba(255,255,255,.08)', outlineOffset:'-24px'}}/>

      <div style={{position:'absolute', top:24, left:24, right:24, textAlign:'center', zIndex:2}}>
        <div style={{fontSize:28, fontWeight:900}}>{title}</div>
        <div style={{marginTop:8, opacity:.9}}>{rule}</div>
      </div>

      <div style={{position:'absolute', left:16, right:16, bottom:16, textAlign:'center', opacity:.9, fontWeight:700, zIndex:2}}>
        {tags}
      </div>

      <div style={{position:'absolute', left:'50%', top:'50%', transform:'translate(-50%,-50%)', textAlign:'center', zIndex:2}}>
        <svg width={ringSize} height={ringSize}>
          <circle cx={ringSize/2} cy={ringSize/2} r={radius} stroke="rgba(255,255,255,.1)" strokeWidth={stroke} fill="none"/>
          <circle
            cx={ringSize/2} cy={ringSize/2} r={radius}
            stroke={theme} strokeWidth={stroke} fill="none"
            strokeDasharray={`${length} ${length}`}
            strokeDashoffset={`${length - length*progress}`}
            strokeLinecap="round"
            style={{transform:'rotate(-90deg)', transformOrigin:'50% 50%', transition:'stroke-dashoffset .1s linear'}}
          />
        </svg>
        <div style={{marginTop:8, fontSize:48, fontWeight:900, letterSpacing:1}}>
          {phase==='run' ? Math.ceil(t) : (phase==='count' ? 'READY' : (phase==='done' ? 'DONE' : ''))}
        </div>
      </div>

      <div style={{position:'absolute', left:0, right:0, bottom:80, display:'flex', justifyContent:'center', gap:8, zIndex:3}}>
        <button onClick={()=>setUseCam(v=>!v)} className="btn">{useCam?'CAM OFF':'CAM ON'}</button>
        {useCam && <button onClick={()=>setFacing(f=>f==='user'?'environment':'user')} className="btn">FLIP</button>}
        {phase==='idle' && <button onClick={start} className="btn primary">START</button>}
        {phase==='run'  && <button onClick={()=>{ setPhase('done'); if (raf.current) cancelAnimationFrame(raf.current); }} className="btn">STOP</button>}
        {phase==='done' && <button onClick={()=>{ setPhase('idle'); setT(0); }} className="btn">RESET</button>}
      </div>

      {flash && <div style={{position:'fixed', inset:0, background:'#fff', opacity:0.35, zIndex:4}}/>}
      {snapText && <div style={{
        position:'fixed', left:'50%', top:'40%', transform:'translate(-50%,-50%)',
        fontSize:56, fontWeight:900, letterSpacing:2, zIndex:5,
        padding:'8px 16px', background:'rgba(0,0,0,.35)', borderRadius:12, border:`2px solid ${theme}`
      }}>{snapText}</div>}

      <style jsx>{`
        .btn {
          padding:12px 16px; border-radius:999px; font-size:16px; font-weight:900;
          border:1px solid #333; color:#fff; background:rgba(255,255,255,0.08);
          backdrop-filter: blur(6px);
        }
        .btn.primary { background:${theme}; color:#000; border-color:${theme}; }
      `}</style>

      <div style={{position:'absolute', left:12, top:12, zIndex:5, fontSize:12, opacity:.8}}>
        mouthOpen {dbg.mouthOpen.toFixed(2)} | eyeL {dbg.eyeBlinkL.toFixed(2)} | eyeR {dbg.eyeBlinkR.toFixed(2)} | pinch {dbg.pinch.toFixed(3)}
      </div>
    </div>
  );
}
