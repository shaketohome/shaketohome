function getLocation() {
  if (!navigator.geolocation) {
    alert("Location not supported");
    return;
  }

  navigator.geolocation.getCurrentPosition(
    (pos) => {
      let lat = pos.coords.latitude;
      let lon = pos.coords.longitude;

      document.getElementById("locationInput").value = "Location set ✔";

      window.userLocation =
        "https://maps.google.com/?q=" + lat + "," + lon;
    },
    () => {
      alert("Allow location access");
    }
  );
}

function order(item) {
  let msg = "Order: " + item;

  if (window.userLocation) {
    msg += " Location: " + window.userLocation;
  }

  window.open(
    "https://wa.me/917702622925?text=" +
      encodeURIComponent(msg)
  );
}
