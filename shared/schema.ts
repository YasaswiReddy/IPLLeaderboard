import { pgTable, text, serial, integer, boolean, real, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { relations } from "drizzle-orm";
import { z } from "zod";

// User schema (fantasy team managers)
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  teamName: text("team_name").notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  teamName: true,
});

// IPL Teams
export const iplTeams = pgTable("ipl_teams", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  shortName: text("short_name").notNull().unique(),
  logoUrl: text("logo_url").notNull(),
});

export const insertIplTeamSchema = createInsertSchema(iplTeams).pick({
  name: true,
  shortName: true,
  logoUrl: true,
});

// Player roles
export const playerRoles = pgTable("player_roles", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
});

export const insertPlayerRoleSchema = createInsertSchema(playerRoles).pick({
  name: true,
});

// Players
export const players = pgTable("players", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  iplTeamId: integer("ipl_team_id").notNull(),
  roleId: integer("role_id").notNull(),
  imageUrl: text("image_url"),
  battingAvg: real("batting_avg"),
  bowlingAvg: real("bowling_avg"),
  strikeRate: real("strike_rate"),
  economy: real("economy"),
  totalRuns: integer("total_runs").default(0),
  totalWickets: integer("total_wickets").default(0),
  totalMatches: integer("total_matches").default(0),
});

export const insertPlayerSchema = createInsertSchema(players).pick({
  name: true,
  iplTeamId: true,
  roleId: true,
  imageUrl: true,
  battingAvg: true,
  bowlingAvg: true,
  strikeRate: true,
  economy: true,
  totalRuns: true,
  totalWickets: true,
  totalMatches: true,
});

// Matches
export const matches = pgTable("matches", {
  id: serial("id").primaryKey(),
  team1Id: integer("team1_id").notNull(),
  team2Id: integer("team2_id").notNull(),
  date: timestamp("date").notNull(),
  venue: text("venue").notNull(),
  team1Score: text("team1_score"),
  team2Score: text("team2_score"),
  winnerId: integer("winner_id"),
  isCompleted: boolean("is_completed").default(false),
  matchType: text("match_type"), // High Scoring, Thriller, etc.
});

export const insertMatchSchema = createInsertSchema(matches).pick({
  team1Id: true,
  team2Id: true,
  date: true,
  venue: true,
  team1Score: true,
  team2Score: true,
  winnerId: true,
  isCompleted: true,
  matchType: true,
});

// Player performances in matches
export const performances = pgTable("performances", {
  id: serial("id").primaryKey(),
  matchId: integer("match_id").notNull(),
  playerId: integer("player_id").notNull(),
  runs: integer("runs").default(0),
  wickets: integer("wickets").default(0),
  ballsFaced: integer("balls_faced").default(0),
  ballsBowled: integer("balls_bowled").default(0),
  fours: integer("fours").default(0),
  sixes: integer("sixes").default(0),
  catches: integer("catches").default(0),
  stumpings: integer("stumpings").default(0),
  runOuts: integer("run_outs").default(0),
  fantasyPoints: integer("fantasy_points").default(0),
});

export const insertPerformanceSchema = createInsertSchema(performances).pick({
  matchId: true,
  playerId: true,
  runs: true,
  wickets: true,
  ballsFaced: true,
  ballsBowled: true,
  fours: true,
  sixes: true,
  catches: true,
  stumpings: true,
  runOuts: true,
  fantasyPoints: true,
});

// Fantasy teams
export const fantasyTeams = pgTable("fantasy_teams", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  totalPoints: integer("total_points").default(0),
  weeklyPoints: integer("weekly_points").default(0),
  rank: integer("rank"),
  previousRank: integer("previous_rank"),
});

export const insertFantasyTeamSchema = createInsertSchema(fantasyTeams).pick({
  userId: true,
  name: true,
  totalPoints: true,
  weeklyPoints: true,
  rank: true,
  previousRank: true,
});

// Fantasy team players
export const fantasyTeamPlayers = pgTable("fantasy_team_players", {
  id: serial("id").primaryKey(),
  fantasyTeamId: integer("fantasy_team_id").notNull(),
  playerId: integer("player_id").notNull(),
  isCaptain: boolean("is_captain").default(false),
  isViceCaptain: boolean("is_vice_captain").default(false),
});

export const insertFantasyTeamPlayerSchema = createInsertSchema(fantasyTeamPlayers).pick({
  fantasyTeamId: true,
  playerId: true,
  isCaptain: true,
  isViceCaptain: true,
});

// Relations
export const usersRelations = relations(users, ({ one, many }) => ({
  fantasyTeam: one(fantasyTeams, {
    fields: [users.id],
    references: [fantasyTeams.userId],
  }),
}));

export const iplTeamsRelations = relations(iplTeams, ({ many }) => ({
  players: many(players),
  team1Matches: many(matches, { relationName: "team1" }),
  team2Matches: many(matches, { relationName: "team2" }),
  wonMatches: many(matches, { relationName: "winner" }),
}));

export const playerRolesRelations = relations(playerRoles, ({ many }) => ({
  players: many(players),
}));

export const playersRelations = relations(players, ({ one, many }) => ({
  team: one(iplTeams, {
    fields: [players.iplTeamId],
    references: [iplTeams.id],
  }),
  role: one(playerRoles, {
    fields: [players.roleId],
    references: [playerRoles.id],
  }),
  performances: many(performances),
  fantasyTeamPlayers: many(fantasyTeamPlayers),
}));

export const matchesRelations = relations(matches, ({ one, many }) => ({
  team1: one(iplTeams, {
    fields: [matches.team1Id],
    references: [iplTeams.id],
    relationName: "team1",
  }),
  team2: one(iplTeams, {
    fields: [matches.team2Id],
    references: [iplTeams.id],
    relationName: "team2",
  }),
  winner: one(iplTeams, {
    fields: [matches.winnerId],
    references: [iplTeams.id],
    relationName: "winner",
  }),
  performances: many(performances),
}));

export const performancesRelations = relations(performances, ({ one }) => ({
  match: one(matches, {
    fields: [performances.matchId],
    references: [matches.id],
  }),
  player: one(players, {
    fields: [performances.playerId],
    references: [players.id],
  }),
}));

export const fantasyTeamsRelations = relations(fantasyTeams, ({ one, many }) => ({
  user: one(users, {
    fields: [fantasyTeams.userId],
    references: [users.id],
  }),
  players: many(fantasyTeamPlayers),
}));

export const fantasyTeamPlayersRelations = relations(fantasyTeamPlayers, ({ one }) => ({
  fantasyTeam: one(fantasyTeams, {
    fields: [fantasyTeamPlayers.fantasyTeamId],
    references: [fantasyTeams.id],
  }),
  player: one(players, {
    fields: [fantasyTeamPlayers.playerId],
    references: [players.id],
  }),
}));

// Export types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type IplTeam = typeof iplTeams.$inferSelect;
export type InsertIplTeam = z.infer<typeof insertIplTeamSchema>;

export type PlayerRole = typeof playerRoles.$inferSelect;
export type InsertPlayerRole = z.infer<typeof insertPlayerRoleSchema>;

export type Player = typeof players.$inferSelect;
export type InsertPlayer = z.infer<typeof insertPlayerSchema>;

export type Match = typeof matches.$inferSelect;
export type InsertMatch = z.infer<typeof insertMatchSchema>;

export type Performance = typeof performances.$inferSelect;
export type InsertPerformance = z.infer<typeof insertPerformanceSchema>;

export type FantasyTeam = typeof fantasyTeams.$inferSelect;
export type InsertFantasyTeam = z.infer<typeof insertFantasyTeamSchema>;

export type FantasyTeamPlayer = typeof fantasyTeamPlayers.$inferSelect;
export type InsertFantasyTeamPlayer = z.infer<typeof insertFantasyTeamPlayerSchema>;
