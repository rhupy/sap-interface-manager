sap-interface-manager/
├── src/ # 메인 소스 코드
│ ├── main/ # Electron 메인 프로세스
│ │ ├── main.ts # Electron 진입점
│ │ └── preload.ts # Preload 스크립트 (Renderer와 통신용)
│ ├── renderer/ # React 렌더러 프로세스
│ │ ├── components/ # 재사용 가능한 컴포넌트
│ │ │ └── Button.tsx
│ │ ├── pages/ # 페이지별 컴포넌트
│ │ │ └── Home.tsx
│ │ ├── styles/ # Styled-Components 전역 스타일 및 테마
│ │ │ ├── GlobalStyle.ts
│ │ │ └── theme.ts
│ │ ├── App.tsx # React 앱 루트
│ │ └── index.tsx # Renderer 진입점
│ └── assets/ # 정적 파일 (이미지, 아이콘 등)
├── public/ # Electron 정적 파일
│ ├── index.html # HTML 템플릿
│ └── icon.ico # 앱 아이콘
├── .eslintrc.js # ESLint 설정
├── .prettierrc # Prettier 설정
├── tsconfig.json # TypeScript 설정
├── package.json # 프로젝트 메타데이터 및 의존성
└── README.md # 프로젝트 설명
