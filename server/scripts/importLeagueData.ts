import { readFileSync } from 'fs';
import { db } from '../db';
import { sql } from 'drizzle-orm';

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
    
    // Get unique league names
    const leagueSet = new Set<string>();
    leagueData.forEach(row => leagueSet.add(row.Group));
    const leagueNames = Array.from(leagueSet);
    console.log(`Found ${leagueNames.length} leagues: ${leagueNames.join(', ')}`);
    
    // Get unique teams with their leagues
    const teamSet = new Set<string>();
    leagueData.forEach(row => teamSet.add(`${row.Group}|${row.Team}`));
    const teamMapping = Array.from(teamSet).map(t => {
      const [leagueName, teamName] = t.split('|');
      return { leagueName, teamName };
    });
    console.log(`Found ${teamMapping.length} fantasy teams across all leagues.`);
    
    // Get unique player names
    const playerSet = new Set<string>();
    leagueData.forEach(row => playerSet.add(row.Player));
    const playerNames = Array.from(playerSet);
    console.log(`Found ${playerNames.length} unique players.`);
    
    // Step 1: Get or create a default player role
    let batsmanRoleId: number = 1; // Default
    try {
      const roleResult = await db.execute(sql`
        SELECT id FROM player_roles WHERE name = 'Batsman' LIMIT 1;
      `);
      
      if (roleResult.rowCount && roleResult.rowCount > 0) {
        batsmanRoleId = roleResult.rows[0].id;
      } else {
        // Create a default role if not found
        const newRoleResult = await db.execute(sql`
          INSERT INTO player_roles (name, description)
          VALUES ('Batsman', 'Cricket batsman')
          RETURNING id;
        `);
        batsmanRoleId = newRoleResult.rows[0].id;
      }
    } catch (error) {
      console.error('Error getting/creating player role:', error);
    }
    
    // Step 2: Get default IPL team ID
    let defaultTeamId: number = 1; // Default
    try {
      const teamResult = await db.execute(sql`
        SELECT id FROM ipl_teams LIMIT 1;
      `);
      
      if (teamResult.rowCount && teamResult.rowCount > 0) {
        defaultTeamId = teamResult.rows[0].id;
      }
    } catch (error) {
      console.error('Error getting default team ID:', error);
    }
    
    // Step 3: Process each league
    for (const leagueName of leagueNames) {
      try {
        // Check if league exists
        let leagueId: number;
        const leagueResult = await db.execute(sql`
          SELECT id FROM leagues WHERE name = ${leagueName} LIMIT 1;
        `);
        
        if (leagueResult.rowCount === 0) {
          // Create new league
          const newLeagueResult = await db.execute(sql`
            INSERT INTO leagues (name, description, is_active)
            VALUES (${leagueName}, ${`${leagueName} Fantasy Cricket League`}, TRUE)
            RETURNING id;
          `);
          leagueId = newLeagueResult.rows[0].id;
          console.log(`Created league: ${leagueName} with ID: ${leagueId}`);
          
          // Create default points system for this league
          await db.execute(sql`
            INSERT INTO points_system (league_id, name, description, rules_config)
            VALUES (
              ${leagueId}, 
              ${`${leagueName} Standard Points`}, 
              ${'Standard Fantasy Cricket Points System'}, 
              ${JSON.stringify({
                run: 1,
                four: 1,
                six: 2,
                wicket: 25,
                catch: 8,
                stumping: 12,
                runOut: 6,
                maidenOver: 8, 
                duck: -2,
                thirtyRuns: 4,
                fiftyRuns: 8,
                hundredRuns: 16,
                threeWickets: 4,
                fourWickets: 8,
                fiveWickets: 16,
                captainMultiplier: 2,
                viceCaptainMultiplier: 1.5
              })}
            );
          `);
          console.log(`Created points system for league: ${leagueName}`);
        } else {
          leagueId = leagueResult.rows[0].id;
          console.log(`League ${leagueName} already exists with ID: ${leagueId}`);
        }
        
        // Step 4: Get or create league user
        let userId: number;
        const userResult = await db.execute(sql`
          SELECT id FROM users WHERE team_name = ${leagueName} LIMIT 1;
        `);
        
        if (userResult.rowCount === 0) {
          // Create a user for this league
          const newUserResult = await db.execute(sql`
            INSERT INTO users (username, password, name, email, team_name)
            VALUES (
              ${`league_${leagueName.toLowerCase().replace(/\s+/g, '_')}`},
              ${'password123'}, 
              ${`${leagueName} League`},
              ${`${leagueName.toLowerCase().replace(/\s+/g, '_')}@example.com`},
              ${leagueName}
            )
            RETURNING id;
          `);
          userId = newUserResult.rows[0].id;
          console.log(`Created user for league: ${leagueName} with ID: ${userId}`);
        } else {
          userId = userResult.rows[0].id;
          console.log(`User for league: ${leagueName} already exists with ID: ${userId}`);
        }
        
        // Step 5: Process teams in this league
        const leagueTeams = teamMapping.filter(t => t.leagueName === leagueName);
        for (const { teamName } of leagueTeams) {
          try {
            // Check if team exists
            let teamId: number;
            const teamResult = await db.execute(sql`
              SELECT id FROM fantasy_teams
              WHERE user_id = ${userId} AND name = ${teamName}
              LIMIT 1;
            `);
            
            if (teamResult.rowCount === 0) {
              // Create new fantasy team
              const newTeamResult = await db.execute(sql`
                INSERT INTO fantasy_teams (user_id, league_id, name, total_points, weekly_points)
                VALUES (${userId}, ${leagueId}, ${teamName}, 0, 0)
                RETURNING id;
              `);
              teamId = newTeamResult.rows[0].id;
              console.log(`Created fantasy team: ${teamName} with ID: ${teamId}`);
            } else {
              teamId = teamResult.rows[0].id;
              
              // Update team with league ID if missing
              await db.execute(sql`
                UPDATE fantasy_teams 
                SET league_id = ${leagueId}
                WHERE id = ${teamId} AND (league_id IS NULL OR league_id = 0);
              `);
              console.log(`Fantasy team: ${teamName} already exists with ID: ${teamId}`);
            }
            
            // Step 6: Process players for this team
            const teamPlayers = leagueData.filter(row => 
              row.Group === leagueName && row.Team === teamName
            );
            
            for (const playerData of teamPlayers) {
              try {
                // Check if player exists
                let playerId: number;
                const playerResult = await db.execute(sql`
                  SELECT id FROM players WHERE name = ${playerData.Player} LIMIT 1;
                `);
                
                if (playerResult.rowCount === 0) {
                  // Create new player
                  const newPlayerResult = await db.execute(sql`
                    INSERT INTO players (
                      name, ipl_team_id, role_id, total_runs, total_wickets, total_matches
                    )
                    VALUES (
                      ${playerData.Player}, 
                      ${defaultTeamId}, 
                      ${batsmanRoleId},
                      0, 0, 0
                    )
                    RETURNING id;
                  `);
                  playerId = newPlayerResult.rows[0].id;
                  console.log(`Created player: ${playerData.Player} with ID: ${playerId}`);
                } else {
                  playerId = playerResult.rows[0].id;
                }
                
                // Check if player is already in this fantasy team
                const teamPlayerResult = await db.execute(sql`
                  SELECT id FROM fantasy_team_players
                  WHERE fantasy_team_id = ${teamId} AND player_id = ${playerId}
                  LIMIT 1;
                `);
                
                if (teamPlayerResult.rowCount === 0) {
                  // Add player to fantasy team
                  const isCaptain = playerData.CVCTag === 'C';
                  const isViceCaptain = playerData.CVCTag === 'VC';
                  
                  await db.execute(sql`
                    INSERT INTO fantasy_team_players (fantasy_team_id, player_id, is_captain, is_vice_captain)
                    VALUES (${teamId}, ${playerId}, ${isCaptain}, ${isViceCaptain});
                  `);
                  console.log(`Added ${playerData.Player} to team ${teamName} ${isCaptain ? 'as Captain' : isViceCaptain ? 'as Vice Captain' : ''}`);
                } else {
                  console.log(`Player ${playerData.Player} already in team ${teamName}`);
                }
              } catch (error) {
                console.error(`Error processing player ${playerData.Player}:`, error);
              }
            }
          } catch (error) {
            console.error(`Error processing team ${teamName}:`, error);
          }
        }
      } catch (error) {
        console.error(`Error processing league ${leagueName}:`, error);
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