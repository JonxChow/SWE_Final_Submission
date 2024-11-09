import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { collection, where, query, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { checkHoliday, getPublicHolidays } from "./holidays.js"

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


// Set up your event listeners
document.addEventListener("DOMContentLoaded", function () {
    if (window.location.pathname != "/services") {
        return;
    } 

    let buttons = document.querySelectorAll(".toggle-button");
    buttons.forEach(function (button) {
        button.addEventListener("click", function (event) {
            event.preventDefault();
            buttons.forEach((btn) => btn.classList.remove("selected-service"));
            this.classList.add("selected-service");
        });
    });

    // Add event listener to the "NEXT" button
    let nextButton = document.querySelector(".next-button");
    nextButton.addEventListener("click", function(event) {
        event.preventDefault();
        if (!localStorage.getItem("loggedIn")) {
            window.location.href = "/login";
            return;
        }
        let selectedButton = document.querySelector(".selected-service");
        if (selectedButton) {
            const selectedService = selectedButton.textContent.trim();
            console.log("Selected Service:", selectedService);
            //findMatchingUsers(selectedService);
            showPopUp(selectedService);
        } else {
            console.log("No service selected.");
        }
    });
});

// timer
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}
  
// Find Matching Service Providers
function findMatchingUsers(service) {
    const q = query(
        collection(db, "users"),
        where("Type of service", "==", service),
        where("user_type", "==", "service provider")
    );

    getDocs(q)
        .then((querySnapshot) => {
            let results = [];
            querySnapshot.forEach((doc) => {
                let data = doc.data();
                let serviceProviderName = data.name; // Assuming 'name' is the field for the service provider's name
                let serviceProviderEmail = data.email;
                let result = {
                    "service_provider_name": serviceProviderName,
                    "service_requested": service,
                    "email": serviceProviderEmail,
                    "time": "",
                    "location": "(1.385782, 103.8800001)",
                    "picture": ""
                };
                results.push(result);
            });
            console.log(results); // This will log the array of JSON objects
            // If you want to use this data in another JS file, you can set it to a global variable or use other methods like LocalStorage, etc.
            window.serviceProviderData = results; // Setting to a global variable
            localStorage.setItem('serviceProviderData', JSON.stringify(results));
            sleep(2500).then(() => { window.location.href = "request"; });
        })
        .catch((error) => {
            console.log("Error getting documents: ", error);
        });
}

async function showPopUp(service) {
    
    const today = new Date().toISOString().split('T')[0];
    const isHoliday = checkHoliday(await getPublicHolidays());

    // Set the message in the pop-up
    const message = isHoliday ? 
        `Today is a public holiday (${today}). Additional rate is applied.` :
        `Today is not a public holiday (${today}). Normal rate is applied.`;
    document.getElementById("popupMessage").textContent = message;

    // Show the pop-up
    document.querySelector(".popup-box").style.display = "block";
    document.querySelector(".popup-overlay").style.display = "block";

    // Add event listeners for Confirm and Cancel buttons
    document.getElementById("confirmButton").onclick = function() {
        document.querySelector(".popup-box").style.display = "none";
        document.querySelector(".popup-overlay").style.display = "none";
        findMatchingUsers(service);
    };

    document.getElementById("cancelButton").onclick = function() {
        document.querySelector(".popup-box").style.display = "none";
        document.querySelector(".popup-overlay").style.display = "none";
        window.location.href = "/services";
    };
};