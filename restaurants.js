// === 1. IMPORT FIREBASE V10 (Modular SDK via CDN for Browser) ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-analytics.js";
import { getFirestore, collection, addDoc, getDocs, query, where, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

// === 2. YOUR FIREBASE CONFIGURATION ===
const firebaseConfig = {
    apiKey: "AIzaSyDeUeVIT2rLalOnakBpG-foWuwxyTvbohY",
    authDomain: "shaketohome-8a8fd.firebaseapp.com",
    projectId: "shaketohome-8a8fd",
    storageBucket: "shaketohome-8a8fd.firebasestorage.app",
    messagingSenderId: "770234040999",
    appId: "1:770234040999:web:921e74cb1c222a0858d182",
    measurementId: "G-N9J4SB21TD"
};

// === 3. INITIALIZE FIREBASE, ANALYTICS, & FIRESTORE ===
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const db = getFirestore(app);

// === 4. DOM INITIALIZATION ===
document.addEventListener("DOMContentLoaded", () => {
    // Only run if we are on the restaurants page
    if (document.getElementById("restaurant-grid")) {
        fetchApprovedRestaurants();
        setupAddRestaurantForm();
    }
});

// === 5. FETCH RESTAURANTS (Consumers see this) ===
async function fetchApprovedRestaurants() {
    const grid = document.getElementById("restaurant-grid");
    const emptyState = document.getElementById("empty-state");

    try {
        // Query: Only fetch restaurants where status is "approved"
        const q = query(collection(db, "restaurants"), where("status", "==", "approved"));
        const querySnapshot = await getDocs(q);
        
        // Clear skeleton loaders
        grid.innerHTML = ""; 
        
        if (querySnapshot.empty) {
            emptyState.style.display = "block";
            return;
        }

        // Loop through results and create Swiggy-style cards
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            
            const card = document.createElement("a");
            card.className = "rest-card tap-effect";
            // Optional: link to specific menu page if you build it later
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
        console.error("Error fetching restaurants:", error);
        grid.innerHTML = `<p style="color:#e74c3c; grid-column:1/-1; text-align:center; padding: 20px;">Failed to connect to database. Check internet or Firebase rules.</p>`;
    }
}

// === 6. ADD RESTAURANT FORM (Owners use this) ===
function setupAddRestaurantForm() {
    const modal = document.getElementById("add-rest-modal");
    const openBtn = document.getElementById("open-form-btn");
    const closeBtn = document.getElementById("close-form-btn");
    const form = document.getElementById("add-rest-form");
    
    const submitBtn = document.getElementById("submit-rest-btn");
    const btnText = document.getElementById("btn-text");
    const btnSpinner = document.getElementById("btn-spinner");
    const formMsg = document.getElementById("form-msg");

    // Modal Triggers
    if(openBtn) openBtn.addEventListener("click", () => modal.classList.add("active"));
    if(closeBtn) closeBtn.addEventListener("click", () => modal.classList.remove("active"));

    // Form Submission Logic
    if(form) {
        form.addEventListener("submit", async (e) => {
            e.preventDefault();
            
            const name = document.getElementById("rest-name").value.trim();
            const location = document.getElementById("rest-location").value.trim();
            const image = document.getElementById("rest-image").value.trim();

            // 1. Show Loading UI
            submitBtn.disabled = true;
            btnText.style.display = "none";
            btnSpinner.style.display = "block";
            formMsg.className = "form-msg";
            formMsg.innerText = "";

            try {
                // 2. Save to Firebase Firestore
                await addDoc(collection(db, "restaurants"), {
                    name: name,
                    location: location,
                    image: image,
                    status: "pending", // MUST BE APPROVED BY ADMIN IN FIREBASE CONSOLE
                    createdAt: serverTimestamp()
                });

                // 3. Show Success UI
                formMsg.innerText = "Success! Submitted for approval ✅";
                formMsg.classList.add("msg-success");
                form.reset();
                
                // Close modal after 2 seconds
                setTimeout(() => { modal.classList.remove("active"); }, 2000);

            } catch (error) {
                // 4. Handle Errors
                console.error("Error adding document: ", error);
                formMsg.innerText = "Error submitting restaurant. Check Firestore Rules.";
                formMsg.classList.add("msg-error");
            } finally {
                // Restore Button State
                submitBtn.disabled = false;
                btnText.style.display = "block";
                btnSpinner.style.display = "none";
            }
        });
    }
}
