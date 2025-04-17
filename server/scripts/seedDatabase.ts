import { db } from '../db';
import sportmonksService from '../services/sportmonks';
import {
  iplTeams, playerRoles, players, matches,
  insertIplTeamSchema, insertPlayerRoleSchema, insertPlayerSchema, insertMatchSchema
} from '@shared/schema';
import { eq } from 'drizzle-orm';

/**
 * Script to seed the database with data from SportMonks API
 */
async function seedDatabase() {
  try {
    console.log('Starting database seeding process...');
    
    // Step 1: Fetch and insert IPL teams
    await seedIplTeams();
    
    // Step 2: Insert player roles
    await seedPlayerRoles();
    
    // Step 3: Fetch and insert players
    await seedPlayers();
    
    // Step 4: Fetch and insert matches
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
    console.log('Fetching IPL teams from SportMonks API...');
    const apiTeams = await sportmonksService.getIplTeams();
    
    console.log(`Found ${apiTeams.length} teams, inserting into the database...`);
    
    for (const team of apiTeams) {
      // Check if team already exists
      const existingTeam = await db.select().from(iplTeams).where(eq(iplTeams.name, team.name)).limit(1);
      
      if (existingTeam.length === 0) {
        // Transform API data to match our schema
        const teamData = insertIplTeamSchema.parse({
          name: team.name,
          shortName: team.code || team.name.substring(0, 3).toUpperCase(),
          logoUrl: team.image_path
        });
        
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
    console.log('Fetching IPL teams to get players...');
    const dbTeams = await db.select().from(iplTeams);
    const dbRoles = await db.select().from(playerRoles);
    
    // Create a map of role names to IDs for easy lookup
    const roleMap = new Map(dbRoles.map(role => [role.name.toLowerCase(), role.id]));
    
    // Default to all-rounder if role isn't found
    const defaultRoleId = roleMap.get('all-rounder') || dbRoles[0].id;
    
    // Fetch API teams again to get their IDs
    const apiTeams = await sportmonksService.getIplTeams();
    
    for (const dbTeam of dbTeams) {
      console.log(`Fetching players for team: ${dbTeam.name}`);
      
      // Find the API team that matches our DB team
      const apiTeam = apiTeams.find(team => team.name === dbTeam.name);
      
      if (!apiTeam) {
        console.log(`No API team found matching ${dbTeam.name}, skipping`);
        continue;
      }
      
      // Get players for this team
      const apiPlayers = await sportmonksService.getTeamPlayers(apiTeam.id.toString());
      
      console.log(`Found ${apiPlayers.length} players for team ${dbTeam.name}`);
      
      for (const player of apiPlayers) {
        // Check if player already exists
        const existingPlayer = await db.select()
          .from(players)
          .where(eq(players.name, player.fullname))
          .limit(1);
        
        if (existingPlayer.length === 0) {
          // Determine player role
          let roleId = defaultRoleId;
          if (player.position) {
            const positionLower = player.position.name.toLowerCase();
            
            if (positionLower.includes('bat')) {
              roleId = roleMap.get('batsman') || defaultRoleId;
            } else if (positionLower.includes('bowl')) {
              roleId = roleMap.get('bowler') || defaultRoleId;
            } else if (positionLower.includes('all')) {
              roleId = roleMap.get('all-rounder') || defaultRoleId;
            } else if (positionLower.includes('keep')) {
              roleId = roleMap.get('wicket-keeper') || defaultRoleId;
            }
          }
          
          // Get detailed player statistics
          let battingAvg = null;
          let bowlingAvg = null;
          let strikeRate = null;
          let economy = null;
          let totalRuns = 0;
          let totalWickets = 0;
          let totalMatches = 0;
          
          try {
            const playerDetails = await sportmonksService.getPlayerDetails(player.id.toString());
            
            if (playerDetails.career) {
              // Extract stats from career data
              const careerData = playerDetails.career.data;
              if (careerData && careerData.length > 0) {
                const t20Career = careerData.find((c: any) => c.type === 't20i' || c.type === 't20');
                
                if (t20Career) {
                  battingAvg = t20Career.batting.average || null;
                  strikeRate = t20Career.batting.strike_rate || null;
                  bowlingAvg = t20Career.bowling.average || null;
                  economy = t20Career.bowling.economy_rate || null;
                  totalRuns = t20Career.batting.runs_scored || 0;
                  totalWickets = t20Career.bowling.wickets || 0;
                  totalMatches = t20Career.bowling.matches || t20Career.batting.matches || 0;
                }
              }
            }
          } catch (error) {
            console.error(`Error fetching details for player ${player.fullname}:`, error);
          }
          
          const playerData = insertPlayerSchema.parse({
            name: player.fullname,
            iplTeamId: dbTeam.id,
            roleId: roleId,
            imageUrl: player.image_path,
            battingAvg,
            bowlingAvg,
            strikeRate,
            economy,
            totalRuns,
            totalWickets,
            totalMatches
          });
          
          await db.insert(players).values(playerData);
          console.log(`Added player: ${player.fullname} to team ${dbTeam.name}`);
        } else {
          console.log(`Player ${player.fullname} already exists, skipping`);
        }
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
    console.log('Fetching IPL fixtures (matches)...');
    
    const fixtures = await sportmonksService.getIplFixtures();
    const dbTeams = await db.select().from(iplTeams);
    
    // Create a map of team names to IDs for easy lookup
    const teamMap = new Map(dbTeams.map(team => [team.name.toLowerCase(), team.id]));
    
    console.log(`Found ${fixtures.length} fixtures, inserting into the database...`);
    
    for (const fixture of fixtures) {
      // Check if match already exists
      const existingMatch = await db.select()
        .from(matches)
        .where(eq(matches.date, new Date(fixture.starting_at)))
        .limit(1);
      
      if (existingMatch.length === 0) {
        // Find team IDs
        const team1Name = fixture.localTeam.data.name.toLowerCase();
        const team2Name = fixture.visitorTeam.data.name.toLowerCase();
        
        const team1Id = teamMap.get(team1Name);
        const team2Id = teamMap.get(team2Name);
        
        if (!team1Id || !team2Id) {
          console.log(`Teams not found for match: ${team1Name} vs ${team2Name}, skipping`);
          continue;
        }
        
        // Determine winner if match is completed
        let winnerId = null;
        let isCompleted = fixture.status === 'Finished';
        let team1Score = null;
        let team2Score = null;
        
        if (isCompleted && fixture.winner_team_id) {
          // Find the team in our database that corresponds to the winner
          const winnerTeamName = fixture.winner_team_id === fixture.localteam_id 
            ? team1Name 
            : team2Name;
            
          winnerId = teamMap.get(winnerTeamName) || null;
          
          // Extract scores if available
          if (fixture.runs && fixture.runs.length > 0) {
            const team1Runs = fixture.runs.filter((r: any) => r.team_id === fixture.localteam_id);
            const team2Runs = fixture.runs.filter((r: any) => r.team_id === fixture.visitorteam_id);
            
            if (team1Runs.length > 0) {
              team1Score = `${team1Runs[0].score}/${team1Runs[0].wickets}`;
            }
            
            if (team2Runs.length > 0) {
              team2Score = `${team2Runs[0].score}/${team2Runs[0].wickets}`;
            }
          }
        }
        
        const matchData = insertMatchSchema.parse({
          team1Id,
          team2Id,
          date: new Date(fixture.starting_at),
          venue: fixture.venue?.name || 'TBD',
          team1Score,
          team2Score,
          winnerId,
          isCompleted,
          matchType: 'T20'
        });
        
        await db.insert(matches).values(matchData);
        console.log(`Added match: ${fixture.localTeam.data.name} vs ${fixture.visitorTeam.data.name}`);
      } else {
        console.log(`Match on ${fixture.starting_at} already exists, skipping`);
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