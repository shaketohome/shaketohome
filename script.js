function order(item) {
  let phone = "917702622925";
  let msg = "I want to order: " + item;

  let url = "https://wa.me/" + phone + "?text=" + encodeURIComponent(msg);
  window.open(url, "_blank");
}
