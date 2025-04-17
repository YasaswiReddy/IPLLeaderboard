import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // API route prefix
  const apiRouter = '/api';

  // Get all IPL teams
  app.get(`${apiRouter}/teams`, async (req, res) => {
    try {
      const teams = await storage.getIplTeams();
      res.json(teams);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch IPL teams" });
    }
  });

  // Get a specific IPL team
  app.get(`${apiRouter}/teams/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const team = await storage.getIplTeam(id);
      
      if (!team) {
        return res.status(404).json({ message: "Team not found" });
      }
      
      res.json(team);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch team" });
    }
  });

  // Get all players
  app.get(`${apiRouter}/players`, async (req, res) => {
    try {
      let players;
      const teamId = req.query.teamId ? parseInt(req.query.teamId as string) : undefined;
      const search = req.query.search as string | undefined;
      
      if (teamId) {
        players = await storage.getPlayersByTeam(teamId);
      } else if (search) {
        players = await storage.searchPlayers(search);
      } else {
        players = await storage.getPlayers();
      }
      
      const rolesData = await storage.getPlayerRoles();
      const teamsData = await storage.getIplTeams();
      
      const roles = new Map(rolesData.map(role => [role.id, role]));
      const teams = new Map(teamsData.map(team => [team.id, team]));
      
      const enrichedPlayers = players.map(player => ({
        ...player,
        team: teams.get(player.iplTeamId),
        role: roles.get(player.roleId)
      }));
      
      res.json(enrichedPlayers);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch players" });
    }
  });

  // Get a specific player
  app.get(`${apiRouter}/players/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const player = await storage.getPlayer(id);
      
      if (!player) {
        return res.status(404).json({ message: "Player not found" });
      }
      
      const team = await storage.getIplTeam(player.iplTeamId);
      const role = await storage.getPlayerRole(player.roleId);
      const performances = await storage.getPlayerPerformances(id);
      
      res.json({
        ...player,
        team,
        role,
        performances
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch player" });
    }
  });

  // Get all matches
  app.get(`${apiRouter}/matches`, async (req, res) => {
    try {
      const type = req.query.type as string;
      let matches;
      
      if (type === 'recent') {
        matches = await storage.getRecentMatches(parseInt(req.query.limit as string) || 5);
      } else if (type === 'upcoming') {
        matches = await storage.getUpcomingMatches(parseInt(req.query.limit as string) || 5);
      } else {
        matches = await storage.getMatches();
      }
      
      if (matches.length === 0) {
        return res.json([]);
      }
      
      const teamsData = await storage.getIplTeams();
      const teams = new Map(teamsData.map(team => [team.id, team]));
      
      const enrichedMatches = matches.map(match => ({
        ...match,
        team1: teams.get(match.team1Id),
        team2: teams.get(match.team2Id),
        winner: match.winnerId ? teams.get(match.winnerId) : null
      }));
      
      res.json(enrichedMatches);
    } catch (error) {
      console.error("Error fetching matches:", error);
      res.status(500).json({ message: "Failed to fetch matches" });
    }
  });

  // Get a specific match with performances
  app.get(`${apiRouter}/matches/:id`, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const match = await storage.getMatch(id);
      
      if (!match) {
        return res.status(404).json({ message: "Match not found" });
      }
      
      const team1 = await storage.getIplTeam(match.team1Id);
      const team2 = await storage.getIplTeam(match.team2Id);
      const winner = match.winnerId ? await storage.getIplTeam(match.winnerId) : null;
      
      const performances = await storage.getMatchPerformances(id);
      const playersData = await storage.getPlayers();
      const players = new Map(playersData.map(player => [player.id, player]));
      
      const enrichedPerformances = performances.map(performance => ({
        ...performance,
        player: players.get(performance.playerId)
      }));
      
      res.json({
        ...match,
        team1,
        team2,
        winner,
        performances: enrichedPerformances
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch match" });
    }
  });

  // Get fantasy leaderboard
  app.get(`${apiRouter}/leaderboard`, async (req, res) => {
    try {
      const leaderboard = await storage.getFantasyLeaderboard();
      res.json(leaderboard);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch leaderboard" });
    }
  });

  // Get top performers
  app.get(`${apiRouter}/top-performers`, async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 3;
      const topPerformers = await storage.getTopPerformances(limit);
      
      if (topPerformers.length === 0) {
        return res.json([]);
      }
      
      const rolesData = await storage.getPlayerRoles();
      const teamsData = await storage.getIplTeams();
      
      const roles = new Map(rolesData.map(role => [role.id, role]));
      const teams = new Map(teamsData.map(team => [team.id, team]));
      
      const enrichedPerformers = topPerformers.map(({ performance, player }) => {
        if (!player) {
          return null;
        }
        return {
          performance,
          player: {
            ...player,
            team: teams.get(player.iplTeamId),
            role: roles.get(player.roleId)
          }
        };
      }).filter(Boolean); // Filter out nulls
      
      res.json(enrichedPerformers);
    } catch (error) {
      console.error("Error fetching top performers:", error);
      res.status(500).json({ message: "Failed to fetch top performers" });
    }
  });

  // Get stats overview (for the dashboard)
  app.get(`${apiRouter}/stats-overview`, async (req, res) => {
    try {
      const upcomingMatches = await storage.getUpcomingMatches(1);
      const nextMatch = upcomingMatches.length > 0 ? upcomingMatches[0] : null;
      const teams = await storage.getIplTeams();
      const teamsMap = new Map(teams.map(team => [team.id, team]));
      
      let nextMatchData = null;
      if (nextMatch) {
        nextMatchData = {
          ...nextMatch,
          team1: teamsMap.get(nextMatch.team1Id),
          team2: teamsMap.get(nextMatch.team2Id),
        };
      }
      
      const leaderboard = await storage.getFantasyLeaderboard();
      const currentLeader = leaderboard.length > 0 ? leaderboard[0] : null;
      
      const topPerformers = await storage.getTopPerformances(1);
      const topScorer = topPerformers.length > 0 ? topPerformers[0] : null;
      
      // Only fetch player data if we have a top scorer
      let playerData = null;
      if (topScorer && topScorer.player) {
        playerData = await storage.getPlayer(topScorer.player.id);
      }
      
      res.json({
        nextMatch: nextMatchData,
        currentLeader: currentLeader && currentLeader.user ? {
          name: currentLeader.name,
          managerName: currentLeader.user.name,
          points: currentLeader.totalPoints
        } : null,
        topScorer: topScorer && topScorer.player ? {
          name: topScorer.player.name,
          points: topScorer.performance.fantasyPoints
        } : null
      });
    } catch (error) {
      console.error("Error fetching stats overview:", error);
      res.status(500).json({ message: "Failed to fetch stats overview" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
