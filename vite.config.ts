import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Thiết lập base: './' để đảm bảo mọi tài nguyên tĩnh, scripts, styles và file public/questions.md
  // hoạt động chuẩn xác với đường dẫn tương đối trên mọi tên repository của GitHub Pages
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
  },
  server: {
    port: 3000,
    open: true,
  },
});
