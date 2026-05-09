const mtId = localStorage.getItem("playerId");
if (!mtId) window.location.href = "index.html";

async function loadMyTeams() {
  const doc = await db.collection("players").doc(mtId).get();
  const p = doc.data();

  document.getElementById("bigTeam").innerHTML = `
    <div class="card">
      <h2>Big Team</h2>
      <p>${p.teams?.big || "None"}</p>
    </div>
  `;

  const small = (p.teams && p.teams.small && p.teams.small.length)
    ? p.teams.small.join(", ")
    : "None";

  document.getElementById("smallTeams").innerHTML = `
    <div class="card">
      <h2>Small Teams</h2>
      <p>${small}</p>
    </div>
  `;
}

loadMyTeams();
