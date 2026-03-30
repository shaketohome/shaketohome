function order(item) {
  let phone = "917702622925";
  let text = "I want to order: " + item;

  let url = "https://wa.me/" + phone + "?text=" + encodeURIComponent(text);

  window.open(url, "_blank");
}
