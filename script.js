let cart = [];

const products = [
  {name: "Oreo Shake", price: 120, img: "https://images.unsplash.com/photo-1586917049334-2f3d1c77d5b1"},
  {name: "KitKat Shake", price: 130, img: "https://images.unsplash.com/photo-1627308595229-7830a5c91f9f"},
  {name: "Strawberry Shake", price: 110, img: "https://images.unsplash.com/photo-1553531889-56cc480ac5cb"},
  {name: "Black Currant", price: 120, img: "https://images.unsplash.com/photo-1604908176997-4314a3f54a3b"},
  {name: "Chocolate Shake", price: 130, img: "https://images.unsplash.com/photo-1572490122747-3968b75cc699"},
  {name: "Strawberry Lassi", price: 90, img: "https://images.unsplash.com/photo-1600718374662-0483d2b9da44"},
  {name: "Watermelon Juice", price: 80, img: "https://images.unsplash.com/photo-1553530666-ba11a7da3888"},
  {name: "Pineapple Juice", price: 85, img: "https://images.unsplash.com/photo-1589308078054-8322a5d53e21"},
  {name: "Grapes Juice", price: 85, img: "https://images.unsplash.com/photo-1572441710534-68054a6b6c8c"}
];

const grid = document.getElementById("productGrid");

products.forEach((p, index) => {
  grid.innerHTML += `
    <div class="item">
      <img src="${p.img}" alt="${p.name}">
      <h3>${p.name}</h3>
      <p>₹${p.price}</p>
      <button onclick="addToCart(${index})">Add</button>
    </div>
  `;
});

function addToCart(index) {
  cart.push(products[index]);
  alert(products[index].name + " added");
}

function checkout() {
  if(cart.length === 0){
    alert("Cart empty");
    return;
  }

  let message = "Order:%0A";
  let total = 0;

  cart.forEach(item => {
    message += item.name + " - ₹" + item.price + "%0A";
    total += item.price;
  });

  message += "%0ATotal: ₹" + total;

  window.open("https://wa.me/917702622925?text=" + message);
}
