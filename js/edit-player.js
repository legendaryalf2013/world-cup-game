if (localStorage.getItem("isAdmin") !== "true") {
  document.body.innerHTML = "<h1 class='title'>Access Denied</h1>";
}

const editPlayerId = localStorage.getItem("editPlayerId");

async function loadPlayer() {
  const doc = await db.collection("players").doc(editPlayerId).get();
  const p = doc.data();

  const teams = await fetchTeamsList();
  teams.sort((a, b) => a.name.localeCompare(b.name));

  const bigTeam = p.teams?.big || "";
  const smallTeams = (p.teams && p.teams.small) ? p.teams.small : [];

  let bigOptions = "<option value=''>None</option>";
  teams.forEach(t => {
    const selected = t.name === bigTeam ? "selected" : "";
    bigOptions += `<option value="${t.name}" ${selected}>${t.name}</option>`;
  });

  let smallOptions = "";
  teams.forEach(t => {
    const selected = smallTeams.includes(t.name) ? "selected" : "";
    smallOptions += `<option value="${t.name}" ${selected}>${t.name}</option>`;
  });

  document.getElementById("playerInfo").innerHTML = `
    <div class="card">
      <p>Name:</p>
      <input id="nameInput" class="input" value="${p.name}">
      <p>Big Team:</p>
      <select id="bigTeamInput" class="input">
        ${bigOptions}
      </select>
      <p>Small Teams (hold Ctrl / Cmd to select multiple):</p>
      <select id="smallTeamsInput" class="input" multiple size="8">
        ${smallOptions}
      </select>
      <label style="display:flex;align-items:center;gap:6px;margin:8px 0 10px;">
        <input type="checkbox" id="isAdminInput" ${p.isAdmin ? "checked" : ""}>
        <span>Admin user</span>
      </label>
      <button class="btn" onclick="savePlayer()">Save</button>
    </div>
  `;
}

async function savePlayer() {
  const name = document.getElementById("nameInput").value.trim();
  const bigTeam = document.getElementById("bigTeamInput").value || "";
  const smallTeams = Array.from(
    document.getElementById("smallTeamsInput").selectedOptions
  ).map(o => o.value);
  const isAdmin = document.getElementById("isAdminInput").checked;

  await db.collection("players").doc(editPlayerId).update({
    name,
    isAdmin,
    teams: {
      big: bigTeam,
      small: smallTeams
    }
  });

  alert("Saved");
}

loadPlayer();
