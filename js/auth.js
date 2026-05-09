async function login() {
  const name = document.getElementById("nameInput").value.trim();
  const error = document.getElementById("loginError");

  error.textContent = "";

  if (!name) {
    error.textContent = "Enter your name";
    return;
  }

  const playerId = name.toLowerCase().replace(/\s+/g, "_");
  const doc = await db.collection("players").doc(playerId).get();

  if (!doc.exists) {
    error.textContent = "Name not found";
    return;
  }

  const data = doc.data();
  localStorage.setItem("playerId", playerId);
  localStorage.setItem("isAdmin", data.isAdmin ? "true" : "false");

  window.location.href = "dashboard.html";
}
