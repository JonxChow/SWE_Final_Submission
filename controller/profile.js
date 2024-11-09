// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import {
  getFirestore,
  doc,
  getDoc,
  setDoc,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import {
  getAuth,
  onAuthStateChanged,
  reauthenticateWithCredential,
  EmailAuthProvider,
  updatePassword,
  signOut,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-auth.js";
import {
  getStorage,
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "https://www.gstatic.com/firebasejs/9.6.1/firebase-storage.js";

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
const db = getFirestore(app);
const auth = getAuth();
const storage = getStorage(app);
const authButton = document.getElementById("authButton")

// Elements
const profilePicture = document.getElementById("profilePicture");
const userName = document.getElementById("userName");
const userEmail = document.getElementById("userEmail");
const userUsername = document.getElementById("userUsername");
const uploadPictureBtn = document.getElementById("uploadPictureBtn");
const profilePictureInput = document.getElementById("profilePictureInput");
const logoutLink = document.getElementById("logoutLink");

const changePasswordForm = document.getElementById("changePasswordForm");
const currentPasswordInput = document.getElementById("currentPassword");
const newPasswordInput = document.getElementById("newPassword");
const confirmNewPasswordInput = document.getElementById("confirmNewPassword");

const toggleCurrentPassword = document.getElementById('toggleCurrentPassword');
const toggleNewPassword = document.getElementById('toggleNewPassword');
const toggleConfirmNewPassword = document.getElementById('toggleConfirmNewPassword');
  

// Fetch and display user data
async function fetchUserData(user) {
  try {
    const userDoc = doc(db, "User_details", user.uid);
    const userSnap = await getDoc(userDoc);

    if (userSnap.exists()) {
      const userData = userSnap.data();
      userName.textContent = userData.name;
      userEmail.textContent = userData.email;
      userUsername.textContent = "@" + userData.username;

      if (userData.profilePictureURL) {
        profilePicture.src = userData.profilePictureURL;
      } else {
        profilePicture.src = "../../images/default_profile.png"; // Default profile picture
      }
    } else {
      console.log("No such document!");
    }
  } catch (error) {
    console.error("Error fetching user data:", error);
    alert("Error fetching user data: " + error.message);
  }
}

// Handle profile picture upload
uploadPictureBtn.addEventListener("click", () => {
  profilePictureInput.click();
});

profilePictureInput.addEventListener("change", async (e) => {
  const file = e.target.files[0];
  if (!file) return;

  const user = auth.currentUser;
  if (!user) {
    alert("No authenticated user found.");
    return;
  }

  // Validate file type (optional)
  if (!file.type.startsWith("image/")) {
    alert("Please select a valid image file.");
    return;
  }

  const storageReference = storageRef(storage, `profile_pictures/${user.uid}/profile_picture.jpg`);
  console.log("Authenticated User ID: ", user.uid);
  try {
    // Upload files
    await uploadBytes(storageReference, file);
    console.log("Profile picture uploaded."); 

    // Get download URL
    const downloadURL = await getDownloadURL(storageReference);
    console.log("Download URL:", downloadURL);

    // Update Firestore
    const userDoc = doc(db, "User_details", user.uid);
    await setDoc(userDoc, { profilePictureURL: downloadURL }, { merge: true });
    console.log("Firestore updated with profile picture URL.");
  
    // Update profile picture on the page
    profilePicture.src = downloadURL;

    alert("Profile picture updated successfully!");
  } catch (error) {
    console.error("Error uploading profile picture:", error);
    alert("Error uploading profile picture: " + error.message);
  }
});

// Handle password change
changePasswordForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const currentPassword = currentPasswordInput.value.trim();
  const newPassword = newPasswordInput.value.trim();
  const confirmNewPassword = confirmNewPasswordInput.value.trim();

  if (!currentPassword || !newPassword || !confirmNewPassword) {
    alert("All password fields must be filled out.");
    return;
  }

  if (newPassword == currentPassword) {
    alert("Old and new passwords cannot be the same.");
    return;
  }

  if (newPassword !== confirmNewPassword) {
    alert("New passwords do not match.");
    return;
  }

  // Validate new password format
  if (!isValidPassword(newPassword)) {
    alert("Invalid password format! Password must be at least 8 characters long, include at least one uppercase letter, one number, and one special character.");
    return;
  }

  const user = auth.currentUser;
  if (!user) {
    alert("No authenticated user found.");
    return;
  }

  const credential = EmailAuthProvider.credential(user.email, currentPassword);

  try {
    // Reauthenticate user
    await reauthenticateWithCredential(user, credential);
    console.log("User reauthenticated.");

    // Update password
    await updatePassword(user, newPassword);
    console.log("Password updated.");

    alert("Password changed successfully!");
    changePasswordForm.reset();
  } catch (error) {
    console.error("Error changing password:", error);
    alert("Error changing password: " + error.message);
  }
});

// Validate password format
function isValidPassword(password) {
  const passwordRegex =
    /^(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/;
  return passwordRegex.test(password);
}

// Handle "Show Password" toggles
function togglePasswordVisibility(passwordInput, toggleIcon) {
  const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
  console.log(type);
  passwordInput.setAttribute('type', type);
  toggleIcon.children[0].classList.toggle('fa-eye-slash');
  toggleIcon.children[0].classList.toggle('fa-eye');
}

toggleCurrentPassword.addEventListener('click', () => {
  togglePasswordVisibility(currentPasswordInput, toggleCurrentPassword);
});

toggleNewPassword.addEventListener('click', () => {
  togglePasswordVisibility(newPasswordInput, toggleNewPassword);
});

toggleConfirmNewPassword.addEventListener('click', () => {
  togglePasswordVisibility(confirmNewPasswordInput, toggleConfirmNewPassword);
});

// Accessibility: Allow toggling via keyboard (Enter and Space keys)
function addKeyboardToggle(toggleIcon, passwordInput) {
  toggleIcon.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      togglePasswordVisibility(passwordInput, toggleIcon);
    }
  });
}

addKeyboardToggle(toggleCurrentPassword, currentPasswordInput);
addKeyboardToggle(toggleNewPassword, newPasswordInput);
addKeyboardToggle(toggleConfirmNewPassword, confirmNewPasswordInput);

// Handle user authentication state
onAuthStateChanged(auth, (user) => {
  if (user) {
    authButton.innerHTML = '<a href="#" id="logoutLink" class="btn btn-outline-success service-btn"><b>Logout</b></a>';
    fetchUserData(user)
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
        window.location.href = "/login";
  }
});


// Handle logout
logoutLink.addEventListener("click", async (e) => {
  e.preventDefault();
  try {
    await signOut(auth);
    localStorage.removeItem("loggedIn");
    alert("Logged out successfully.");
    window.location.href = "/login";
  } catch (error) {
    console.error("Error signing out:", error);
    alert("Error signing out: " + error.message);
  }
});
