// === 1. IMPORT FIREBASE V10 (Modular SDK) ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// === 2. YOUR EXACT FIREBASE CONFIGURATION ===
const firebaseConfig = {
    apiKey: "AIzaSyDeUeVIT2rLalOnakBpG-foWuwxyTvbohY",
    authDomain: "shaketohome-8a8fd.firebaseapp.com",
    projectId: "shaketohome-8a8fd",
    storageBucket: "shaketohome-8a8fd.appspot.com", // Fixed URL
    messagingSenderId: "770234040999",
    appId: "1:770234040999:web:921e74cb1c222a0858d182"
};

// Initialize Firebase & Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// === 3. DOM INITIALIZATION ===
document.addEventListener("DOMContentLoaded", () => {
    console.log("Restaurants.js loaded successfully.");
    
    // Only run if we are on the restaurants page
    if (document.getElementById("restaurant-grid")) {
        fetchApprovedRestaurants();
        setupAddRestaurantForm();
    }
});

// === 4. FETCH RESTAURANTS ===
async function fetchApprovedRestaurants() {
    const grid = document.getElementById("restaurant-grid");
    const emptyState = document.getElementById("empty-state");

    try {
        const q = query(collection(db, "restaurants"), where("status", "==", "approved"));
        const querySnapshot = await getDocs(q);
        
        grid.innerHTML = ""; 
        
        if (querySnapshot.empty) {
            emptyState.style.display = "block";
            return;
        }

        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const card = document.createElement("a");
            card.className = "rest-card tap-effect";
            card.href = `restaurant.html?id=${doc.id}`; 
            
            card.innerHTML = `
                <img src="${data.image}" alt="${data.name}" class="rest-img" loading="lazy" onerror="this.src='https://via.placeholder.com/300x150?text=No+Image'">
                <div class="rest-info">
                    <h3 class="rest-name">${data.name}</h3>
                    <p class="rest-loc">${data.location}</p>
                </div>
            `;
            grid.appendChild(card);
        });

    } catch (error) {
        console.error("Fetch Error:", error);
        grid.innerHTML = `<p style="color:#e74c3c; grid-column:1/-1; text-align:center; padding: 20px;">Failed to connect to database.</p>`;
    }
}

// === 5. ADD RESTAURANT FORM & FIRESTORE WRITE ===
function setupAddRestaurantForm() {
    const modal = document.getElementById("add-rest-modal");
    const openBtn = document.getElementById("open-form-btn");
    const closeBtn = document.getElementById("close-form-btn");
    const form = document.getElementById("add-rest-form");
    
    const submitBtn = document.getElementById("submit-rest-btn");
    const btnText = document.getElementById("btn-text");
    const btnSpinner = document.getElementById("btn-spinner");
    const formMsg = document.getElementById("form-msg");

    if(openBtn) openBtn.addEventListener("click", () => modal.classList.add("active"));
    if(closeBtn) closeBtn.addEventListener("click", () => modal.classList.remove("active"));

    if(form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault(); // STRICT RULE: Prevent page reload
            console.log("Form submitted. Gathering data...");

            const name = document.getElementById("rest-name").value.trim();
            const location = document.getElementById("rest-location").value.trim();
            const image = document.getElementById("rest-image").value.trim();

            console.log("Data to send:", { name, location, image });

            // Show Loading UI
            submitBtn.disabled = true;
            btnText.style.display = "none";
            btnSpinner.style.display = "block";
            formMsg.className = "form-msg";
            formMsg.innerText = "Submitting to database...";

            try {
                console.log("Attempting Firestore connection...");
                
                // Write to Firestore
                await addDoc(collection(db, "restaurants"), {
                    name: name,
                    location: location,
                    image: image,
                    status: "pending",
                    createdAt: serverTimestamp()
                });

                console.log("Successfully written to Firestore!");

                // Show Success UI
                formMsg.innerText = "Success! Submitted for approval ✅";
                formMsg.classList.add("msg-success");
                form.reset();
                
                setTimeout(() => { 
                    modal.classList.remove("active"); 
                    formMsg.innerText = "";
                }, 2000);

            } catch (error) {
                // EXACT ERROR HANDLING REQUESTED
                console.error("Firestore Write Error: ", error);
                alert("Error: " + error.message); // Will trigger an alert with the exact issue
                formMsg.innerText = "Error submitting restaurant.";
                formMsg.classList.add("msg-error");
            } finally {
                // Restore Button State
                submitBtn.disabled = false;
                btnText.style.display = "block";
                btnSpinner.style.display = "none";
            }
        });
    } else {
        console.error("Form element 'add-rest-form' not found in HTML.");
    }
}
