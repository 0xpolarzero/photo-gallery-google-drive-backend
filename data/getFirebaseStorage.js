import { initializeApp } from 'firebase/app';
import {
  getStorage,
  ref,
  listAll,
  getDownloadURL,
  getMetadata,
} from 'firebase/storage';

// const serviceAccount = JSON.parse(
//   process.env.NEXT_PUBLIC_FIREBASE_SERVICE_ACCOUNT_KEY,
// );

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

const firebaseApp = initializeApp(firebaseConfig);
export const firebaseStorage = getStorage(firebaseApp);

export const getFirebaseFiles = async () => {
  let files = [];
  // Get urls to display all photos in the storage bucket
  const listRef = ref(firebaseStorage);
  const res = await listAll(listRef, { maxResults: 1000 });

  for (const item of res.items) {
    const url = await getDownloadURL(item);
    const metadata = await getMetadata(item);
    files.push({ ...metadata, url });
  }

  return files;
};
