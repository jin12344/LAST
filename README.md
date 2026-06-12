# 사진 위치 자동분류 웹앱

Next.js 14 + React + TypeScript + Tailwind CSS로 만든, 사진의 EXIF GPS 정보를 기반으로
위치별 그룹을 자동으로 분류해주는 웹앱입니다.

## 기술 스택

- Next.js 14 (App Router) + React 18 + TypeScript
- Tailwind CSS
- Firebase Auth v9 / Realtime Database v9
- EXIF 추출: piexifjs (CDN 로드)
- 배포: Vercel

## 시작하기

```bash
npm install
```

`.env.local.example`을 복사해 `.env.local`을 만들고 Firebase 프로젝트 값을 입력합니다.

```bash
cp .env.local.example .env.local
```

```bash
npm run dev
```

## Firebase 설정

1. Firebase 콘솔에서 프로젝트를 생성합니다.
2. Authentication > 이메일/비밀번호 로그인을 활성화합니다.
3. Realtime Database를 생성하고 `database.rules.json`의 규칙을 적용합니다.
4. 프로젝트 설정에서 웹 앱을 추가하고 `.env.local`에 설정 값을 입력합니다.

## 배포 (Vercel)

1. GitHub에 저장소를 푸시합니다.
2. Vercel에서 해당 저장소를 Import 합니다.
3. Environment Variables에 다음 값을 등록합니다.
   - `NEXT_PUBLIC_FIREBASE_API_KEY`
   - `NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN`
   - `NEXT_PUBLIC_FIREBASE_DATABASE_URL`
   - `NEXT_PUBLIC_FIREBASE_PROJECT_ID`
4. Deploy를 실행합니다.

## 주요 기능

- 이메일/비밀번호 회원가입, 로그인, 비밀번호 찾기/변경
- 프로젝트 생성/목록/삭제
- 드래그&드롭 사진 업로드 (최대 100장, 중복 제거)
- EXIF GPS 자동 추출 및 50m 반경 위치 그룹화 (Haversine)
- 위치정보 없는 사진은 "위치정보 없음" 그룹으로 분류
- 위치 그룹명 수정 (Firebase 실시간 업데이트)
