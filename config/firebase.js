// firebase.js
import { initializeApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence } from "firebase/auth";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCkLC69taWgCt_78N0hSw5nYyPjomuKXqg",
  authDomain: "allmygroceries-941b1.firebaseapp.com",
  projectId: "allmygroceries-941b1",
  storageBucket: "allmygroceries-941b1.appspot.com",
  messagingSenderId: "811877932672",
  appId: "1:811877932672:web:fd9b1a4384a0f0fdd21065"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication with persistence
const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

export { auth };
