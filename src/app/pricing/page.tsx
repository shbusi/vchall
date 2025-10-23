'use client';
import { useMemo } from 'react';

export default function Pricing() {
  const checkoutUrl = process.env.NEXT_PUBLIC_LS_CHECKOUT_URL || '#';
  const canBuy = useMemo(() => checkoutUrl.startsWith('https://'), [checkoutUrl]);

  const openOverlay = () => {
    // @ts-ignore
    if (window?.LemonSqueezy?.Url?.Open && canBuy) {
      // @ts-ignore
      window.LemonSqueezy.Url.Open(checkoutUrl);
    } else if (canBuy) {
      window.location.href = checkoutUrl;
    } else {
      alert('환경변수 NEXT_PUBLIC_LS_CHECKOUT_URL 을 설정하세요.');
    }
  };

  return (
    <main style={{maxWidth:720, margin:'40px auto', padding:'0 16px', fontFamily:'system-ui'}}>
      <h1 style={{fontSize:28, fontWeight:900}}>Pricing</h1>
      <ul style={{lineHeight:1.8}}>
        <li><b>FREE</b>: 15초, 워터마크, 기본 테마</li>
        <li><b>PRO(30일)</b>: 60초, 워터마크 제거, 커스텀 테마/로고, 추가 이펙트</li>
      </ul>
      <div style={{marginTop:24}}>
        <a className="lemonsqueezy-button" href={canBuy ? checkoutUrl : '#'}
           onClick={(e)=>{ e.preventDefault(); openOverlay(); }}>
          <button style={{padding:'12px 16px', borderRadius:12, border:'1px solid #111', background:'#111', color:'#fff'}}>
            Unlock Pro
          </button>
        </a>
      </div>
    </main>
  );
}
