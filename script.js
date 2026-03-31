let cart = [];
let userLocation = "";

function getLocation() {
  if (!navigator.geolocation) {
    alert("Location not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      let lat = pos.coords.latitude;
      let lon = pos.coords.longitude;

      userLocation = "https://maps.google.com/?q=" + lat + "," + lon;

      // Show clean text (not link)
      document.getElementById("locationInput").value =
        "📍 Location captured";
    },
    () => {
      alert("Please allow location");
    }
  );
}

function addToCart(name, price) {
  cart.push({ name, price });

  document.getElementById("cartCount").innerText = cart.length;
  document.getElementById("orderText").innerText =
    cart.length + " items";
}

function checkout() {
  if (cart.length === 0) {
    alert("Cart empty");
    return;
  }

  let msg = "Order:\n";
  let total = 0;

  cart.forEach((i) => {
    msg += i.name + " ₹" + i.price + "\n";
    total += i.price;
  });

  msg += "\nTotal: ₹" + total;

  if (userLocation) {
    msg += "\nLocation: " + userLocation;
  }

  let finalUrl =
    "https://wa.me/917702622925?text=" +
    encodeURIComponent(msg);

  window.open(finalUrl, "_blank");
}

function openWhatsApp() {
  window.open("https://wa.me/917702622925");
}

function toggleCart() {
  alert("Cart items: " + cart.length);
}
