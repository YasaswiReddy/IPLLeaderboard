import { readFileSync } from 'fs';
import { db } from '../db';
import {
  users, iplTeams, players, playerRoles, fantasyTeams, fantasyTeamPlayers, leagues, pointsSystem,
  insertUserSchema, insertFantasyTeamSchema, insertFantasyTeamPlayerSchema, insertPlayerSchema, 
  insertLeagueSchema, insertPointsSystemSchema
} from '@shared/schema';
import { eq, and } from 'drizzle-orm';

interface LeagueDataRow {
  Group: string;
  Team: string;
  Player: string;
  CVCTag: string;
}

async function parseLeagueData(filePath: string): Promise<LeagueDataRow[]> {
  try {
    const fileContent = readFileSync(filePath, 'utf-8');
    const lines = fileContent.split('\n');
    
    // Parse header and data rows
    const headerRow = lines[0].split('\t');
    const dataRows: LeagueDataRow[] = [];
    
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;
      
      const values = line.split('\t');
      const row: any = {};
      
      for (let j = 0; j < headerRow.length; j++) {
        row[headerRow[j]] = values[j] || '';
      }
      
      dataRows.push(row as LeagueDataRow);
    }
    
    return dataRows;
  } catch (error) {
    console.error('Error parsing league data:', error);
    return [];
  }
}

async function importLeagueData() {
  try {
    console.log('Starting league data import...');
    
    // Parse the league data
    const leagueData = await parseLeagueData('./attached_assets/Pasted-Group-Team-Player-CVCTag-sYAG-Ruthless-Mekanism-Varun-Chakaravarthy-sYAG-Ruthless-Mekanism-Shivam-D-1744892156690.txt');
    
    if (leagueData.length === 0) {
      console.log('No league data found or failed to parse file.');
      return;
    }
    
    console.log(`Found ${leagueData.length} player entries across leagues.`);
    
    // Get unique leagues (Groups)
    const leagues = [...new Set(leagueData.map(row => row.Group))];
    console.log(`Found ${leagues.length} leagues: ${leagues.join(', ')}`);
    
    // Get unique teams
    const teams = [...new Set(leagueData.map(row => `${row.Group}|${row.Team}`))];
    console.log(`Found ${teams.length} fantasy teams across all leagues.`);
    
    // Get unique players
    const playerNames = [...new Set(leagueData.map(row => row.Player))];
    console.log(`Found ${playerNames.length} unique players.`);
    
    // Step 1: Ensure we have the necessary player role
    let batsmanRoleId = 1; // Default to first role if exists
    const battersRole = await db.select().from(playerRoles).where(eq(playerRoles.name, 'Batsman')).limit(1);
    if (battersRole.length > 0) {
      batsmanRoleId = battersRole[0].id;
    }
    
    // Step 2: Create or find a default IPL team for players not in the database
    let defaultTeamId = 1; // Default to first team if exists
    const defaultTeam = await db.select().from(iplTeams).limit(1);
    if (defaultTeam.length > 0) {
      defaultTeamId = defaultTeam[0].id;
    }
    
    // Step 3: Create a database user for each league
    for (const league of leagues) {
      // Check if league user exists
      let leagueUser = await db.select().from(users).where(eq(users.teamName, league)).limit(1);
      
      if (leagueUser.length === 0) {
        // Create a new user for this league
        const newUser = {
          username: `league_${league.toLowerCase().replace(/\\s+/g, '_')}`,
          password: 'password123', // This would be properly secured in production
          name: `${league} League`,
          email: `${league.toLowerCase().replace(/\\s+/g, '_')}@example.com`,
          teamName: league
        };
        
        const [insertedUser] = await db.insert(users).values(insertUserSchema.parse(newUser)).returning();
        console.log(`Created user for league: ${league} with ID: ${insertedUser.id}`);
        leagueUser = [insertedUser];
      } else {
        console.log(`User for league: ${league} already exists with ID: ${leagueUser[0].id}`);
      }
      
      // Step 4: Process each team in this league
      const leagueTeams = teams.filter(t => t.startsWith(`${league}|`))
                               .map(t => t.split('|')[1]);
      
      for (const teamName of leagueTeams) {
        // Check if fantasy team exists
        let fantasyTeam = await db.select()
                                 .from(fantasyTeams)
                                 .where(and(
                                   eq(fantasyTeams.userId, leagueUser[0].id),
                                   eq(fantasyTeams.name, teamName)
                                 ))
                                 .limit(1);
        
        if (fantasyTeam.length === 0) {
          // Create fantasy team
          const newFantasyTeam = {
            userId: leagueUser[0].id,
            name: teamName,
            totalPoints: 0,
            weeklyPoints: 0
          };
          
          const [insertedTeam] = await db.insert(fantasyTeams)
                                         .values(insertFantasyTeamSchema.parse(newFantasyTeam))
                                         .returning();
          
          console.log(`Created fantasy team: ${teamName} with ID: ${insertedTeam.id}`);
          fantasyTeam = [insertedTeam];
        } else {
          console.log(`Fantasy team: ${teamName} already exists with ID: ${fantasyTeam[0].id}`);
        }
        
        // Step 5: Process players for this team
        const teamPlayers = leagueData.filter(row => row.Group === league && row.Team === teamName);
        
        for (const playerData of teamPlayers) {
          // Check if player exists in our database
          let player = await db.select()
                              .from(players)
                              .where(eq(players.name, playerData.Player))
                              .limit(1);
          
          if (player.length === 0) {
            // Create new player with basic info
            const newPlayer = {
              name: playerData.Player,
              iplTeamId: defaultTeamId,
              roleId: batsmanRoleId,
              imageUrl: null,
              battingAvg: null,
              bowlingAvg: null,
              strikeRate: null,
              economy: null,
              totalRuns: 0,
              totalWickets: 0,
              totalMatches: 0
            };
            
            const [insertedPlayer] = await db.insert(players)
                                            .values(insertPlayerSchema.parse(newPlayer))
                                            .returning();
            
            console.log(`Created player: ${playerData.Player} with ID: ${insertedPlayer.id}`);
            player = [insertedPlayer];
          }
          
          // Check if player is already in this fantasy team
          const existingTeamPlayer = await db.select()
                                            .from(fantasyTeamPlayers)
                                            .where(and(
                                              eq(fantasyTeamPlayers.fantasyTeamId, fantasyTeam[0].id),
                                              eq(fantasyTeamPlayers.playerId, player[0].id)
                                            ))
                                            .limit(1);
          
          if (existingTeamPlayer.length === 0) {
            // Add player to fantasy team
            const isCaptain = playerData.CVCTag === 'C';
            const isViceCaptain = playerData.CVCTag === 'VC';
            
            const fantasyTeamPlayer = {
              fantasyTeamId: fantasyTeam[0].id,
              playerId: player[0].id,
              isCaptain,
              isViceCaptain
            };
            
            await db.insert(fantasyTeamPlayers)
                   .values(insertFantasyTeamPlayerSchema.parse(fantasyTeamPlayer));
            
            console.log(`Added ${playerData.Player} to team ${teamName} ${isCaptain ? 'as Captain' : isViceCaptain ? 'as Vice Captain' : ''}`);
          } else {
            console.log(`Player ${playerData.Player} already in team ${teamName}`);
          }
        }
      }
    }
    
    console.log('League data import completed successfully!');
  } catch (error) {
    console.error('Error during league data import:', error);
  }
}

// Execute the import function
importLeagueData().then(() => {
  console.log('Import script completed');
  process.exit(0);
}).catch((error) => {
  console.error('Import script failed:', error);
  process.exit(1);
});