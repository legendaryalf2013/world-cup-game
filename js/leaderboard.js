async function getAllMatches() {
  if (typeof fetchMatches === "function") {
    return await fetchMatches();
  }
  return [];
}

async function loadLeaderboard() {
  const container = document.getElementById("leaderboard");
  container.innerHTML = "";

  const snap = await db.collection("players").get();
  const players = [];
  snap.forEach(doc => players.push({ id: doc.id, ...doc.data() }));

  const matches = await getAllMatches();

  players.forEach(p => {
    let totalPoints = 0;
    const big = p.teams?.big || null;
    const small = p.teams?.small || [];

    matches.forEach(m => {
      const home = m.homeTeam?.name;
      const away = m.awayTeam?.name;
      const stage = m.stage;

      const involved =
        (big && (home === big || away === big)) ||
        (small && small.includes(home)) ||
        (small && small.includes(away));

      if (involved) {
        totalPoints += getStagePoints(stage);
      }
    });

    p.points = totalPoints;
  });

  players.sort((a, b) => b.points - a.points || a.name.localeCompare(b.name));

  players.forEach((p, index) => {
    const small = (p.teams && p.teams.small && p.teams.small.length)
      ? p.teams.small.join(", ")
      : "None";

    container.innerHTML += `
      <div class="card">
        <h3>#${index + 1} ${p.name} - ${p.points} pts ${p.isAdmin ? "(Admin)" : ""}</h3>
        <p>Big Team: ${p.teams?.big || "None"}</p>
        <p>Small Teams: ${small}</p>
      </div>
    `;
  });
}

loadLeaderboard();
