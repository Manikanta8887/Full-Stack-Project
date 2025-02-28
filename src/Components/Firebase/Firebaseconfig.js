import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";


const firebaseConfig = {
  apiKey: "AIzaSyC1j4LnkedAUH2cEHyKr_PnrShSilacU5M",
  authDomain: "touch-live-7a1f8.firebaseapp.com",
  projectId: "touch-live-7a1f8",
  storageBucket: "touch-live-7a1f8.firebasestorage.app",
  messagingSenderId: "1062942612558",
  appId: "1:1062942612558:web:7a7d3cec7549d17ab0371f"
};

const app = initializeApp(firebaseConfig);
const GoogleProvider = new GoogleAuthProvider();
const Auth = getAuth();

export {GoogleProvider, Auth, app}
