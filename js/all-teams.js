async function loadAllTeams() {
  const container = document.getElementById("teamsList");
  container.innerHTML = "";

  const snap = await db.collection("players").get();
  const teamsMap = {};

  snap.forEach(doc => {
    const p = doc.data();
    const big = p.teams?.big;
    const small = p.teams?.small || [];

    if (big) {
      if (!teamsMap[big]) teamsMap[big] = [];
      teamsMap[big].push(p.name);
    }

    small.forEach(team => {
      if (!teamsMap[team]) teamsMap[team] = [];
      teamsMap[team].push(p.name);
    });
  });

  const teams = Object.keys(teamsMap).sort();

  if (teams.length === 0) {
    container.innerHTML = "<p>No teams assigned yet.</p>";
    return;
  }

  teams.forEach(team => {
    container.innerHTML += `
      <div class="player-card">
        <h3>${team}</h3>
        <p>Players: ${teamsMap[team].join(", ")}</p>
      </div>
    `;
  });
}

loadAllTeams();
