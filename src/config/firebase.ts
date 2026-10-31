/**
 * THẦN TỐC 1975 - CẤU HÌNH KẾT NỐI FIREBASE
 * Hỗ trợ đồng bộ Realtime Database giữa Màn hình Admin và Thiết bị Người chơi
 */

import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getDatabase, Database } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || 'dummy_api_key',
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || 'than-toc-1975.firebaseapp.com',
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL || 'https://than-toc-1975-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || 'than-toc-1975',
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || 'than-toc-1975.appspot.com',
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '123456789012',
  appId: import.meta.env.VITE_FIREBASE_APP_ID || '1:123456789012:web:abcdef1234567890',
};

let app: FirebaseApp | null = null;
let database: Database | null = null;

try {
  if (getApps().length === 0) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApps()[0];
  }
  database = getDatabase(app);
} catch (error) {
  console.warn('[Firebase] Khởi tạo ở chế độ Standalone / Offline (chưa cấu hình Firebase thật):', error);
}

export { app, database };
