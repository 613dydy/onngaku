import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-app.js";
import { getAuth, signInWithPopup, GoogleAuthProvider, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs, query, where } from "https://www.gstatic.com/firebasejs/10.5.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCcvZw3O1P8mW-__Xw7tYXfLwEuaTy86h8",
  authDomain: "saikyolink-bec71.firebaseapp.com",
  projectId: "saikyolink-bec71",
  storageBucket: "saikyolink-bec71.firebasestorage.app",
  messagingSenderId: "315435284061",
  appId: "1:315435284061:web:0c220f11009f3a384a7fb4",
  measurementId: "G-RVQDYP1K04"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

document.getElementById("loginBtn").onclick = async () => {
  const provider = new GoogleAuthProvider();
  await signInWithPopup(auth, provider);
};

onAuthStateChanged(auth, async (user) => {
  if (user) {
    document.getElementById("main").style.display = "block";
    window.currentUser = user;
    window.db = db;
    window.uid = user.uid;
    loadVideos();
  }
});
