import { defineConfig } from 'vite';

export default defineConfig(({ mode }) => ({
  // 상대 경로로 빌드: GitHub Pages(하위 경로), 다른 정적 호스팅, 오프라인 폴더 어디서나 동작
  base: './',
  build: {
    rollupOptions: {
      output: {
        // Phaser(게임 엔진)는 따로 떼어 두면, 게임 내용만 고쳐 다시 배포할 때 엔진 파일은 브라우저 캐시를 그대로 쓴다.
        // 단일 파일 백업(--mode single)은 스크립트 하나로 합쳐야 하므로 나누지 않는다.
        manualChunks: mode === 'single' ? undefined : { phaser: ['phaser'] },
      },
    },
    chunkSizeWarningLimit: 1600,
  },
}));
