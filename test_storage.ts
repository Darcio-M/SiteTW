import { initializeApp } from 'firebase/app';
import { getStorage, ref, uploadString, getDownloadURL } from 'firebase/storage';
import fs from 'fs';

const config = JSON.parse(fs.readFileSync('firebase-applet-config.json', 'utf8'));
const app = initializeApp(config);
const storage = getStorage(app);

async function test() {
  try {
    const storageRef = ref(storage, 'test.txt');
    await uploadString(storageRef, 'hello world');
    const url = await getDownloadURL(storageRef);
    console.log("Success:", url);
    process.exit(0);
  } catch (err) {
    console.error("Storage error:", err.message);
    process.exit(1);
  }
}
test();
