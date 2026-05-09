const API_KEY = "ef462cc3293d404ba475c3a1403d0456";
const WC_URL = "https://api.football-data.org/v4/competitions/WC/matches";

let cachedMatches = null;

async function fetchMatches() {
  if (cachedMatches) return cachedMatches;
  try {
    const res = await fetch(WC_URL, {
      headers: { "X-Auth-Token": API_KEY }
    });

    if (!res.ok) {
      if (document.getElementById("matchesList")) {
        document.getElementById("matchesList").innerHTML =
          "<p class='error'>Error loading matches (CORS or API limit).</p>";
      }
      return [];
    }

    const data = await res.json();
    cachedMatches = data.matches || [];
    return cachedMatches;
  } catch (e) {
    if (document.getElementById("matchesList")) {
      document.getElementById("matchesList").innerHTML =
        "<p class='error'>Network error loading matches.</p>";
    }
    return [];
  }
}

function renderMatches(matches) {
  const container = document.getElementById("matchesList");
  if (!container) return;

  container.innerHTML = "";

  if (!matches.length) {
    container.innerHTML = "<p>No matches found.</p>";
    return;
  }

  matches.forEach(m => {
    const home = m.homeTeam?.name || "TBD";
    const away = m.awayTeam?.name || "TBD";
    const scoreHome = m.score?.fullTime?.home ?? "-";
    const scoreAway = m.score?.fullTime?.away ?? "-";
    const htHome = m.score?.halfTime?.home ?? "-";
    const htAway = m.score?.halfTime?.away ?? "-";
    const date = new Date(m.utcDate).toLocaleString();
    const venue = m.venue || m.area?.name || "Unknown venue";

    container.innerHTML += `
      <div class="card match-card">
        <h3>${home} ${scoreHome} - ${scoreAway} ${away}</h3>
        <p>Status: ${m.status}</p>
        <p>Stage: ${m.stage}</p>
        <p>Group: ${m.group || "N/A"}</p>
        <p>Venue: ${venue}</p>
        <p>Kick-off: ${date}</p>
      </div>
    `;
  });
}

async function loadAllMatches() {
  const matches = await fetchMatches();
  renderMatches(matches);
}

async function loadLiveMatches() {
  const matches = await fetchMatches();
  renderMatches(matches.filter(m => m.status === "LIVE"));
}

async function loadKnockout() {
  const matches = await fetchMatches();
  const knockoutStages = ["LAST_16", "QUARTER_FINALS", "SEMI_FINALS", "FINAL"];
  renderMatches(matches.filter(m => knockoutStages.includes(m.stage)));
}

async function loadUpcoming() {
  const matches = await fetchMatches();
  const now = new Date();
  const upcoming = matches
    .filter(m => new Date(m.utcDate) > now)
    .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));
  renderMatches(upcoming);
}

// Filters
async function loadFilters() {
  const teamSelect = document.getElementById("teamFilter");
  const personSelect = document.getElementById("personFilter");

  if (teamSelect) {
    teamSelect.innerHTML = "<option value=''>All teams</option>";
    const teams = await fetchTeamsList();
    teams.sort((a, b) => a.name.localeCompare(b.name));
    teams.forEach(t => {
      const opt = document.createElement("option");
      opt.value = t.name;
      opt.textContent = t.name;
      teamSelect.appendChild(opt);
    });
  }

  if (personSelect) {
    personSelect.innerHTML = "<option value=''>All people</option>";
    const snap = await db.collection("players").get();
    const players = [];
    snap.forEach(doc => players.push({ id: doc.id, ...doc.data() }));
    players.sort((a, b) => a.name.localeCompare(b.name));
    players.forEach(p => {
      const opt = document.createElement("option");
      opt.value = p.id;
      opt.textContent = p.name;
      personSelect.appendChild(opt);
    });
  }
}

async function applyTeamFilter() {
  const teamSelect = document.getElementById("teamFilter");
  const teamName = teamSelect.value;
  if (!teamName) {
    loadAllMatches();
    return;
  }

  const matches = await fetchMatches();
  const filtered = matches.filter(m => {
    const home = m.homeTeam?.name;
    const away = m.awayTeam?.name;
    return home === teamName || away === teamName;
  });

  renderMatches(filtered);
}

async function applyPersonFilter() {
  const personSelect = document.getElementById("personFilter");
  const playerId = personSelect.value;
  if (!playerId) {
    loadAllMatches();
    return;
  }

  const doc = await db.collection("players").doc(playerId).get();
  if (!doc.exists) {
    loadAllMatches();
    return;
  }

  const p = doc.data();
  const big = p.teams?.big || null;
  const small = p.teams?.small || [];

  const matches = await fetchMatches();
  const filtered = matches.filter(m => {
    const home = m.homeTeam?.name;
    const away = m.awayTeam?.name;
    return (
      (big && (home === big || away === big)) ||
      (small && small.includes(home)) ||
      (small && small.includes(away))
    );
  });

  renderMatches(filtered);
}

function clearFilters() {
  const teamSelect = document.getElementById("teamFilter");
  const personSelect = document.getElementById("personFilter");
  if (teamSelect) teamSelect.value = "";
  if (personSelect) personSelect.value = "";
  loadAllMatches();
}

// auto-load when on scores page
if (document.getElementById("matchesList")) {
  loadAllMatches();
  loadFilters();
}
