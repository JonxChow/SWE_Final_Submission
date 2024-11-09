import { initializeApp } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-app.js";
import { getDatabase, ref, runTransaction } from "https://www.gstatic.com/firebasejs/10.5.0/firebase-database.js";

const firebaseConfig = {
    apiKey: "AIzaSyBrFmRrodSjkuXh1vig3Pp5kg47xLjZmXI",
    authDomain: "fixaroo-ba396.firebaseapp.com",
    databaseURL: "https://fixaroo-ba396-default-rtdb.asia-southeast1.firebasedatabase.app", // Added databaseURL
    projectId: "fixaroo-ba396",
    storageBucket: "fixaroo-ba396.appspot.com",
    messagingSenderId: "1045822073352",
    appId: "1:1045822073352:web:5b6a26b34522da2a37bfbd",
    measurementId: "G-JTQY4MX6KW"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Reference to Firebase Realtime Database
var database = getDatabase(app);

document.addEventListener("DOMContentLoaded", function() {
    
    const serviceRequested = localStorage.getItem('serviceRequested');
    const timing = localStorage.getItem('timing');
    const location = localStorage.getItem('location');

    if (serviceRequested && timing && location) {
        document.querySelector("h3:nth-child(2)").textContent = "Service Requested: " + serviceRequested;
        document.querySelector("h3:nth-child(3)").textContent = "Timing: " + timing;
        document.querySelector("h3:nth-child(4)").textContent = "Location: " + location;
    }
});

document.addEventListener("DOMContentLoaded", function() {
    if (window.location.pathname != "/provider") {
        return;
    } 
    // Accept button
    const acceptButton = document.querySelector(".accept-req a.btn:nth-child(1)");
    if (!acceptButton) {
        console.error("Accept button not found!");
        return;
    }
    acceptButton.addEventListener("click", function(event) {
        event.preventDefault(); // Prevent the default action
        console.log("Accept button clicked!"); // Log to console
        registerClick("accepted");
    });

    // Decline button
    const declineButton = document.querySelector(".accept-req a.btn:nth-child(2)");
    if (!declineButton) {
        console.error("Decline button not found!");
        return;
    }
    declineButton.addEventListener("click", function(event) {
        event.preventDefault(); // Prevent the default action
        console.log("Decline button clicked!"); // Log to console
        registerClick("declined");
    });
});

function registerClick(action) {
    console.log(`Registering click for action: ${action}`); // Initial log
    const responsesRef = ref(database, 'responses/' + action);
    console.log(`Transaction Reference:`, responsesRef); // Log the reference

    runTransaction(responsesRef, (currentData) => {
        console.log(`Current Data for "${action}":`, currentData); // Log current data
        return (currentData || 0) + 1;
    })
    .then((result) => {
        if (result.committed) {
            console.log('Transaction committed with value:', result.snapshot.val());
        } else {
            console.log('Transaction not committed.');
        }
    })
    .catch((error) => {
        console.error('Transaction failed:', error);
        alert('An error occurred while processing your request. Please try again later.');
    });
}