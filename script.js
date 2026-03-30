function order(item) {
  let phone = "917702622925";
  let message = "Hello, I want to order: " + item;

  let url = "https://wa.me/" + phone + "?text=" + encodeURIComponent(message);

  window.open(url, "_blank");
}
