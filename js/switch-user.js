if (localStorage.getItem("isAdmin") !== "true") {
  document.body.innerHTML = "<h1 class='title'>Access Denied</h1>";
}

async function loadUsers() {
  const select = document.getElementById("userSelect");
  select.innerHTML = "";

  const snap = await db.collection("players").get();
  const players = [];
  snap.forEach(doc => players.push({ id: doc.id, ...doc.data() }));

  players.sort((a, b) => a.name.localeCompare(b.name));

  players.forEach(p => {
    const opt = document.createElement("option");
    opt.value = p.id;
    opt.textContent = p.name + (p.isAdmin ? " (Admin)" : "");
    select.appendChild(opt);
  });
}

function switchUser() {
  const select = document.getElementById("userSelect");
  const newId = select.value;
  if (!newId) return;

  localStorage.setItem("playerId", newId);
  localStorage.setItem("isAdmin", "false");
  window.location.href = "../dashboard.html";
}

loadUsers();
