import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getFirestore, collection, addDoc } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyCdvok9f5GePgNJ3TKkzwLBoPAKxpKp_Eg",
  authDomain: "shaketohome-e658c.firebaseapp.com",
  projectId: "shaketohome-e658c",
  storageBucket: "shaketohome-e658c.appspot.com",
  messagingSenderId: "377634403267",
  appId: "1:377634403267:web:202d2923ca44a9b41f8376"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
