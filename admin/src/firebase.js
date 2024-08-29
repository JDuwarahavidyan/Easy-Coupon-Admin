import { initializeApp } from "firebase/app";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyCSENmoReNdWayj0_AMTkAP16Zhbu7kGmk",
  authDomain: "easy-coupon-5ce03.firebaseapp.com",
  databaseURL: "https://easy-coupon-5ce03-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "easy-coupon-5ce03",
  storageBucket: "easy-coupon-5ce03.appspot.com",
  messagingSenderId: "1096357836745",
  appId: "1:1096357836745:web:699440bc8b629cfb099a18",
  measurementId: "G-ES11ZLY1F6"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const storage = getStorage(app);

export default storage;