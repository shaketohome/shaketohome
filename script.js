// === 1. FIREBASE INTEGRATION ===
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-app.js";
import { getFirestore, doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.8.0/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyDeUeVIT2rLalOnakBpG-foWuwxyTvbohY",
    authDomain: "shaketohome-8a8fd.firebaseapp.com",
    projectId: "shaketohome-8a8fd",
    storageBucket: "shaketohome-8a8fd.firebasestorage.app",
    messagingSenderId: "770234040999",
    appId: "1:770234040999:web:921e74cb1c222a0858d182"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

document.addEventListener("DOMContentLoaded", () => {
    // === 2. PRODUCT DATA ===
    const products = [
        { id: 1, name: "Oreo Thick Shake", price: 120, img: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&q=75&fm=webp" },
        { id: 2, name: "KitKat Crunch", price: 130, img: "https://images.unsplash.com/photo-1541658016709-82533e94bc75?w=300&q=75&fm=webp" },
        { id: 3, name: "Strawberry Shake", price: 110, img: "https://images.unsplash.com/photo-1550461716-ba4206587cce?w=300&q=75&fm=webp" },
        { id: 4, name: "Chocolate Shake", price: 120, img: "https://images.unsplash.com/photo-1584314950669-e685f09908bd?w=300&q=75&fm=webp" },
        { id: 5, name: "Sweet Lassi", price: 60, img: "https://images.unsplash.com/photo-1556610543-983196f7e4a1?w=300&q=75&fm=webp" },
        { id: 6, name: "Watermelon Juice", price: 50, img: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&q=75&fm=webp" },
        { id: 7, name: "Pineapple Juice", price: 60, img: "https://images.unsplash.com/photo-1550828520-4cb496926bfc?w=300&q=75&fm=webp" },
        { id: 8, name: "Grapes Juice", price: 70, img: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300&q=75&fm=webp" },
        { id: 9, name: "Black Currant", price: 140, img: "https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=300&q=75&fm=webp" }
    ];

    // === 3. STATE ===
    let cart = {}; 
    let userLocation = null;
    const WA_NUMBER = "917702622925"; 
    const BUSINESS_UPI_ID = "7569874341@ptsbi"; 

    // === 4. DOM ELEMENTS ===
    const gridContainer = document.getElementById("product-grid");
    const searchInput = document.getElementById("search-input");
    const locationTrigger = document.getElementById("location-trigger");
    const locationInput = document.getElementById("location-input");
    const bottomCart = document.getElementById("bottom-cart");
    const headerCartBadge = document.getElementById("cart-badge");
    const orderBtn = document.getElementById("order-btn");

    // === 5. INIT ===
    if(gridContainer) renderProducts(products);
    checkPostPaymentReturn(); 

    // === 6. LOCATION LOGIC ===
    if(locationTrigger) {
        locationTrigger.addEventListener("click", () => {
            if ("geolocation" in navigator) {
                locationInput.value = "Fetching GPS...";
                navigator.geolocation.getCurrentPosition(
                    (pos) => {
                        userLocation = `${pos.coords.latitude},${pos.coords.longitude}`;
                        locationInput.value = "📍 Delivering to your location";
                        locationInput.style.color = "var(--success)";
                    },
                    () => { locationInput.value = "Location access denied"; }
                );
            }
        });
    }

    // === 7. RENDER & CART SYSTEM ===
    function renderProducts(items) {
        gridContainer.innerHTML = "";
        items.forEach(product => {
            const qty = cart[product.id] || 0;
            const card = document.createElement("div");
            card.className = "card";
            card.innerHTML = `
                <img src="${product.img}" alt="${product.name}" class="card-img" loading="lazy">
                <div class="card-content">
                    <div>
                        <h3 class="card-title">${product.name}</h3>
                        <p class="card-price">₹${product.price}</p>
                    </div>
                    <div class="btn-wrapper" id="btn-wrap-${product.id}">
                        ${getButtonState(product.id, qty)}
                    </div>
                </div>
            `;
            gridContainer.appendChild(card);
        });
    }

    function getButtonState(id, qty) {
        if (qty === 0) return `<button class="btn-add tap-effect" onclick="updateCart(${id}, 1)">ADD</button>`;
        return `
            <div class="btn-qty">
                <button class="tap-effect" onclick="updateCart(${id}, -1)">−</button>
                <span>${qty}</span>
                <button class="tap-effect" onclick="updateCart(${id}, 1)">+</button>
            </div>
        `;
    }

    window.updateCart = function(id, delta) {
        if (!cart[id]) cart[id] = 0;
        cart[id] += delta;
        if (cart[id] <= 0) delete cart[id];
        const btnWrapper = document.getElementById(`btn-wrap-${id}`);
        if(btnWrapper) btnWrapper.innerHTML = getButtonState(id, cart[id] || 0);
        updateCartUI();
    };

    function updateCartUI() {
        let totalItems = 0, totalPrice = 0;
        Object.entries(cart).forEach(([id, qty]) => {
            totalItems += qty;
            const product = products.find(p => p.id === parseInt(id));
            if(product) totalPrice += (product.price * qty);
        });
        if(headerCartBadge) headerCartBadge.innerText = totalItems;
        if (totalItems > 0 && bottomCart) {
            document.getElementById("bottom-cart-items").innerText = `${totalItems} ITEM${totalItems > 1 ? 'S' : ''}`;
            document.getElementById("bottom-cart-total").innerText = `₹${totalPrice}`;
            bottomCart.classList.add("visible");
        } else if(bottomCart) {
            bottomCart.classList.remove("visible");
        }
    }

    if(searchInput) {
        searchInput.addEventListener("input", (e) => {
            const query = e.target.value.toLowerCase();
            const filtered = products.filter(p => p.name.toLowerCase().includes(query));
            renderProducts(filtered);
        });
    }

    // === 8. PREMIUM PAYMENT MODAL ===
    const paymentModal = document.getElementById("payment-modal");
    const closePaymentBtn = document.getElementById("close-payment");
    const payOptions = document.querySelectorAll(".pay-option");
    const codFlow = document.getElementById("cod-flow");
    const upiFlow = document.getElementById("upi-flow");
    const codConfirmBtn = document.getElementById("cod-confirm-btn");

    let currentOrderTotal = 0;

    if(orderBtn) {
        orderBtn.addEventListener("click", () => {
            const cartKeys = Object.keys(cart);
            if (cartKeys.length === 0) return;

            currentOrderTotal = 0;
            cartKeys.forEach(id => {
                const product = products.find(p => p.id === parseInt(id));
                currentOrderTotal += product.price * cart[id];
            });

            document.getElementById("pay-amount-display").innerText = `₹${currentOrderTotal}`;
            payOptions.forEach(opt => opt.classList.remove("selected"));
            codFlow.style.display = "none";
            upiFlow.style.display = "none";
            paymentModal.classList.add("active");
        });
    }

    if(closePaymentBtn) closePaymentBtn.addEventListener("click", () => paymentModal.classList.remove("active"));

    payOptions.forEach(option => {
        option.addEventListener("click", function() {
            payOptions.forEach(opt => opt.classList.remove("selected"));
            this.classList.add("selected");
            const radio = this.querySelector('input[type="radio"]');
            radio.checked = true;
            if (radio.value === "cod") {
                codFlow.style.display = "block";
                upiFlow.style.display = "none";
            } else {
                upiFlow.style.display = "block";
                codFlow.style.display = "none";
            }
        });
    });

    if(codConfirmBtn) {
        codConfirmBtn.addEventListener("click", function() {
            paymentModal.classList.remove("active");
            finalizeWhatsAppOrder(cart, currentOrderTotal, "Cash on Delivery", null);
        });
    }

    window.triggerUPI = function(appName) {
        localStorage.setItem("pendingOrder", JSON.stringify({
            savedCart: cart,
            savedTotal: currentOrderTotal
        }));
        paymentModal.classList.remove("active");
        const upiUrl = `upi://pay?pa=${BUSINESS_UPI_ID}&pn=ShakeToHome&am=${currentOrderTotal}&cu=INR`;
        window.location.href = upiUrl;
    };

    function checkPostPaymentReturn() {
        const pendingOrderData = localStorage.getItem("pendingOrder");
        if (pendingOrderData && document.getElementById("post-payment-modal")) {
            document.getElementById("post-payment-modal").classList.add("active");
        }
    }

    document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === 'visible') checkPostPaymentReturn();
    });

    const finalizeWhatsappBtn = document.getElementById("finalize-whatsapp-btn");
    if(finalizeWhatsappBtn) {
        finalizeWhatsappBtn.addEventListener("click", () => {
            const pendingOrderData = localStorage.getItem("pendingOrder");
            if (!pendingOrderData) return;
            const { savedCart, savedTotal } = JSON.parse(pendingOrderData);
            finalizeWhatsAppOrder(savedCart, savedTotal, "UPI (Paid)", null);
            localStorage.removeItem("pendingOrder");
            document.getElementById("post-payment-modal").classList.remove("active");
            cart = {};
            updateCartUI();
            renderProducts(products);
        });
    }

    // === 9. MASTER WHATSAPP & FIREBASE SYSTEM ===
    function finalizeWhatsAppOrder(activeCart, total, paymentMode, appName) {
        // 1. Generate Order ID
        const orderId = "SHK" + Math.floor(1000 + Math.random() * 9000);
        
        // 2. Build Item List String
        let itemsString = "";
        Object.keys(activeCart).forEach(id => {
            const product = products.find(p => p.id === parseInt(id));
            itemsString += `▪ ${activeCart[id]}x ${product.name}\n`;
        });

        const locationLink = userLocation ? `https://maps.google.com/?q=${userLocation}` : "Not provided";

        // 3. Save to Firebase (Runs in background instantly)
        setDoc(doc(db, "orders", orderId), {
            orderId: orderId,
            items: itemsString,
            total: total,
            paymentMethod: paymentMode,
            location: locationLink,
            status: "pending",
            timestamp: serverTimestamp()
        }).catch(err => console.error("Firebase Error:", err));

        // 4. Format WhatsApp Text
        let text = `Hi, I have placed an order.\n\n*Order ID:* ${orderId}\n\n*Order:*\n${itemsString}\n`;
        text += `*Total:* ₹${total}\n*Payment:* ${paymentMode}\n`;
        if (paymentMode === "UPI (Paid)") text += `*UPI ID:* ${BUSINESS_UPI_ID}\n`;
        text += `*Location:*\n${locationLink}`;

        // 5. Open WhatsApp Immediately
        const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            window.location.href = waUrl;
        } else {
            window.open(waUrl, '_blank');
        }
    }
});
