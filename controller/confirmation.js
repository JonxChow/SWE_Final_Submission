import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { collection, where, query, getDocs, doc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { getPublicHolidays, calculatePrice } from "/holidays.js";


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


document.addEventListener("DOMContentLoaded", async function () {
    if (window.location.pathname != "/confirmation") {
        return;
    }  

    // Start the countdown timer when the page loads
    window.onload = startCountdown;
    
    // Retrieve the details from localStorage
    const name = localStorage.getItem('serviceProviderName'); // Assuming you stored the name with this key
    const serviceRequested = localStorage.getItem('serviceRequested');
    const timing = localStorage.getItem('timing');
    const location = localStorage.getItem('location');
    
    // Log public holidays for debugging
    const data = await getPublicHolidays();
    const price = calculatePrice(data);

    // Create the query to find the user document
    const q = query(
        collection(db, "User_details"),
        where("uid", "==", localStorage.getItem("uid"))
    );

    try {
        // Execute the query
        const querySnapshot = await getDocs(q);
        
        // Check if any documents were found
        if (!querySnapshot.empty) {
            // Get the first document (assuming there's only one match)
            const userDocSnapshot = querySnapshot.docs[0];
            const userId = userDocSnapshot.id; // Get the document ID

            // Create a reference to the document
            const userDocRef = doc(db, "User_details", userId);

            // Define the order object
            const order = { 
                "service": serviceRequested,
                "price": "$" + price,
                "date": new Date().toISOString().split('T')[0], // Format the date as YYYY-MM-DD
                "time": timing,
                "location": location
            };
            
            // Update the document, appending the new service to the "order_history" array
            await updateDoc(userDocRef, {
                order_history: arrayUnion(order)  // Append the new service
            });

            console.log("Order added to records!");
        } else {
            console.log("No matching user found.");
        }
    } catch (error) {
        console.error("Error updating document: ", error);
    }

    // Update the HTML elements with the retrieved data
    if (name) {
        document.querySelector(".green-box1.text-container p:nth-child(2)").innerHTML = `<b>Name:</b> ${name}`;
    }
    // Display the service price
    if (price) {
        document.querySelector(".green-box1.text-container p:nth-child(3)").innerHTML = `<b>Price:</b> $${price}`;
    }
    if (serviceRequested) {
        document.querySelector(".green-box2.text-container p:nth-child(2)").innerHTML = `<b>Service Requested:</b> ${serviceRequested} `;
    }
    if (timing) {
        document.querySelector(".green-box2.text-container p:nth-child(3)").innerHTML = `<b>Time:</b> ${timing}`;
    }
    if (location) {
        document.querySelector(".green-box2.text-container p:nth-child(4)").innerHTML = `<b>Location:</b> ${location} `;
    }
});

// Function to start the countdown timer
function startCountdown() {
    let countdown = 20; // Start countdown from 20 seconds

    // Display the countdown modal
    document.getElementById('countdownModal').classList.add('show');
    document.getElementById('countdownModal').style.display = 'block';

    // Update the countdown every second
    const interval = setInterval(function() {
        countdown--;

        // Update the countdown value in the modal
        document.getElementById('countdown').innerText = countdown;

        // If countdown reaches 0, redirect to index.html and clear the interval
        if (countdown <= 0) {
            clearInterval(interval);
            window.location.href = "./services";
        }
    }, 1000);
}