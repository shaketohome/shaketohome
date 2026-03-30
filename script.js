let cart = [];

function orderItem(item){
  cart.push(item);
  alert(item + " added");
}

function whatsappOrder(){
  let msg = "Order:\n" + cart.join("\n");
  let url = "https://wa.me/917702622925?text=" + encodeURIComponent(msg);
  window.open(url);
}
