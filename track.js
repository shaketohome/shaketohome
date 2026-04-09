import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getFirestore, doc, onSnapshot } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// === FIREBASE CONFIG (Same as your main app) ===
const firebaseConfig = {
    apiKey: "AIzaSyCThtrwNBs31H3KsM9DdVtY2ZJctnybp_0",
    authDomain: "shaketohome-a1156.firebaseapp.com",
    projectId: "shaketohome-a1156",
    storageBucket: "shaketohome-a1156.appspot.com",
    messagingSenderId: "592984047315",
    appId: "1:592984047315:web:b8bc9c9f7dc1eeebfe5e26"
};
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// === GET ORDER ID FROM URL (e.g., track.html?orderId=SHK1234) ===
const urlParams = new URLSearchParams(window.location.search);
const orderId = urlParams.get('orderId');

document.getElementById('order-id-display').innerText = orderId ? `ID: ${orderId}` : "Invalid Order";

// === MAP SETUP VARIABLES ===
let map, customerMarker, riderMarker, routeLine;
const bhupalpallyCenter = [18.4340, 79.8600]; // Default location fallback

// Custom Icons
const homeIcon = L.divIcon({ html: '🏠', className: 'custom-map-icon', iconSize: [30, 30] });
const riderIcon = L.divIcon({ html: '🛵', className: 'custom-map-icon', iconSize: [36, 36] });

// Initialize Map
function initMap(lat, lng) {
    if (map) return; // Prevent double init
    
    map = L.map('map', { zoomControl: false }).setView([lat, lng], 15);
    
    // Add Apple/Google style map tiles
    L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; OpenStreetMap'
    }).addTo(map);

    // Place Customer Home Marker
    customerMarker = L.marker([lat, lng], { icon: homeIcon }).addTo(map);
}

// Update Map with Rider Location
function updateRiderOnMap(riderLat, riderLng, custLat, custLng) {
    if (!riderMarker) {
        riderMarker = L.marker([riderLat, riderLng], { icon: riderIcon }).addTo(map);
        // Draw dashed line between store/rider and customer
        routeLine = L.polyline([[riderLat, riderLng], [custLat, custLng]], { color: '#ff5200', dashArray: '5, 10', weight: 3 }).addTo(map);
    } else {
        // Move existing marker smoothly
        riderMarker.setLatLng([riderLat, riderLng]);
        routeLine.setLatLngs([[riderLat, riderLng], [custLat, custLng]]);
    }
    
    // Auto-zoom map to fit both rider and customer
    map.fitBounds(L.latLngBounds([riderLat, riderLng], [custLat, custLng]), { padding: [50, 50] });
}

// === REAL-TIME FIREBASE LISTENER ===
if (orderId) {
    onSnapshot(doc(db, "orders", orderId), (docSnap) => {
        if (!docSnap.exists()) return;
        const data = docSnap.data();

        // 1. Extract Customer Location (Parse from Google Maps Link)
        let custLat = bhupalpallyCenter[0], custLng = bhupalpallyCenter[1];
        if (data.location && data.location.includes("?q=")) {
            const coords = data.location.split('?q=')[1].split(',');
            custLat = parseFloat(coords[0]);
            custLng = parseFloat(coords[1]);
        }
        initMap(custLat, custLng);

        // 2. Update UI Based on Status
        const status = data.status || "pending"; // pending, preparing, out, delivered
        updateUIStatus(status);

        // 3. Update Rider Map Position if Out for Delivery
        if ((status === "out" || status === "delivered") && data.riderLocation) {
            updateRiderOnMap(data.riderLocation.lat, data.riderLocation.lng, custLat, custLng);
            document.getElementById('rider-info').style.display = "flex";
        }
    });
}

// === UI UPDATER ===
function updateUIStatus(status) {
    const title = document.getElementById('status-title');
    const eta = document.getElementById('eta-text');
    
    // Reset classes
    document.querySelectorAll('.timeline-step').forEach(el => el.classList.remove('active'));
    document.getElementById('step-pending').classList.add('active');

    if (status === "pending") {
        title.innerText = "Order Received";
        eta.innerText = "Waiting for restaurant to confirm";
    } 
    else if (status === "preparing") {
        document.getElementById('step-preparing').classList.add('active');
        title.innerText = "Preparing Order";
        eta.innerText = "Your shakes are being blended! 🥤";
    } 
    else if (status === "out") {
        document.getElementById('step-preparing').classList.add('active');
        document.getElementById('step-out').classList.add('active');
        title.innerText = "Out for Delivery 🚚";
        eta.innerText = "Arriving in 10-15 mins";
    } 
    else if (status === "delivered") {
        document.querySelectorAll('.timeline-step').forEach(el => el.classList.add('active'));
        title.innerText = "Order Delivered ✅";
        eta.innerText = "Enjoy your drinks!";
        document.getElementById('rider-info').style.display = "none";
    }
}
