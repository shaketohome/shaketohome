let cart = [];
let locationLink = "";

function getLocation() {
  navigator.geolocation.getCurrentPosition(pos => {
    let lat = pos.coords.latitude;
    let lon = pos.coords.longitude;

    locationLink = "https://maps.google.com/?q=" + lat + "," + lon;
    document.getElementById("locationText").innerText = "📍 Location detected";
  });
}

function addToCart(name, price) {
  cart.push({name, price});
  document.getElementById("cartText").innerText = cart.length + " items";
}

function checkout() {
  if(cart.length === 0) return alert("Cart empty");

  showStatus("Order Accepted");
  setTimeout(()=>showStatus("Preparing..."),2000);
  setTimeout(()=>showStatus("On the way 🚴"),4000);

  let msg = "Order:%0A";
  let total = 0;

  cart.forEach(i=>{
    msg += i.name + " ₹" + i.price + "%0A";
    total += i.price;
  });

  msg += "%0ATotal ₹" + total;
  msg += "%0ALocation: " + locationLink;

  window.open("https://wa.me/917702622925?text=" + msg);
}

function showStatus(text){
  let box = document.getElementById("statusBox");
  let txt = document.getElementById("statusText");

  box.classList.remove("hidden");
  txt.innerText = text;
}
