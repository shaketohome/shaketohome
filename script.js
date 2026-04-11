// ===== GLOBAL STATE =====
let cart = {};
let cachedLocation = null;
let isFetchingLocation = false;
let userLocation = null;

const WA_NUMBER = "917702622925";

// ===== DOM =====
const gridContainer = document.getElementById("product-grid");
const locationInput = document.getElementById("location-input");
const locationTrigger = document.getElementById("location-trigger");
const searchInput = document.getElementById("search-input");
const bottomCart = document.getElementById("bottom-cart");

// ===== PRODUCTS =====
const products = [
    { id: 1, name: "Oreo Shake", price: 120, category: "milkshakes", img: "Oero.jpeg" },
    { id: 2, name: "KitKat Shake", price: 130, category: "milkshakes", img: "kitkatshake.jpg" },
    { id: 3, name: "Strawberry Shake", price: 110, category: "milkshakes", img: "strawberry shake.jpg" },
    { id: 4, name: "Chocolate Shake", price: 120, category: "milkshakes", img: "chocolate shake.jpeg" },
    { id: 5, name: "Black Current", price: 140, category: "milkshakes", img: "chocolate.jpg" },

    { id: 6, name: "Pineapple Juice", price: 60, category: "juices", img: "pineapple.jpeg" },
    { id: 7, name: "Karbuja Juice", price: 50, category: "juices", img: "muskmelon.jpeg" },
    { id: 8, name: "Watermelon Juice", price: 50, category: "juices", img: "watermelon juice.jpeg" },
    { id: 9, name: "Grapes Juice", price: 70, category: "juices", img: "grape juice.jpeg" },

    { id: 10, name: "Butterscotch Cake", price: 350, category: "cakes", img: "butterscotch cake.jpeg" },
    { id: 11, name: "Pineapple Cake", price: 300, category: "cakes", img: "pineapple cake.jpeg" },
    { id: 12, name: "Black Forest", price: 400, category: "cakes", img: "black forest.jpeg" },

    { id: 13, name: "Egg Puff", price: 20, category: "puff", img: "egg puff.jpeg" },
    { id: 14, name: "Veg Puff", price: 15, category: "puff", img: "veg puff.jpeg" },
    { id: 15, name: "Chicken Puff", price: 30, category: "puff", img: "chicken puff.jpeg" },

    { id: 16, name: "Chicken Dum Biryani", price: 220, category: "biryani", img: "biryani.jpeg" },

    { id: 17, name: "Blue Mojito", price: 80, category: "mojito", img: "blue mojito.jpeg" },
    { id: 18, name: "Lime Mojito", price: 70, category: "mojito", img: "lime mojito.jpeg" },
    { id: 19, name: "Watermelon Mojito", price: 90, category: "mojito", img: "watermelon mojito.jpeg" },
    { id: 20, name: "Strawberry Mojito", price: 90, category: "mojito", img: "strawberry mojito.jpeg" }
];

// ===== RENDER PRODUCTS =====
function renderProducts(list) {
    gridContainer.innerHTML = "";

    list.forEach(p => {
        const qty = cart[p.id] || 0;

        gridContainer.innerHTML += `
        <div class="card">
            <img src="${p.img}" class="card-img" alt="${p.name}">
            <div class="card-content">
                <div class="card-title">${p.name}</div>
                <div class="card-price">₹${p.price}</div>

                ${
                    qty === 0
                    ? `<button class="btn-add" onclick="addToCart(${p.id})">ADD</button>`
                    : `
                    <div class="btn-qty">
                        <button onclick="changeQty(${p.id}, -1)">-</button>
                        <span>${qty}</span>
                        <button onclick="changeQty(${p.id}, 1)">+</button>
                    </div>
                    `
                }
            </div>
        </div>`;
    });
}

// ===== FILTER =====
function filterProducts() {
    const query = searchInput?.value.toLowerCase() || "";
    const filtered = products.filter(p =>
        p.name.toLowerCase().includes(query)
    );
    renderProducts(filtered);
}

// ===== CART =====
function addToCart(id) {
    cart[id] = 1;
    updateCart();
}

function changeQty(id, delta) {
    cart[id] += delta;
    if (cart[id] <= 0) delete cart[id];
    updateCart();
}

function updateCart() {
    renderProducts(products);

    let total = 0;
    let count = 0;

    for (let id in cart) {
        const item = products.find(p => p.id == id);
        total += item.price * cart[id];
        count += cart[id];
    }

    if (count > 0) {
        bottomCart.classList.add("visible");
        bottomCart.innerHTML = `
            <span>${count} items | ₹${total}</span>
            <button onclick="placeOrder()">Order</button>
        `;
    } else {
        bottomCart.classList.remove("visible");
    }
}

// ===== LOCATION =====
function getLocationSafe() {
    return new Promise((resolve) => {

        if (cachedLocation) return resolve(cachedLocation);

        if (!navigator.geolocation) return resolve(null);

        navigator.geolocation.getCurrentPosition(
            (pos) => {
                cachedLocation = `${pos.coords.latitude},${pos.coords.longitude}`;
                userLocation = cachedLocation;
                resolve(cachedLocation);
            },
            () => resolve(null),
            { enableHighAccuracy: true, timeout: 10000 }
        );
    });
}

// ===== INIT LOCATION =====
async function initLocation() {
    if (!locationInput) return;

    locationInput.value = "Detecting location...";
    const loc = await getLocationSafe();

    if (loc) {
        locationInput.value = "📍 Location detected";
    } else {
        locationInput.value = "Enter location manually";
    }
}

// ===== ORDER =====
async function placeOrder() {

    let loc = userLocation;
    if (!loc) loc = await getLocationSafe();

    const locationText = loc
        ? `https://maps.google.com/?q=${loc}`
        : "Location not provided";

    let message = "NEW ORDER\n\n";

    for (let id in cart) {
        const item = products.find(p => p.id == id);
        message += `${item.name} x ${cart[id]}\n`;
    }

    message += `\nLocation: ${locationText}`;

    const url = `https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(message)}`;
    window.open(url, "_blank");
}

// ===== EVENTS =====
if (searchInput) {
    searchInput.addEventListener("input", filterProducts);
}

// ===== INIT =====
if (gridContainer) {
    renderProducts(products);
}

initLocation();
