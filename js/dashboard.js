const playerId = localStorage.getItem("playerId");
const isAdmin = localStorage.getItem("isAdmin");

if (!playerId) {
  window.location.href = "index.html";
}

db.collection("players").doc(playerId).get().then(doc => {
  const data = doc.data();
  document.getElementById("playerName").textContent =
    "Logged in as: " + data.name;
});

db.collection("settings").doc("prizeMoney").get().then(doc => {
  const el = document.getElementById("prizeMoney");
  if (doc.exists) {
    el.textContent = "Prize Pot: £" + doc.data().value;
  } else {
    el.textContent = "Prize Pot: £0";
  }
});

if (isAdmin === "true") {
  document.getElementById("adminButton").style.display = "block";
}

function logout() {
  localStorage.clear();
  window.location.href = "index.html";
}

// no PIN here, just go to admin page
function openAdmin() {
  window.location.href = "admin/admin.html";
}

// Top 3 leaderboard using points
async function loadTopLeaderboard() {
  const container = document.getElementById("topLeaderboard");
  container.innerHTML = "";

  const snap = await db.collection("players").get();
  const players = [];
  snap.forEach(doc => players.push({ id: doc.id, ...doc.data() }));

  const matches = await fetchMatches();

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
  const top = players.slice(0, 3);

  top.forEach((p, i) => {
    container.innerHTML += `
      <div class="card">
        <h3>#${i + 1} ${p.name}</h3>
        <p>${p.points} pts</p>
        <p>Big Team: ${p.teams?.big || "None"}</p>
      </div>
    `;
  });
}

loadTopLeaderboard();

// upcoming games on dashboard
async function loadDashboardUpcoming() {
  const container = document.getElementById("upcomingGames");
  container.innerHTML = "";

  const matches = await fetchMatches();
  const now = new Date();

  const upcoming = matches
    .filter(m => new Date(m.utcDate) > now)
    .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate))
    .slice(0, 5);

  if (!upcoming.length) {
    container.innerHTML = "<p>No upcoming games.</p>";
    return;
  }

  upcoming.forEach(m => {
    const home = m.homeTeam?.name || "TBD";
    const away = m.awayTeam?.name || "TBD";
    const date = new Date(m.utcDate).toLocaleString();

    container.innerHTML += `
      <div class="card match-card">
        <h3>${home} vs ${away}</h3>
        <p>Stage: ${m.stage}</p>
        <p>Group: ${m.group || "N/A"}</p>
        <p>Kick-off: ${date}</p>
      </div>
    `;
  });
}

loadDashboardUpcoming();
