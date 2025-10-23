import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    // (MVP) 바로 PRO 쿠키 발급. 추후 Webhook/Order API 검증으로 강화 가능.
    const res = NextResponse.json({ ok: true });
    res.cookies.set('vchall', 'pro', {
      httpOnly: false, // MVP: 클라이언트에서 읽어 UI 토글
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 * 30, // 30일
    });
    return res;
  } catch {
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
