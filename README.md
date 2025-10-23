# Shorts Challenge Kit (Web AR)

## 1) 설치
```bash
npm i
```

## 2) 모델 파일 배치
MediaPipe Tasks 모델(.task) 두 개를 받아 `/public/models/` 폴더에 넣으세요:
- `face_landmarker.task`
- `hand_landmarker.task`

> 공식 배포본을 그대로 파일명 유지하여 넣으면 됩니다. (이 ZIP에는 모델이 포함되어 있지 않습니다.)

## 3) 로컬 실행
```bash
npm run dev
```

## 4) 휴대폰에서 테스트
- **권장**: Vercel에 푸시해서 **프리뷰 URL(https)**로 접속 → 카메라 권한 허용
- 또는 같은 Wi‑Fi에서 `http://<로컬IP>:3000` 접속(안드로이드 크롬은 비교적 관대, iOS는 https 권장)

## 5) 사용법
- `/`에서 텍스트·색·시간 설정 → **촬영 오버레이 열기**
- `/overlay?sec=15&title=...&rule=...&tags=...` 페이지에서 **CAM ON → START** → 
  - 입 크게 벌리기 (mouthOpen>0.65)
  - 한쪽 윙크 (eyeBlink>0.75)
  - 엄지-검지 핀치 (거리<0.055)
  → SNAP 이펙트/비프/진동
- 폰 **화면녹화 ON** 상태로 촬영하면 바로 쇼츠/릴스에 업로드 가능

## 6) 썸네일 PNG
- `/api/og?...` 링크로 1080x1920 PNG 자동 생성 → 업로드에 활용

## 7) 배포
- Vercel에 리포 연결 → 자동 프리뷰/프로덕션 URL 발급
- PWA: `manifest.json` 포함, 홈화면 추가로 풀스크린 사용 권장

## 8) 다음 단계(옵션)
- Three.js 파티클/텍스트 스티커를 `triggerSnap()`에 연결
- iOS 특화: MindAR로 이미지 타깃 트래킹 버전 추가
- Capacitor로 안드로이드 .apk 포장(웹앱 그대로 감싸기)
