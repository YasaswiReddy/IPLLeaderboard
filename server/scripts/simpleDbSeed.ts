import { db } from '../db';
import {
  iplTeams, playerRoles, players, matches,
  insertIplTeamSchema, insertPlayerRoleSchema, insertPlayerSchema, insertMatchSchema
} from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Simple script to seed the database with minimal test data
 */
async function seedDatabase() {
  try {
    console.log('Starting database seeding process...');
    
    // Step 1: Insert IPL teams
    await seedIplTeams();
    
    // Step 2: Insert player roles
    await seedPlayerRoles();
    
    // Step 3: Insert players
    await seedPlayers();
    
    // Step 4: Insert matches
    await seedMatches();
    
    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}

/**
 * Seed IPL teams data
 */
async function seedIplTeams() {
  try {
    console.log('Adding IPL teams...');
    
    const teams = [
      { name: 'Mumbai Indians', shortName: 'MI', logoUrl: 'https://www.mumbaiindians.com/static-assets/images/logo.png' },
      { name: 'Chennai Super Kings', shortName: 'CSK', logoUrl: 'https://www.chennaisuperkings.com/assets/images/csk_logo.png' },
      { name: 'Royal Challengers Bangalore', shortName: 'RCB', logoUrl: 'https://www.royalchallengers.com/PRRCB01/public/images/RCB-logo.png' },
      { name: 'Kolkata Knight Riders', shortName: 'KKR', logoUrl: 'https://www.kkr.in/static-assets/images/logo.png' },
      { name: 'Delhi Capitals', shortName: 'DC', logoUrl: 'https://www.delhicapitals.in/static-assets/images/logo.png' }
    ];
    
    for (const team of teams) {
      // Check if team already exists
      const existingTeam = await db.select().from(iplTeams).where(eq(iplTeams.name, team.name)).limit(1);
      
      if (existingTeam.length === 0) {
        const teamData = insertIplTeamSchema.parse(team);
        await db.insert(iplTeams).values(teamData);
        console.log(`Added team: ${team.name}`);
      } else {
        console.log(`Team ${team.name} already exists, skipping`);
      }
    }
    
    console.log('Finished seeding IPL teams');
  } catch (error) {
    console.error('Error seeding IPL teams:', error);
    throw error;
  }
}

/**
 * Seed player roles
 */
async function seedPlayerRoles() {
  try {
    console.log('Seeding player roles...');
    
    const roles = [
      { name: 'Batsman' },
      { name: 'Bowler' },
      { name: 'All-rounder' },
      { name: 'Wicket-keeper' },
      { name: 'Captain' }
    ];
    
    for (const role of roles) {
      // Check if role already exists
      const existingRole = await db.select().from(playerRoles).where(eq(playerRoles.name, role.name)).limit(1);
      
      if (existingRole.length === 0) {
        const roleData = insertPlayerRoleSchema.parse(role);
        await db.insert(playerRoles).values(roleData);
        console.log(`Added role: ${role.name}`);
      } else {
        console.log(`Role ${role.name} already exists, skipping`);
      }
    }
    
    console.log('Finished seeding player roles');
  } catch (error) {
    console.error('Error seeding player roles:', error);
    throw error;
  }
}

/**
 * Seed players data
 */
async function seedPlayers() {
  try {
    console.log('Seeding players...');
    const dbTeams = await db.select().from(iplTeams);
    const dbRoles = await db.select().from(playerRoles);
    
    if (dbTeams.length === 0 || dbRoles.length === 0) {
      console.log('No teams or roles found in database, skipping player seeding');
      return;
    }
    
    // Create a map for easy team and role lookup
    const teamMap = new Map(dbTeams.map(team => [team.name, team.id]));
    const roleMap = new Map(dbRoles.map(role => [role.name, role.id]));
    
    // Example players for Mumbai Indians
    const miPlayers = [
      {
        name: 'Rohit Sharma',
        iplTeamId: teamMap.get('Mumbai Indians')!,
        roleId: roleMap.get('Batsman')!,
        imageUrl: 'https://static.iplt20.com/players/284/107.png',
        battingAvg: 31.3,
        bowlingAvg: null,
        strikeRate: 130.3,
        economy: null,
        totalRuns: 5879,
        totalWickets: 15,
        totalMatches: 227
      },
      {
        name: 'Jasprit Bumrah',
        iplTeamId: teamMap.get('Mumbai Indians')!,
        roleId: roleMap.get('Bowler')!,
        imageUrl: 'https://static.iplt20.com/players/284/1124.png',
        battingAvg: 5.2,
        bowlingAvg: 23.31,
        strikeRate: 84.5,
        economy: 7.39,
        totalRuns: 56,
        totalWickets: 145,
        totalMatches: 120
      }
    ];
    
    // Example players for Chennai Super Kings
    const cskPlayers = [
      {
        name: 'MS Dhoni',
        iplTeamId: teamMap.get('Chennai Super Kings')!,
        roleId: roleMap.get('Wicket-keeper')!,
        imageUrl: 'https://static.iplt20.com/players/284/1.png',
        battingAvg: 38.69,
        bowlingAvg: null,
        strikeRate: 135.2,
        economy: null,
        totalRuns: 4948,
        totalWickets: 0,
        totalMatches: 234
      },
      {
        name: 'Ravindra Jadeja',
        iplTeamId: teamMap.get('Chennai Super Kings')!,
        roleId: roleMap.get('All-rounder')!,
        imageUrl: 'https://static.iplt20.com/players/284/9.png',
        battingAvg: 26.9,
        bowlingAvg: 29.69,
        strikeRate: 127.6,
        economy: 7.62,
        totalRuns: 2274,
        totalWickets: 132,
        totalMatches: 210
      }
    ];
    
    // Example players for RCB
    const rcbPlayers = [
      {
        name: 'Virat Kohli',
        iplTeamId: teamMap.get('Royal Challengers Bangalore')!,
        roleId: roleMap.get('Batsman')!,
        imageUrl: 'https://static.iplt20.com/players/284/164.png',
        battingAvg: 37.15,
        bowlingAvg: 92.5,
        strikeRate: 129.95,
        economy: 8.8,
        totalRuns: 6624,
        totalWickets: 4,
        totalMatches: 223
      }
    ];
    
    // Combine all players
    const allPlayers = [...miPlayers, ...cskPlayers, ...rcbPlayers];
    
    for (const player of allPlayers) {
      // Check if player already exists
      const existingPlayer = await db.select()
        .from(players)
        .where(eq(players.name, player.name))
        .limit(1);
      
      if (existingPlayer.length === 0) {
        const playerData = insertPlayerSchema.parse(player);
        await db.insert(players).values(playerData);
        console.log(`Added player: ${player.name}`);
      } else {
        console.log(`Player ${player.name} already exists, skipping`);
      }
    }
    
    console.log('Finished seeding players');
  } catch (error) {
    console.error('Error seeding players:', error);
    throw error;
  }
}

/**
 * Seed matches data
 */
async function seedMatches() {
  try {
    console.log('Seeding matches...');
    const dbTeams = await db.select().from(iplTeams);
    
    if (dbTeams.length < 2) {
      console.log('Not enough teams found in database, skipping match seeding');
      return;
    }
    
    // Create a map for easy team lookup
    const teamMap = new Map(dbTeams.map(team => [team.name, team.id]));
    
    // Create upcoming and past matches
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);
    
    const upcomingMatches = [
      {
        team1Id: teamMap.get('Mumbai Indians')!,
        team2Id: teamMap.get('Chennai Super Kings')!,
        date: tomorrow,
        venue: 'Wankhede Stadium, Mumbai',
        isCompleted: false,
        matchType: 'T20'
      },
      {
        team1Id: teamMap.get('Royal Challengers Bangalore')!,
        team2Id: teamMap.get('Kolkata Knight Riders')!,
        date: dayAfterTomorrow,
        venue: 'M. Chinnaswamy Stadium, Bangalore',
        isCompleted: false,
        matchType: 'T20'
      }
    ];
    
    const completedMatches = [
      {
        team1Id: teamMap.get('Delhi Capitals')!,
        team2Id: teamMap.get('Mumbai Indians')!,
        date: yesterday,
        venue: 'Arun Jaitley Stadium, Delhi',
        team1Score: '184/5',
        team2Score: '189/2',
        winnerId: teamMap.get('Mumbai Indians')!,
        isCompleted: true,
        matchType: 'T20'
      }
    ];
    
    const allMatches = [...upcomingMatches, ...completedMatches];
    
    for (const match of allMatches) {
      // Check if match already exists for this date
      const existingMatch = await db.select()
        .from(matches)
        .where(eq(matches.date, match.date))
        .limit(1);
      
      if (existingMatch.length === 0) {
        const matchData = insertMatchSchema.parse(match);
        await db.insert(matches).values(matchData);
        
        const team1Name = dbTeams.find(t => t.id === match.team1Id)?.name;
        const team2Name = dbTeams.find(t => t.id === match.team2Id)?.name;
        console.log(`Added match: ${team1Name} vs ${team2Name} on ${match.date.toISOString().split('T')[0]}`);
      } else {
        console.log(`Match on ${match.date.toISOString()} already exists, skipping`);
      }
    }
    
    console.log('Finished seeding matches');
  } catch (error) {
    console.error('Error seeding matches:', error);
    throw error;
  }
}

// Execute the seeding function
seedDatabase().then(() => {
  console.log('Seeding script completed');
  process.exit(0);
}).catch((error) => {
  console.error('Seeding script failed:', error);
  process.exit(1);
});