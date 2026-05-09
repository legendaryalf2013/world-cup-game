const API_KEY = "ef462cc3293d404ba475c3a1403d0456";
const TEAMS_URL = "https://api.football-data.org/v4/competitions/WC/teams";

let cachedTeams = null;

async function fetchTeamsList() {
  if (cachedTeams) return cachedTeams;
  try {
    const res = await fetch(TEAMS_URL, {
      headers: { "X-Auth-Token": API_KEY }
    });
    if (!res.ok) {
      console.error("Error loading teams");
      return [];
    }
    const data = await res.json();
    cachedTeams = data.teams || [];
    return cachedTeams;
  } catch (e) {
    console.error("Network error loading teams", e);
    return [];
  }
}
