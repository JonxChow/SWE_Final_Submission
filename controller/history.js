import { initializeApp } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-app.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";
import { collection, where, query, getDocs } from "https://www.gstatic.com/firebasejs/9.6.1/firebase-firestore.js";


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


document.addEventListener("DOMContentLoaded", getOrderHistory);

// Find Matching Service Providers
function getOrderHistory() {
    if (window.location.pathname != "/history") {
        return;
    } 

    const q = query(
        collection(db, "User_details"),
        where("uid", "==", localStorage.getItem("uid"))
    );

    getDocs(q)
        .then((querySnapshot) => {
            querySnapshot.forEach((doc) => {
                let rows = document.querySelectorAll("tbody tr");
                const data = doc.data().order_history;
                for (let i = 0; i < data.length; i++) {
                    rows[i].children[0].innerHTML = data[i].service;
                    rows[i].children[1].innerHTML = data[i].price;
                    rows[i].children[2].innerHTML = data[i].date;
                    rows[i].children[3].innerHTML = data[i].time;
                    rows[i].children[4].innerHTML = data[i].location;
                    rows[i].style.visibility = "visible";
                }
            });
        })
        .catch((error) => {
            console.log("Error displaying rows: ", error);
        });
}