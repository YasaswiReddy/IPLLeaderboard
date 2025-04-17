export interface Team {
  id: number;
  name: string;
  shortName: string;
  logoUrl: string;
}

export interface PlayerRole {
  id: number;
  name: string;
}

export interface Player {
  id: number;
  name: string;
  iplTeamId: number;
  roleId: number;
  imageUrl: string | null;
  battingAvg: number | null;
  bowlingAvg: number | null;
  strikeRate: number | null;
  economy: number | null;
  totalRuns: number;
  totalWickets: number;
  totalMatches: number;
  team?: Team;
  role?: PlayerRole;
}

export interface Match {
  id: number;
  team1Id: number;
  team2Id: number;
  date: string;
  venue: string;
  team1Score: string | null;
  team2Score: string | null;
  winnerId: number | null;
  isCompleted: boolean;
  matchType: string | null;
  team1?: Team;
  team2?: Team;
  winner?: Team | null;
}

export interface Performance {
  id: number;
  matchId: number;
  playerId: number;
  runs: number;
  wickets: number;
  ballsFaced: number;
  ballsBowled: number;
  fours: number;
  sixes: number;
  catches: number;
  stumpings: number;
  runOuts: number;
  fantasyPoints: number;
  player?: Player;
}

export interface FantasyTeam {
  id: number;
  userId: number;
  name: string;
  totalPoints: number;
  weeklyPoints: number;
  rank: number | null;
  previousRank: number | null;
  user?: {
    id: number;
    username: string;
    name: string;
    email: string;
    teamName: string;
  };
}

export interface TopPerformer {
  performance: Performance;
  player: Player;
}

export interface StatsOverview {
  nextMatch: Match | null;
  currentLeader: {
    name: string;
    managerName: string;
    points: number;
  } | null;
  topScorer: {
    name: string;
    points: number;
  } | null;
}
