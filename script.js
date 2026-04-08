import { initializeApp } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-app.js";
import { getFirestore, doc, setDoc, serverTimestamp, collection, onSnapshot, updateDoc, query, orderBy } from "https://www.gstatic.com/firebasejs/12.11.0/firebase-firestore.js";

// === 1. FIREBASE CONFIGURATION ===
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
window.db = db;
console.log("Firebase connected");

document.addEventListener("DOMContentLoaded", () => {
    
    // === 2. CATEGORIZED PRODUCT DATA ===
    const products = [
        // Milkshakes
        { id: 1, name: "Oreo Shake", price: 120, category: "milkshakes", img: "https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=300&q=75" },
        { id: 2, name: "KitKat Shake", price: 130, category: "milkshakes", img: "https://images.unsplash.com/photo-1541658016709-82533e94bc75?w=300&q=75" },
        { id: 3, name: "Strawberry Shake", price: 110, category: "milkshakes", img: "https://images.unsplash.com/photo-1550461716-ba4206587cce?w=300&q=75" },
        { id: 4, name: "Chocolate Shake", price: 120, category: "milkshakes", img: "https://images.unsplash.com/photo-1584314950669-e685f09908bd?w=300&q=75" },
        { id: 5, name: "Black Currant", price: 140, category: "milkshakes", img: "https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?w=300&q=75" },
        
        // Juices
        { id: 6, name: "Pineapple Juice", price: 60, category: "juices", img: "https://images.unsplash.com/photo-1550828520-4cb496926bfc?w=300&q=75" },
        { id: 7, name: "Karbuja Juice", price: 50, category: "juices", img: "https://images.unsplash.com/photo-1604544525867-0c67da4867af?w=300&q=75" },
        { id: 8, name: "Watermelon Juice", price: 50, category: "juices", img: "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=300&q=75" },
        { id: 9, name: "Grapes Juice", price: 70, category: "juices", img: "https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=300&q=75" },
        
        // Cakes
        { id: 10, name: "Butterscotch Cake", price: 350, category: "cakes", img: "https://images.unsplash.com/photo-1542826438-bd32f43d626f?w=300&q=75" },
        { id: 11, name: "Pineapple Cake", price: 300, category: "cakes", img: "https://images.unsplash.com/photo-1571115177098-24ec42ed204d?w=300&q=75" },
        { id: 12, name: "Black Forest", price: 400, category: "cakes", img: "https://images.unsplash.com/photo-1606890737304-57a1ca8a5b62?w=300&q=75" },
        
        // Puff
        { id: 13, name: "Egg Puff", price: 20, category: "puff", img: "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=300&q=75" },
        { id: 14, name: "Curry Puff", price: 15, category: "puff", img: "https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=300&q=75" },
        { id: 15, name: "Chicken Puff", price: 30, category: "puff", img: "https://images.unsplash.com/photo-1603569283847-aa295f0d016a?w=300&q=75" },
        
        // Biryani
        { id: 16, name: "Chicken Dum Biryani", price: 220, category: "biryani", img: "https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8?w=300&q=75" },
        
        // Mojito
        { id: 17, name: "Blue Mojito", price: 80, category: "mojito", img: "https://images.unsplash.com/photo-1556881286-fc6915169721?w=300&q=75" },
        { id: 18, name: "Lime Mojito", price: 70, category: "mojito", img: "https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=300&q=75" },
        { id: 19, name: "Watermelon Mojito", price: 90, category: "mojito", img: "https://images.unsplash.com/photo-1560512823-829485b8bf24?w=300&q=75" },
        { id: 20, name: "Strawberry Mojito", price: 90, category: "mojito", img: "https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?w=300&q=75" }
    ];

    // === 3. STATE ===
    let cart = {}; 
    let userLocation = null;
    const WA_NUMBER = "917702622925"; 
    const BUSINESS_UPI_ID = "7569874341@ptsbi"; 

    // === 4. DOM ELEMENTS ===
    const gridContainer = document.getElementById("product-grid");
    const categoryBar = document.getElementById("category-bar"); // Added category element
    const searchInput = document.getElementById("search-input");
    const locationTrigger = document.getElementById("location-trigger");
    const locationInput = document.getElementById("location-input");
    const bottomCart = document.getElementById("bottom-cart");
    const headerCartBadge = document.getElementById("cart-badge");
    const orderBtn = document.getElementById("order-btn");

    // === 5. CATEGORY FILTER LOGIC ===
    const categoryList = ["All", "Milkshakes", "Juices", "Cakes", "Puff", "Biryani", "Mojito"];
    let activeCategory = "All";

    function renderCategoryBar() {
        if (!categoryBar) return;
        categoryBar.innerHTML = ""; // Clear existing
        
        categoryList.forEach(cat => {
            const btn = document.createElement("button");
            btn.className = `category-btn tap-effect ${cat === activeCategory ? 'active' : ''}`;
            btn.innerText = cat;
            
            btn.addEventListener("click", () => {
                activeCategory = cat;
                renderCategoryBar(); // Highlight new button
                filterProducts();    // Filter grid
            });
            
            categoryBar.appendChild(btn);
        });
    }

    function filterProducts() {
        if (activeCategory === "All") {
            renderProducts(products); // Show all
        } else {
            const filtered = products.filter(p => p.category.toLowerCase() === activeCategory.toLowerCase());
            renderProducts(filtered); // Show filtered
        }
    }

    // === 6. INIT ===
    if(gridContainer) {
        renderCategoryBar(); // Load categories
        filterProducts();    // Load products
    }
    checkPostPaymentReturn(); 

    // === 7. LOCATION LOGIC ===
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

    // === 8. RENDER & CART SYSTEM ===
    function renderProducts(items) {
        gridContainer.innerHTML = "";
        
        if (items.length === 0) {
            gridContainer.innerHTML = `<p style="grid-column: 1/-1; text-align: center; padding: 20px; color: var(--text-muted);">No products found in this category.</p>`;
            return;
        }

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

    // === 9. PREMIUM PAYMENT MODAL ===
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
            renderProducts(products); // Reset grid
        });
    }

    // === 10. MASTER WHATSAPP & FIREBASE SYSTEM ===
    async function finalizeWhatsAppOrder(activeCart, total, paymentMode, appName) {
        const orderId = "SHK" + Math.floor(1000 + Math.random() * 9000);
        
        let itemsString = "";
        Object.keys(activeCart).forEach(id => {
            const product = products.find(p => p.id === parseInt(id));
            itemsString += `▪ ${activeCart[id]}x ${product.name}\n`;
        });

        const locationLink = userLocation ? `https://maps.google.com/?q=${userLocation}` : "Not provided";

        console.log("Saving order to Firestore...");
        try {
            await setDoc(doc(window.db, "orders", orderId), {
                orderId: orderId,
                items: itemsString,
                total: total,
                paymentMethod: paymentMode,
                location: locationLink,
                status: "pending",
                timestamp: serverTimestamp()
            });
            console.log("✅ Order saved successfully! ID: ", orderId);
        } catch (error) {
            console.error("❌ FIREBASE ERROR:", error);
            alert("Database Error: " + error.message);
        }

        let text = `Hi, I have placed an order.\n\n*Order ID:* ${orderId}\n\n*Order:*\n${itemsString}\n`;
        text += `*Total:* ₹${total}\n*Payment:* ${paymentMode}\n`;
        if (paymentMode === "UPI (Paid)") text += `*UPI ID:* ${BUSINESS_UPI_ID}\n`;
        text += `*Location:*\n${locationLink}`;

        const waUrl = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(text)}`;
        if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
            window.location.href = waUrl;
        } else {
            window.open(waUrl, '_blank');
        }
    }
});
