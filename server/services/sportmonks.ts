import fetch from 'node-fetch';

const API_TOKEN = process.env.SPORTMONKS_API_TOKEN;
const BASE_URL = 'https://cricket.sportmonks.com/api/v2.0';

/**
 * Generic function to make API requests to SportMonks
 */
async function makeApiRequest<T>(endpoint: string, params: Record<string, string> = {}): Promise<T> {
  try {
    // Add API token to params
    const queryParams = new URLSearchParams({
      api_token: API_TOKEN || '',
      ...params
    });

    const url = `${BASE_URL}${endpoint}?${queryParams}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    return data as T;
  } catch (error) {
    console.error(`Error making API request to ${endpoint}:`, error);
    throw error;
  }
}

/**
 * Fetch teams from the IPL league
 */
export async function getIplTeams() {
  // First find the IPL league ID
  const leagues = await makeApiRequest<any>('/leagues');
  const iplLeague = leagues.data.find((league: any) => 
    league.name.toLowerCase().includes('indian premier league') || 
    league.name.toLowerCase().includes('ipl')
  );

  if (!iplLeague) {
    throw new Error('IPL league not found');
  }

  // Then fetch teams for that league
  const teams = await makeApiRequest<any>(`/teams`, { 
    league_id: iplLeague.id.toString(),
    include: 'squad'
  });

  return teams.data;
}

/**
 * Get fixtures (matches) for IPL
 */
export async function getIplFixtures() {
  // First find the IPL league ID
  const leagues = await makeApiRequest<any>('/leagues');
  const iplLeague = leagues.data.find((league: any) => 
    league.name.toLowerCase().includes('indian premier league') || 
    league.name.toLowerCase().includes('ipl')
  );

  if (!iplLeague) {
    throw new Error('IPL league not found');
  }

  // Get the latest season
  const seasons = await makeApiRequest<any>(`/leagues/${iplLeague.id}`);
  const currentSeason = seasons.data.current_season_id;

  if (!currentSeason) {
    throw new Error('No current season found for IPL');
  }

  // Then fetch fixtures for the current season
  const fixtures = await makeApiRequest<any>(`/fixtures`, {
    league_id: iplLeague.id.toString(),
    season_id: currentSeason.toString(),
    include: 'localTeam,visitorTeam,venue'
  });

  return fixtures.data;
}

/**
 * Get players for a team
 */
export async function getTeamPlayers(teamId: string) {
  const team = await makeApiRequest<any>(`/teams/${teamId}`, {
    include: 'squad'
  });

  return team.data.squad.data;
}

/**
 * Get player details with statistics
 */
export async function getPlayerDetails(playerId: string) {
  const player = await makeApiRequest<any>(`/players/${playerId}`, {
    include: 'career,teams,currentteams,country'
  });

  return player.data;
}

/**
 * Get fixtures by date range
 */
export async function getFixturesByDateRange(startDate: string, endDate: string) {
  const fixtures = await makeApiRequest<any>(`/fixtures`, {
    filter: {
      starts_between: `${startDate},${endDate}`
    },
    include: 'localTeam,visitorTeam,venue'
  });

  return fixtures.data;
}

/**
 * Get match scorecard and player performances
 */
export async function getMatchScorecard(fixtureId: string) {
  const scorecard = await makeApiRequest<any>(`/fixtures/${fixtureId}`, {
    include: 'scoreboards,batting,bowling,lineup,runs,manofmatch'
  });

  return scorecard.data;
}

export default {
  getIplTeams,
  getIplFixtures,
  getTeamPlayers,
  getPlayerDetails,
  getFixturesByDateRange,
  getMatchScorecard
};