// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getAuth,
  onAuthStateChanged,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";


// Your Firebase configuration (should match login.js)
const firebaseConfig = {
  apiKey: "AIzaSyBrFmRrodSjkuXh1vig3Pp5kg47xLjZmXI",
  authDomain: "fixaroo-ba396.firebaseapp.com",
  databaseURL: "https://fixaroo-ba396-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "fixaroo-ba396",
  storageBucket: "fixaroo-ba396.appspot.com",
  messagingSenderId: "1045822073352",
  appId: "1:1045822073352:web:5b6a26b34522da2a37bfbd",
  measurementId: "G-JTQY4MX6KW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth();
const authButton = document.getElementById("authButton")

// Handle user authentication state
onAuthStateChanged(auth, (user) => {
    if (user) {
      authButton.innerHTML = '<a href="#" id="logoutLink" class="btn btn-outline-success service-btn"><b>Logout</b></a>';
      // Dynamically add event listener after updating innerHTML
      document.getElementById("logoutLink").addEventListener("click", async (e) => {
        e.preventDefault();
        try {
          await signOut(auth);
          localStorage.removeItem("loggedIn");
          alert("Logged out successfully.");
          authButton.innerHTML = '<a href="login" class="btn btn-outline-success service-btn"><b>Login</b></a>';
        } catch (error) {
          console.error("Error signing out:", error);
          alert("Error signing out: " + error.message);
        }
      });
    } else {
          window.location.href = "#";
    }
  });

