if (!localStorage.getItem("playerId")) {
  document.body.innerHTML = "<h1 class='title'>Access Denied</h1>";
} else {
  const isAdmin = localStorage.getItem("isAdmin") === "true";
  if (!isAdmin) {
    document.body.innerHTML = "<h1 class='title'>Access Denied</h1>";
  } else {
    const pin = prompt("Enter admin PIN:");
    if (pin !== "231593") {
      alert("Incorrect PIN");
      window.location.href = "../dashboard.html";
    }
  }
}

function logout() {
  localStorage.clear();
  window.location.href = "../index.html";
}
