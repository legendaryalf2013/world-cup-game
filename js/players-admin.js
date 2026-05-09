if (localStorage.getItem("isAdmin") !== "true") {
  document.body.innerHTML = "<h1 class='title'>Access Denied</h1>";
}

async function populateTeamSelects() {
  const bigSelect = document.getElementById("newPlayerBigTeam");
  const smallSelect = document.getElementById("newPlayerSmallTeams");

  bigSelect.innerHTML = "<option value=''>None</option>";
  smallSelect.innerHTML = "";

  const teams = await fetchTeamsList();
  teams.sort((a, b) => a.name.localeCompare(b.name));

  teams.forEach(t => {
    const opt1 = document.createElement("option");
    opt1.value = t.name;
    opt1.textContent = t.name;
    bigSelect.appendChild(opt1);

    const opt2 = document.createElement("option");
    opt2.value = t.name;
    opt2.textContent = t.name;
    smallSelect.appendChild(opt2);
  });
}

async function loadPlayers() {
  const container = document.getElementById("playersList");
  container.innerHTML = "";

  const snap = await db.collection("players").get();
  const players = [];
  snap.forEach(doc => players.push({ id: doc.id, ...doc.data() }));

  players.sort((a, b) => a.name.localeCompare(b.name));

  players.forEach(p => {
    const small = (p.teams && p.teams.small && p.teams.small.length)
      ? p.teams.small.join(", ")
      : "None";

    container.innerHTML += `
      <div class="card">
        <h3>${p.name} ${p.isAdmin ? "(Admin)" : ""}</h3>
        <p>Big Team: ${p.teams?.big || "None"}</p>
        <p>Small Teams: ${small}</p>
        <button class="btn" onclick="editPlayer('${p.id}')">Edit</button>
        <button class="btn red" onclick="deletePlayer('${p.id}')">Delete</button>
      </div>
    `;
  });
}

function editPlayer(id) {
  localStorage.setItem("editPlayerId", id);
  window.location.href = "edit-player.html";
}

async function deletePlayer(id) {
  await db.collection("players").doc(id).delete();
  loadPlayers();
}

async function addPlayer() {
  const name = document.getElementById("newPlayerName").value.trim();
  const bigSelect = document.getElementById("newPlayerBigTeam");
  const smallSelect = document.getElementById("newPlayerSmallTeams");
  const isAdmin = document.getElementById("newPlayerIsAdmin").checked;

  if (!name) {
    alert("Name required");
    return;
  }

  const playerId = name.toLowerCase().replace(/\s+/g, "_");

  const bigTeam = bigSelect.value || "";
  const smallTeams = Array.from(smallSelect.selectedOptions).map(o => o.value);

  await db.collection("players").doc(playerId).set({
    name,
    isAdmin,
    teams: {
      big: bigTeam,
      small: smallTeams
    }
  }, { merge: true });

  document.getElementById("newPlayerName").value = "";
  bigSelect.value = "";
  Array.from(smallSelect.options).forEach(o => o.selected = false);
  document.getElementById("newPlayerIsAdmin").checked = false;

  loadPlayers();
}

populateTeamSelects();
loadPlayers();
