// Firebase Configuration
const firebaseConfig = {
  apiKey: "AIzaSyCi7VY8ge8_8VR0NhCkQXWGCTuTEiIrC6I",
  authDomain: "easy-earning-app-990d9.firebaseapp.com",
  databaseURL: "https://easy-earning-app-990d9-default-rtdb.firebaseio.com",
  projectId: "easy-earning-app-990d9",
  storageBucket: "easy-earning-app-990d9.firebasestorage.app",
  messagingSenderId: "344566716068",
  appId: "1:344566716068:web:f2ce033a68a26b9f10f831",
};

// Initialize Firebase
if (!firebase.apps.length) {
  firebase.initializeApp(firebaseConfig);
}

// Global Firebase Services Reference (Auth & Realtime DB only)
const auth = firebase.auth();
const db = firebase.database();
