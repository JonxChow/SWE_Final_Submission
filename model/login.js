import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore,
  collection,
  where,
  query,
  getDocs,
  doc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  sendEmailVerification,
  signOut,
  updateProfile,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";

// Your Firebase configuration
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
const db = getFirestore(app);

const loginPasswordInput = document.getElementById("loginPassword");
const registerPasswordInput = document.getElementById("registerPassword");
const registerConfirmPasswordInput = document.getElementById("registerConfirmPassword");

const toggleLoginPassword = document.getElementById('toggleLoginPassword');
const toggleRegisterPassword = document.getElementById('toggleRegisterPassword');
const toggleRegisterConfirmPassword = document.getElementById('toggleRegisterConfirmPassword');

toggleLoginPassword.addEventListener('click', () => {
  togglePasswordVisibility(loginPasswordInput, toggleLoginPassword);
});

toggleRegisterPassword.addEventListener('click', () => {
  togglePasswordVisibility(registerPasswordInput, toggleRegisterPassword);
});

toggleRegisterConfirmPassword.addEventListener('click', () => {
  togglePasswordVisibility(registerConfirmPasswordInput, toggleRegisterConfirmPassword);
});

// Handle "Show Password" toggles
function togglePasswordVisibility(passwordInput, toggleIcon) {
  const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
  console.log(type);
  passwordInput.setAttribute('type', type);
  toggleIcon.children[0].classList.toggle('fa-eye-slash');
  toggleIcon.children[0].classList.toggle('fa-eye');
}

// Accessibility: Allow toggling via keyboard (Enter and Space keys)
function addKeyboardToggle(toggleIcon, passwordInput) {
  toggleIcon.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      togglePasswordVisibility(passwordInput, toggleIcon);
    }
  });
}

addKeyboardToggle(toggleLoginPassword, loginPasswordInput);
addKeyboardToggle(toggleRegisterPassword, registerPasswordInput);
addKeyboardToggle(toggleRegisterConfirmPassword, registerConfirmPasswordInput);

function isValidName(name) {
  const nameRegex = /^[A-Za-z\s]+$/;
  return nameRegex.test(name);
}

function isValidUserName(username) {
  // Regular expression to check for at least one alphabet and one number
  const usernameRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]+$/;
  return usernameRegex.test(username);
}

// Check email format
function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Check password format
function isValidPassword(password) {
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
  return passwordRegex.test(password);
}

// Sign up function
async function signUp(event) {
  event.preventDefault();
  console.log("signUp function called");

  const email = String(document.getElementById("registerEmail").value).trim();
  const password = document.getElementById("registerPassword").value.trim();
  const repeatPassword = document
    .getElementById("registerConfirmPassword")
    .value.trim();
  const name = document.getElementById("registerName").value.trim();
  const username = document.getElementById("registerUsername").value.trim();

  // Check whether all fields are filled
  if (!email || !password || !name || !username) {
    alert("All fields must be filled out!");
    return;
  }

  // Check whether name is valid
  if (!isValidName(name)) {
    alert("Invalid name format!");
    return;
  }

  // Check whether username is valid
  if (!isValidUserName(username)) {
    alert("Invalid username format!");
    return;
  }

  // Check whether email is valid
  if (!isValidEmail(email)) {
    alert("Invalid email format!");
    return;
  }

  // Check whether passwords match
  if (password !== repeatPassword) {
    alert("Passwords do not match!");
    return;
  }

  // Check whether password is valid
  if (!isValidPassword(password)) {
    alert("Invalid password format!");
    return;
  }

  // Check if username already exists in User_details
  const usernameQuery = query(
    collection(db, "User_details"),
    where("username", "==", username)
  );
  const usernameSnapshot = await getDocs(usernameQuery);

  if (!usernameSnapshot.empty) {
    alert("Username already exists!");
    return;
  }

  try {
    const auth = getAuth();
    // Create user with email and password
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    console.log("User created in Firebase Auth:", user.uid);

    // Update user profile with display name
    await updateProfile(user, {
      displayName: name,
    });

    // Send email verification
    await sendEmailVerification(user);
    console.log("Email verification sent to:", email);

    // Store additional user details in Firestore
    const userRef = doc(db, "User_details", user.uid);
    await setDoc(userRef, {
      uid: user.uid,
      email: email,
      name: name,
      username: username,
      profilePictureURL: "",
      // ... other fields if needed
    });

    // Sign out the user to prevent unverified access
    await signOut(auth);

    alert(
      "A verification email has been sent to your email address. Please verify your email before logging in."
    );
    switchToLoginTab();
  } catch (error) {
    const errorMessage = error.message;
    console.error("Error during sign-up:", error);
    alert("Error during sign-up: " + errorMessage);
  }
}

// Sign in function
async function signIn(event) {
  event.preventDefault();

  const usernameOrEmail = document.getElementById("loginName").value.trim();
  const password = document.getElementById("loginPassword").value.trim();
  console.log("signIn function called");

  if (!password || !usernameOrEmail) {
    alert("All fields must be filled out!");
    return;
  }

  let email = usernameOrEmail;

  // If the input is not a valid email, assume it's a username and retrieve the email
  if (!isValidEmail(usernameOrEmail)) {
    // Retrieve email using the username
    try {
      const userDetailsRef = collection(db, "User_details");
      const usernameQuery = query(
        userDetailsRef,
        where("username", "==", usernameOrEmail)
      );
      const usernameSnapshot = await getDocs(usernameQuery);

      if (usernameSnapshot.empty) {
        alert("Invalid username or email.");
        return;
      }

      // Get email from the first matching document
      email = usernameSnapshot.docs[0].data().email;
    } catch (error) {
      const errorMessage = error.message;
      console.error("Error retrieving email from username:", error);
      alert("Error retrieving email: " + errorMessage);
      return;
    }
  }

  try {
    const auth = getAuth();
    // Sign in with email and password
    const userCredential = await signInWithEmailAndPassword(
      auth,
      email,
      password
    );
    const user = userCredential.user;
    console.log("User signed in:", user.uid);

    // Save uid to local storage
    localStorage.setItem("uid", user.uid);

    // Reload user to get updated emailVerified status
    await user.reload();

    if (user.emailVerified) {
      alert("User signed in successfully!");
      window.location.href = "/services";
      localStorage.setItem("loggedIn", true);
    } else {
      alert("Please verify your email before signing in.");
      await signOut(auth); // Sign out the unverified user
    }
  } catch (error) {
    const errorMessage = error.message;
    console.error("Error during sign-in:", error);
    alert("Error during sign-in: " + errorMessage);
  }
}

// Event listeners for buttons
document.addEventListener("DOMContentLoaded", function () {
  // Attach event listener for signIn
  const signInButton = document.getElementById("signInBtn");
  if (signInButton) {
    signInButton.addEventListener("click", signIn);
  }

  // Attach event listener for signUp
  const signUpButton = document.getElementById("signUpBtn");
  if (signUpButton) {
    signUpButton.addEventListener("click", signUp);
  }
});

// Switch from register to login tab
function switchToLoginTab() {
  const loginTab = document.getElementById("tab-login");
  const registerTab = document.getElementById("tab-register"); // Get the register tab
  const registerTabContent = document.getElementById("pills-register");
  const loginTabContent = document.getElementById("pills-login");

  if (loginTab && registerTab) {
    loginTab.classList.add("active");
    registerTab.classList.remove("active"); // Remove active class from register tab
    registerTabContent.classList.remove("show", "active");
    loginTabContent.classList.add("show", "active");
  }
}