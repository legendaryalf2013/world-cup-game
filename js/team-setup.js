async function loadTeamSetup() {
  const container = document.getElementById("teamSetup");
  container.innerHTML = "";

  const snap = await db.collection("players").get();

  snap.forEach(doc => {
    const p = doc.data();
    container.innerHTML += `
      <div class="player-card">
        <h3>${p.name}</h3>
        <p>Big Team: ${p.teams?.big ?? "None"}</p>
        <p>Small Teams: ${p.teams?.small?.join(", ") ?? "None"}</p>
      </div>
    `;
  });
}

loadTeamSetup();
