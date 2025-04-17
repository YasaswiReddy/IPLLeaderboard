import {
  users, type User, type InsertUser,
  leagues, type League, type InsertLeague,
  pointsSystem, type PointsSystem, type InsertPointsSystem,
  iplTeams, type IplTeam, type InsertIplTeam,
  playerRoles, type PlayerRole, type InsertPlayerRole,
  players, type Player, type InsertPlayer,
  matches, type Match, type InsertMatch,
  performances, type Performance, type InsertPerformance,
  fantasyTeams, type FantasyTeam, type InsertFantasyTeam,
  fantasyTeamPlayers, type FantasyTeamPlayer, type InsertFantasyTeamPlayer
} from "@shared/schema";

export interface IStorage {
  // User operations
  getUsers(): Promise<User[]>;
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // League operations
  getLeagues(): Promise<League[]>;
  getLeague(id: number): Promise<League | undefined>;
  getLeagueByName(name: string): Promise<League | undefined>;
  createLeague(league: InsertLeague): Promise<League>;
  
  // Points system operations
  getPointsSystem(leagueId: number): Promise<PointsSystem | undefined>;
  createPointsSystem(pointsSystem: InsertPointsSystem): Promise<PointsSystem>;
  
  // IPL Teams operations
  getIplTeams(): Promise<IplTeam[]>;
  getIplTeam(id: number): Promise<IplTeam | undefined>;
  createIplTeam(team: InsertIplTeam): Promise<IplTeam>;

  // Player roles operations
  getPlayerRoles(): Promise<PlayerRole[]>;
  getPlayerRole(id: number): Promise<PlayerRole | undefined>;
  createPlayerRole(role: InsertPlayerRole): Promise<PlayerRole>;

  // Players operations
  getPlayers(): Promise<Player[]>;
  getPlayer(id: number): Promise<Player | undefined>;
  getPlayersByTeam(teamId: number): Promise<Player[]>;
  createPlayer(player: InsertPlayer): Promise<Player>;
  searchPlayers(query: string): Promise<Player[]>;

  // Matches operations
  getMatches(): Promise<Match[]>;
  getMatch(id: number): Promise<Match | undefined>;
  getRecentMatches(limit: number): Promise<Match[]>;
  getUpcomingMatches(limit: number): Promise<Match[]>;
  createMatch(match: InsertMatch): Promise<Match>;

  // Performances operations
  getPerformances(): Promise<Performance[]>;
  getPerformance(id: number): Promise<Performance | undefined>;
  getPlayerPerformances(playerId: number): Promise<Performance[]>;
  getMatchPerformances(matchId: number): Promise<Performance[]>;
  getTopPerformances(limit: number): Promise<{performance: Performance, player: Player}[]>;
  createPerformance(performance: InsertPerformance): Promise<Performance>;

  // Fantasy teams operations
  getFantasyTeams(): Promise<FantasyTeam[]>;
  getFantasyTeamsByLeague(leagueId: number): Promise<FantasyTeam[]>;
  getFantasyTeam(id: number): Promise<FantasyTeam | undefined>;
  getUserFantasyTeam(userId: number): Promise<FantasyTeam | undefined>;
  getFantasyLeaderboard(): Promise<(FantasyTeam & { user: User })[]>;
  getFantasyLeaderboardByLeague(leagueId: number): Promise<(FantasyTeam & { user: User })[]>;
  createFantasyTeam(team: InsertFantasyTeam): Promise<FantasyTeam>;
  updateFantasyTeamPoints(id: number, totalPoints: number, weeklyPoints: number): Promise<FantasyTeam>;

  // Fantasy team players operations
  getFantasyTeamPlayers(teamId: number): Promise<(FantasyTeamPlayer & { player: Player })[]>;
  addPlayerToFantasyTeam(teamPlayer: InsertFantasyTeamPlayer): Promise<FantasyTeamPlayer>;
  removePlayerFromFantasyTeam(teamId: number, playerId: number): Promise<void>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private iplTeams: Map<number, IplTeam>;
  private playerRoles: Map<number, PlayerRole>;
  private players: Map<number, Player>;
  private matches: Map<number, Match>;
  private performances: Map<number, Performance>;
  private fantasyTeams: Map<number, FantasyTeam>;
  private fantasyTeamPlayers: Map<number, FantasyTeamPlayer>;
  
  private currentUserId: number = 1;
  private currentIplTeamId: number = 1;
  private currentPlayerRoleId: number = 1;
  private currentPlayerId: number = 1;
  private currentMatchId: number = 1;
  private currentPerformanceId: number = 1;
  private currentFantasyTeamId: number = 1;
  private currentFantasyTeamPlayerId: number = 1;

  constructor() {
    this.users = new Map();
    this.iplTeams = new Map();
    this.playerRoles = new Map();
    this.players = new Map();
    this.matches = new Map();
    this.performances = new Map();
    this.fantasyTeams = new Map();
    this.fantasyTeamPlayers = new Map();
    
    this.initializeData();
  }

  private initializeData() {
    // Initialize IPL Teams
    const iplTeamsData: InsertIplTeam[] = [
      { name: "Chennai Super Kings", shortName: "CSK", logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR_QScfbqGWokOWPW-Ir7P7_Dsp2XgAxhk2fA&usqp=CAU" },
      { name: "Mumbai Indians", shortName: "MI", logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQPvg_z9kTe4M5Y0ELBlgqSBJvnDuLEEXWEzQ&usqp=CAU" },
      { name: "Royal Challengers Bangalore", shortName: "RCB", logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTEYc_B3JIXUR2NiUCf9W5mTNM2YgBs81iN-w&usqp=CAU" },
      { name: "Delhi Capitals", shortName: "DC", logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQeYaEr-DUM96uZSPcfuet4pc2TcMXTu9N0Qw&usqp=CAU" },
      { name: "Rajasthan Royals", shortName: "RR", logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT-2ULUBpwcTELQ_lFZZFfvuAYTG41_Nt-U7g&usqp=CAU" },
      { name: "Punjab Kings", shortName: "PK", logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTfIl3a86PT7aKULsYATYUG3azMWvR3NEt-fw&usqp=CAU" },
      { name: "Kolkata Knight Riders", shortName: "KKR", logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSF1ybQlmOh-Rc2kVGqRArM8kMiIjONAoDxVA&usqp=CAU" },
      { name: "Sunrisers Hyderabad", shortName: "SRH", logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT30IKV3g1BZW4hx50xL5IKfu2WFR0i1PbUBA&usqp=CAU" },
      { name: "Gujarat Titans", shortName: "GT", logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRTftXna0--NKslARUXGDHHJ9KKDnYXlByaHw&usqp=CAU" },
      { name: "Lucknow Super Giants", shortName: "LSG", logoUrl: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQc8sEj1PykXCpq9JlSMbFf3GKKOq1Egf9QCA&usqp=CAU" }
    ];
    
    iplTeamsData.forEach(team => this.createIplTeam(team));
    
    // Initialize Player Roles
    const playerRolesData: InsertPlayerRole[] = [
      { name: "Batsman" },
      { name: "Bowler" },
      { name: "All-rounder" },
      { name: "Wicket-keeper" }
    ];
    
    playerRolesData.forEach(role => this.createPlayerRole(role));
    
    // Initialize Sample Players
    const playersData: InsertPlayer[] = [
      {
        name: "Virat Kohli", iplTeamId: 3, roleId: 1, imageUrl: "https://img.olympics.com/images/image/private/t_s_pog_staticContent_hero_md_2x/f_auto/primary/wnpgdisbdrg1urlmjebq",
        battingAvg: 48.2, strikeRate: 142.8, bowlingAvg: 92.1, economy: 8.9, totalRuns: 7500, totalWickets: 4, totalMatches: 242
      },
      {
        name: "MS Dhoni", iplTeamId: 1, roleId: 4, imageUrl: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/319900/319946.png",
        battingAvg: 38.9, strikeRate: 135.2, bowlingAvg: 0, economy: 0, totalRuns: 5000, totalWickets: 0, totalMatches: 230
      },
      {
        name: "Jasprit Bumrah", iplTeamId: 2, roleId: 2, imageUrl: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/323100/323119.png",
        battingAvg: 5.2, strikeRate: 94.5, bowlingAvg: 21.8, economy: 7.2, totalRuns: 42, totalWickets: 170, totalMatches: 120
      },
      {
        name: "Hardik Pandya", iplTeamId: 9, roleId: 3, imageUrl: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/331800/331892.png",
        battingAvg: 32.5, strikeRate: 147.6, bowlingAvg: 28.9, economy: 8.7, totalRuns: 2200, totalWickets: 65, totalMatches: 115
      },
      {
        name: "Rohit Sharma", iplTeamId: 2, roleId: 1, imageUrl: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/323100/323153.png",
        battingAvg: 45.2, strikeRate: 138.9, bowlingAvg: 48.7, economy: 9.2, totalRuns: 6800, totalWickets: 15, totalMatches: 234
      },
      {
        name: "Ravindra Jadeja", iplTeamId: 1, roleId: 3, imageUrl: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/364500/364527.png",
        battingAvg: 31.8, strikeRate: 140.2, bowlingAvg: 24.5, economy: 7.8, totalRuns: 2800, totalWickets: 142, totalMatches: 215
      },
      {
        name: "KL Rahul", iplTeamId: 10, roleId: 1, imageUrl: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/325700/325754.png",
        battingAvg: 47.9, strikeRate: 139.5, bowlingAvg: 0, economy: 0, totalRuns: 4200, totalWickets: 0, totalMatches: 118
      },
      {
        name: "Rishabh Pant", iplTeamId: 4, roleId: 4, imageUrl: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/319900/319943.png",
        battingAvg: 41.2, strikeRate: 149.8, bowlingAvg: 0, economy: 0, totalRuns: 3200, totalWickets: 0, totalMatches: 98
      },
      {
        name: "Yuzvendra Chahal", iplTeamId: 5, roleId: 2, imageUrl: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/319900/319956.png",
        battingAvg: 4.1, strikeRate: 78.2, bowlingAvg: 23.4, economy: 7.5, totalRuns: 38, totalWickets: 155, totalMatches: 131
      },
      {
        name: "Andre Russell", iplTeamId: 7, roleId: 3, imageUrl: "https://img1.hscicdn.com/image/upload/f_auto,t_ds_square_w_320,q_50/lsci/db/PICTURES/CMS/318800/318834.png",
        battingAvg: 30.8, strikeRate: 182.3, bowlingAvg: 26.7, economy: 9.1, totalRuns: 2100, totalWickets: 95, totalMatches: 112
      }
    ];
    
    playersData.forEach(player => this.createPlayer(player));
    
    // Create sample users and their fantasy teams
    const usersData: InsertUser[] = [
      { username: "rahul_s", password: "password123", name: "Rahul Sharma", email: "rahul@example.com", teamName: "FantasyKing2025" },
      { username: "priya_p", password: "password123", name: "Priya Patel", email: "priya@example.com", teamName: "CSK Fanatics" },
      { username: "vikram_s", password: "password123", name: "Vikram Singh", email: "vikram@example.com", teamName: "Knight Strikers" },
      { username: "arjun_k", password: "password123", name: "Arjun Kapoor", email: "arjun@example.com", teamName: "Mumbai Mavericks" },
      { username: "neha_g", password: "password123", name: "Neha Gupta", email: "neha@example.com", teamName: "Delhi Dynamites" },
      { username: "ravi_k", password: "password123", name: "Ravi Kumar", email: "ravi@example.com", teamName: "RCB United" },
      { username: "current_user", password: "password123", name: "Your Name", email: "user@example.com", teamName: "My Cricket XI" }
    ];
    
    const users = usersData.map(userData => this.createUser(userData));
    
    // Create fantasy teams
    this.createFantasyTeam({ userId: 1, name: "FantasyKing2025", totalPoints: 4289, weeklyPoints: 186, rank: 1, previousRank: 3 });
    this.createFantasyTeam({ userId: 2, name: "CSK Fanatics", totalPoints: 4156, weeklyPoints: 152, rank: 2, previousRank: 1 });
    this.createFantasyTeam({ userId: 3, name: "Knight Strikers", totalPoints: 4089, weeklyPoints: 178, rank: 3, previousRank: 6 });
    this.createFantasyTeam({ userId: 4, name: "Mumbai Mavericks", totalPoints: 3976, weeklyPoints: -28, rank: 4, previousRank: 2 });
    this.createFantasyTeam({ userId: 5, name: "Delhi Dynamites", totalPoints: 3845, weeklyPoints: 143, rank: 5, previousRank: 5 });
    this.createFantasyTeam({ userId: 6, name: "RCB United", totalPoints: 3789, weeklyPoints: 112, rank: 6, previousRank: 7 });
    this.createFantasyTeam({ userId: 7, name: "My Cricket XI", totalPoints: 3256, weeklyPoints: 95, rank: 14, previousRank: 17 });
    
    // Create matches
    const matchesData: InsertMatch[] = [
      {
        team1Id: 1, team2Id: 2, date: new Date("2025-04-28T14:00:00Z"), venue: "M.A. Chidambaram Stadium, Chennai",
        team1Score: "204/5 (20)", team2Score: "186/8 (20)", winnerId: 1, isCompleted: true, matchType: "High Scoring"
      },
      {
        team1Id: 3, team2Id: 4, date: new Date("2025-04-26T14:00:00Z"), venue: "M. Chinnaswamy Stadium, Bangalore",
        team1Score: "195/6 (20)", team2Score: "189/8 (20)", winnerId: 3, isCompleted: true, matchType: "Thriller"
      },
      {
        team1Id: 1, team2Id: 3, date: new Date(Date.now() + 86400000), venue: "M.A. Chidambaram Stadium, Chennai",
        isCompleted: false
      }
    ];
    
    const matches = matchesData.map(matchData => this.createMatch(matchData));
    
    // Create performances
    this.createPerformance({ matchId: 1, playerId: 2, runs: 72, wickets: 0, ballsFaced: 44, ballsBowled: 0, fours: 6, sixes: 4, catches: 0, stumpings: 1, runOuts: 0, fantasyPoints: 86 });
    this.createPerformance({ matchId: 1, playerId: 5, runs: 56, wickets: 0, ballsFaced: 38, ballsBowled: 0, fours: 4, sixes: 3, catches: 1, stumpings: 0, runOuts: 0, fantasyPoints: 72 });
    
    this.createPerformance({ matchId: 2, playerId: 1, runs: 98, wickets: 0, ballsFaced: 58, ballsBowled: 0, fours: 8, sixes: 5, catches: 1, stumpings: 0, runOuts: 0, fantasyPoints: 98 });
    this.createPerformance({ matchId: 2, playerId: 8, runs: 64, wickets: 0, ballsFaced: 38, ballsBowled: 0, fours: 6, sixes: 3, catches: 0, stumpings: 1, runOuts: 1, fantasyPoints: 76 });
    
    // Create weekly top performances
    this.createPerformance({ matchId: 0, playerId: 1, runs: 112, wickets: 0, ballsFaced: 56, ballsBowled: 0, fours: 8, sixes: 7, catches: 1, stumpings: 0, runOuts: 0, fantasyPoints: 127 });
    this.createPerformance({ matchId: 0, playerId: 3, runs: 8, wickets: 5, ballsFaced: 4, ballsBowled: 24, fours: 1, sixes: 0, catches: 1, stumpings: 0, runOuts: 0, fantasyPoints: 118 });
    this.createPerformance({ matchId: 0, playerId: 4, runs: 65, wickets: 2, ballsFaced: 38, ballsBowled: 24, fours: 4, sixes: 3, catches: 1, stumpings: 0, runOuts: 1, fantasyPoints: 105 });
  }

  // User operations
  async getUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.username === username);
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const newUser: User = { ...user, id };
    this.users.set(id, newUser);
    return newUser;
  }

  // IPL Teams operations
  async getIplTeams(): Promise<IplTeam[]> {
    return Array.from(this.iplTeams.values());
  }

  async getIplTeam(id: number): Promise<IplTeam | undefined> {
    return this.iplTeams.get(id);
  }

  async createIplTeam(team: InsertIplTeam): Promise<IplTeam> {
    const id = this.currentIplTeamId++;
    const newTeam: IplTeam = { ...team, id };
    this.iplTeams.set(id, newTeam);
    return newTeam;
  }

  // Player roles operations
  async getPlayerRoles(): Promise<PlayerRole[]> {
    return Array.from(this.playerRoles.values());
  }

  async getPlayerRole(id: number): Promise<PlayerRole | undefined> {
    return this.playerRoles.get(id);
  }

  async createPlayerRole(role: InsertPlayerRole): Promise<PlayerRole> {
    const id = this.currentPlayerRoleId++;
    const newRole: PlayerRole = { ...role, id };
    this.playerRoles.set(id, newRole);
    return newRole;
  }

  // Players operations
  async getPlayers(): Promise<Player[]> {
    return Array.from(this.players.values());
  }

  async getPlayer(id: number): Promise<Player | undefined> {
    return this.players.get(id);
  }

  async getPlayersByTeam(teamId: number): Promise<Player[]> {
    return Array.from(this.players.values()).filter(player => player.iplTeamId === teamId);
  }

  async createPlayer(player: InsertPlayer): Promise<Player> {
    const id = this.currentPlayerId++;
    const newPlayer: Player = { ...player, id };
    this.players.set(id, newPlayer);
    return newPlayer;
  }

  async searchPlayers(query: string): Promise<Player[]> {
    if (!query) return [];
    const lowerQuery = query.toLowerCase();
    return Array.from(this.players.values()).filter(player => 
      player.name.toLowerCase().includes(lowerQuery)
    );
  }

  // Matches operations
  async getMatches(): Promise<Match[]> {
    return Array.from(this.matches.values());
  }

  async getMatch(id: number): Promise<Match | undefined> {
    return this.matches.get(id);
  }

  async getRecentMatches(limit: number): Promise<Match[]> {
    return Array.from(this.matches.values())
      .filter(match => match.isCompleted)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, limit);
  }

  async getUpcomingMatches(limit: number): Promise<Match[]> {
    return Array.from(this.matches.values())
      .filter(match => !match.isCompleted)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, limit);
  }

  async createMatch(match: InsertMatch): Promise<Match> {
    const id = this.currentMatchId++;
    const newMatch: Match = { ...match, id };
    this.matches.set(id, newMatch);
    return newMatch;
  }

  // Performances operations
  async getPerformances(): Promise<Performance[]> {
    return Array.from(this.performances.values());
  }

  async getPerformance(id: number): Promise<Performance | undefined> {
    return this.performances.get(id);
  }

  async getPlayerPerformances(playerId: number): Promise<Performance[]> {
    return Array.from(this.performances.values()).filter(perf => perf.playerId === playerId);
  }

  async getMatchPerformances(matchId: number): Promise<Performance[]> {
    return Array.from(this.performances.values()).filter(perf => perf.matchId === matchId);
  }
  
  async getTopPerformances(limit: number): Promise<{performance: Performance, player: Player}[]> {
    const performances = Array.from(this.performances.values())
      .sort((a, b) => b.fantasyPoints - a.fantasyPoints)
      .slice(0, limit);
      
    return performances.map(performance => {
      const player = this.players.get(performance.playerId);
      if (!player) throw new Error(`Player not found: ${performance.playerId}`);
      return { performance, player };
    });
  }

  async createPerformance(performance: InsertPerformance): Promise<Performance> {
    const id = this.currentPerformanceId++;
    const newPerformance: Performance = { ...performance, id };
    this.performances.set(id, newPerformance);
    return newPerformance;
  }

  // Fantasy teams operations
  async getFantasyTeams(): Promise<FantasyTeam[]> {
    return Array.from(this.fantasyTeams.values());
  }

  async getFantasyTeam(id: number): Promise<FantasyTeam | undefined> {
    return this.fantasyTeams.get(id);
  }

  async getUserFantasyTeam(userId: number): Promise<FantasyTeam | undefined> {
    return Array.from(this.fantasyTeams.values()).find(team => team.userId === userId);
  }

  async getFantasyLeaderboard(): Promise<(FantasyTeam & { user: User })[]> {
    const teams = Array.from(this.fantasyTeams.values())
      .sort((a, b) => b.totalPoints - a.totalPoints);
      
    return teams.map(team => {
      const user = this.users.get(team.userId);
      if (!user) throw new Error(`User not found: ${team.userId}`);
      return { ...team, user };
    });
  }

  async createFantasyTeam(team: InsertFantasyTeam): Promise<FantasyTeam> {
    const id = this.currentFantasyTeamId++;
    const newTeam: FantasyTeam = { ...team, id };
    this.fantasyTeams.set(id, newTeam);
    return newTeam;
  }

  async updateFantasyTeamPoints(id: number, totalPoints: number, weeklyPoints: number): Promise<FantasyTeam> {
    const team = this.fantasyTeams.get(id);
    if (!team) throw new Error(`Fantasy team not found: ${id}`);
    
    const updatedTeam: FantasyTeam = { ...team, totalPoints, weeklyPoints };
    this.fantasyTeams.set(id, updatedTeam);
    return updatedTeam;
  }

  // Fantasy team players operations
  async getFantasyTeamPlayers(teamId: number): Promise<(FantasyTeamPlayer & { player: Player })[]> {
    const teamPlayers = Array.from(this.fantasyTeamPlayers.values())
      .filter(tp => tp.fantasyTeamId === teamId);
      
    return teamPlayers.map(teamPlayer => {
      const player = this.players.get(teamPlayer.playerId);
      if (!player) throw new Error(`Player not found: ${teamPlayer.playerId}`);
      return { ...teamPlayer, player };
    });
  }

  async addPlayerToFantasyTeam(teamPlayer: InsertFantasyTeamPlayer): Promise<FantasyTeamPlayer> {
    const id = this.currentFantasyTeamPlayerId++;
    const newTeamPlayer: FantasyTeamPlayer = { ...teamPlayer, id };
    this.fantasyTeamPlayers.set(id, newTeamPlayer);
    return newTeamPlayer;
  }

  async removePlayerFromFantasyTeam(teamId: number, playerId: number): Promise<void> {
    const teamPlayerId = Array.from(this.fantasyTeamPlayers.entries())
      .find(([_, tp]) => tp.fantasyTeamId === teamId && tp.playerId === playerId)?.[0];
      
    if (teamPlayerId) {
      this.fantasyTeamPlayers.delete(teamPlayerId);
    }
  }
}

import { db } from './db';
import { eq, desc, asc, and, like, gte, lte, sql } from 'drizzle-orm';

export class DatabaseStorage implements IStorage {
  // User operations
  async getUsers(): Promise<User[]> {
    return db.select().from(users);
  }

  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [newUser] = await db.insert(users).values(user).returning();
    return newUser;
  }

  // IPL Teams operations
  async getIplTeams(): Promise<IplTeam[]> {
    return db.select().from(iplTeams);
  }

  async getIplTeam(id: number): Promise<IplTeam | undefined> {
    const [team] = await db.select().from(iplTeams).where(eq(iplTeams.id, id));
    return team;
  }

  async createIplTeam(team: InsertIplTeam): Promise<IplTeam> {
    const [newTeam] = await db.insert(iplTeams).values(team).returning();
    return newTeam;
  }

  // Player roles operations
  async getPlayerRoles(): Promise<PlayerRole[]> {
    return db.select().from(playerRoles);
  }

  async getPlayerRole(id: number): Promise<PlayerRole | undefined> {
    const [role] = await db.select().from(playerRoles).where(eq(playerRoles.id, id));
    return role;
  }

  async createPlayerRole(role: InsertPlayerRole): Promise<PlayerRole> {
    const [newRole] = await db.insert(playerRoles).values(role).returning();
    return newRole;
  }

  // Players operations
  async getPlayers(): Promise<Player[]> {
    const result = await db.select({
      player: players,
      team: iplTeams,
      role: playerRoles
    })
    .from(players)
    .leftJoin(iplTeams, eq(players.iplTeamId, iplTeams.id))
    .leftJoin(playerRoles, eq(players.roleId, playerRoles.id));

    return result.map(({ player, team, role }) => ({
      ...player,
      team,
      role
    }));
  }

  async getPlayer(id: number): Promise<Player | undefined> {
    const result = await db.select({
      player: players,
      team: iplTeams,
      role: playerRoles
    })
    .from(players)
    .leftJoin(iplTeams, eq(players.iplTeamId, iplTeams.id))
    .leftJoin(playerRoles, eq(players.roleId, playerRoles.id))
    .where(eq(players.id, id));

    if (result.length === 0) return undefined;
    
    const { player, team, role } = result[0];
    return {
      ...player,
      team,
      role
    };
  }

  async getPlayersByTeam(teamId: number): Promise<Player[]> {
    const result = await db.select({
      player: players,
      team: iplTeams,
      role: playerRoles
    })
    .from(players)
    .leftJoin(iplTeams, eq(players.iplTeamId, iplTeams.id))
    .leftJoin(playerRoles, eq(players.roleId, playerRoles.id))
    .where(eq(players.iplTeamId, teamId));

    return result.map(({ player, team, role }) => ({
      ...player,
      team,
      role
    }));
  }

  async createPlayer(player: InsertPlayer): Promise<Player> {
    const [newPlayer] = await db.insert(players).values(player).returning();
    return newPlayer;
  }

  async searchPlayers(query: string): Promise<Player[]> {
    const searchTerm = `%${query}%`;
    
    const result = await db.select({
      player: players,
      team: iplTeams,
      role: playerRoles
    })
    .from(players)
    .leftJoin(iplTeams, eq(players.iplTeamId, iplTeams.id))
    .leftJoin(playerRoles, eq(players.roleId, playerRoles.id))
    .where(like(players.name, searchTerm));

    return result.map(({ player, team, role }) => ({
      ...player,
      team,
      role
    }));
  }

  // Matches operations
  async getMatches(): Promise<Match[]> {
    try {
      // Simply fetch all matches first
      const allMatches = await db.select().from(matches);
      
      if (allMatches.length === 0) {
        return [];
      }
      
      // Then fetch all teams
      const allTeams = await db.select().from(iplTeams);
      
      // Create a map for quick team lookups
      const teamsMap = new Map(allTeams.map(team => [team.id, team]));
      
      // Enrich the matches with team data
      return allMatches.map(match => ({
        ...match,
        team1: teamsMap.get(match.team1Id) || null,
        team2: teamsMap.get(match.team2Id) || null,
        winner: match.winnerId ? teamsMap.get(match.winnerId) || null : null
      }));
    } catch (error) {
      console.error("Error fetching matches:", error);
      return [];
    }
  }

  async getMatch(id: number): Promise<Match | undefined> {
    try {
      // First fetch the match
      const matchResult = await db.select().from(matches).where(eq(matches.id, id)).limit(1);
      
      if (matchResult.length === 0) {
        return undefined;
      }
      
      const match = matchResult[0];
      
      // Then fetch the related teams
      const team1Result = await db.select().from(iplTeams).where(eq(iplTeams.id, match.team1Id)).limit(1);
      const team2Result = await db.select().from(iplTeams).where(eq(iplTeams.id, match.team2Id)).limit(1);
      
      const team1 = team1Result.length > 0 ? team1Result[0] : null;
      const team2 = team2Result.length > 0 ? team2Result[0] : null;
      
      let winner = null;
      if (match.winnerId) {
        const winnerResult = await db.select().from(iplTeams).where(eq(iplTeams.id, match.winnerId)).limit(1);
        winner = winnerResult.length > 0 ? winnerResult[0] : null;
      }
      
      return {
        ...match,
        team1,
        team2,
        winner
      };
    } catch (error) {
      console.error(`Error fetching match with id ${id}:`, error);
      return undefined;
    }
  }

  async getRecentMatches(limit: number): Promise<Match[]> {
    try {
      // First get the basic match data
      const matchesData = await db.select()
        .from(matches)
        .where(eq(matches.isCompleted, true))
        .orderBy(desc(matches.date))
        .limit(limit);
      
      if (matchesData.length === 0) {
        return [];
      }
      
      // Then fetch all the teams for these matches
      const teamsData = await db.select().from(iplTeams);
      const teamsMap = new Map(teamsData.map(team => [team.id, team]));
      
      // Enrich the matches with team data
      return matchesData.map(match => ({
        ...match,
        team1: teamsMap.get(match.team1Id) || null,
        team2: teamsMap.get(match.team2Id) || null,
        winner: match.winnerId ? teamsMap.get(match.winnerId) || null : null
      }));
    } catch (error) {
      console.error("Error fetching recent matches:", error);
      return [];
    }
  }

  async getUpcomingMatches(limit: number): Promise<Match[]> {
    try {
      const now = new Date();
      
      // First get the basic match data
      const matchesData = await db.select()
        .from(matches)
        .where(and(
          eq(matches.isCompleted, false),
          gte(matches.date, now)
        ))
        .orderBy(asc(matches.date))
        .limit(limit);
      
      if (matchesData.length === 0) {
        return [];
      }
      
      // Then fetch all the teams for these matches
      const teamsData = await db.select().from(iplTeams);
      const teamsMap = new Map(teamsData.map(team => [team.id, team]));
      
      // Enrich the matches with team data
      return matchesData.map(match => ({
        ...match,
        team1: teamsMap.get(match.team1Id) || null,
        team2: teamsMap.get(match.team2Id) || null,
        winner: match.winnerId ? teamsMap.get(match.winnerId) || null : null
      }));
    } catch (error) {
      console.error("Error fetching upcoming matches:", error);
      return [];
    }
  }

  async createMatch(match: InsertMatch): Promise<Match> {
    const [newMatch] = await db.insert(matches).values(match).returning();
    return newMatch;
  }

  // Performances operations
  async getPerformances(): Promise<Performance[]> {
    const result = await db.select({
      performance: performances,
      player: players
    })
    .from(performances)
    .leftJoin(players, eq(performances.playerId, players.id));

    return result.map(({ performance, player }) => ({
      ...performance,
      player
    }));
  }

  async getPerformance(id: number): Promise<Performance | undefined> {
    const result = await db.select({
      performance: performances,
      player: players
    })
    .from(performances)
    .leftJoin(players, eq(performances.playerId, players.id))
    .where(eq(performances.id, id));

    if (result.length === 0) return undefined;
    
    const { performance, player } = result[0];
    return {
      ...performance,
      player
    };
  }

  async getPlayerPerformances(playerId: number): Promise<Performance[]> {
    const result = await db.select({
      performance: performances,
      player: players
    })
    .from(performances)
    .leftJoin(players, eq(performances.playerId, players.id))
    .where(eq(performances.playerId, playerId))
    .orderBy(desc(performances.id));  // Assuming newest performances have higher IDs

    return result.map(({ performance, player }) => ({
      ...performance,
      player
    }));
  }

  async getMatchPerformances(matchId: number): Promise<Performance[]> {
    const result = await db.select({
      performance: performances,
      player: players
    })
    .from(performances)
    .leftJoin(players, eq(performances.playerId, players.id))
    .where(eq(performances.matchId, matchId));

    return result.map(({ performance, player }) => ({
      ...performance,
      player
    }));
  }

  async getTopPerformances(limit: number): Promise<{performance: Performance, player: Player}[]> {
    const result = await db.select({
      performance: performances,
      player: players
    })
    .from(performances)
    .leftJoin(players, eq(performances.playerId, players.id))
    .orderBy(desc(performances.fantasyPoints))
    .limit(limit);

    return result.map(({ performance, player }) => ({
      performance,
      player
    }));
  }

  async createPerformance(performance: InsertPerformance): Promise<Performance> {
    const [newPerformance] = await db.insert(performances).values(performance).returning();
    return newPerformance;
  }

  // Fantasy teams operations
  async getFantasyTeams(): Promise<FantasyTeam[]> {
    const result = await db.select({
      fantasyTeam: fantasyTeams,
      user: users
    })
    .from(fantasyTeams)
    .leftJoin(users, eq(fantasyTeams.userId, users.id));

    return result.map(({ fantasyTeam, user }) => ({
      ...fantasyTeam,
      user
    }));
  }

  async getFantasyTeam(id: number): Promise<FantasyTeam | undefined> {
    const result = await db.select({
      fantasyTeam: fantasyTeams,
      user: users
    })
    .from(fantasyTeams)
    .leftJoin(users, eq(fantasyTeams.userId, users.id))
    .where(eq(fantasyTeams.id, id));

    if (result.length === 0) return undefined;
    
    const { fantasyTeam, user } = result[0];
    return {
      ...fantasyTeam,
      user
    };
  }

  async getUserFantasyTeam(userId: number): Promise<FantasyTeam | undefined> {
    const result = await db.select({
      fantasyTeam: fantasyTeams,
      user: users
    })
    .from(fantasyTeams)
    .leftJoin(users, eq(fantasyTeams.userId, users.id))
    .where(eq(fantasyTeams.userId, userId));

    if (result.length === 0) return undefined;
    
    const { fantasyTeam, user } = result[0];
    return {
      ...fantasyTeam,
      user
    };
  }

  async getFantasyLeaderboard(): Promise<(FantasyTeam & { user: User })[]> {
    const result = await db.select({
      fantasyTeam: fantasyTeams,
      user: users
    })
    .from(fantasyTeams)
    .leftJoin(users, eq(fantasyTeams.userId, users.id))
    .orderBy(desc(fantasyTeams.totalPoints));
    
    // Calculate ranks
    let currentRank = 1;
    let prevPoints = -1;
    let rankOffset = 0;
    
    const leaderboard = result.map(({ fantasyTeam, user }, index) => {
      // If points are the same, assign same rank
      if (prevPoints === fantasyTeam.totalPoints) {
        rankOffset++;
      } else {
        currentRank = index + 1;
        rankOffset = 0;
        prevPoints = fantasyTeam.totalPoints;
      }
      
      return {
        ...fantasyTeam,
        user,
        rank: currentRank - rankOffset
      };
    });
    
    return leaderboard;
  }

  async createFantasyTeam(team: InsertFantasyTeam): Promise<FantasyTeam> {
    const [newTeam] = await db.insert(fantasyTeams).values(team).returning();
    return newTeam;
  }

  async updateFantasyTeamPoints(id: number, totalPoints: number, weeklyPoints: number): Promise<FantasyTeam> {
    const [updatedTeam] = await db.update(fantasyTeams)
      .set({ totalPoints, weeklyPoints })
      .where(eq(fantasyTeams.id, id))
      .returning();
    return updatedTeam;
  }

  // Fantasy team players operations
  async getFantasyTeamPlayers(teamId: number): Promise<(FantasyTeamPlayer & { player: Player })[]> {
    const result = await db.select({
      fantasyTeamPlayer: fantasyTeamPlayers,
      player: players
    })
    .from(fantasyTeamPlayers)
    .leftJoin(players, eq(fantasyTeamPlayers.playerId, players.id))
    .where(eq(fantasyTeamPlayers.teamId, teamId));

    return result.map(({ fantasyTeamPlayer, player }) => ({
      ...fantasyTeamPlayer,
      player
    }));
  }

  async addPlayerToFantasyTeam(teamPlayer: InsertFantasyTeamPlayer): Promise<FantasyTeamPlayer> {
    const [newTeamPlayer] = await db.insert(fantasyTeamPlayers).values(teamPlayer).returning();
    return newTeamPlayer;
  }

  async removePlayerFromFantasyTeam(teamId: number, playerId: number): Promise<void> {
    await db.delete(fantasyTeamPlayers)
      .where(and(
        eq(fantasyTeamPlayers.teamId, teamId),
        eq(fantasyTeamPlayers.playerId, playerId)
      ));
  }
}

export const storage = new DatabaseStorage();
