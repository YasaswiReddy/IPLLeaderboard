import { db } from '../db';
import { leagues, pointsSystem } from '@shared/schema';
import { sql } from 'drizzle-orm';

async function updateSchema() {
  try {
    console.log('Starting database schema update...');
    
    // Add leagues table
    console.log('Creating leagues table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS leagues (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        description TEXT,
        start_date TIMESTAMP,
        end_date TIMESTAMP,
        is_active BOOLEAN DEFAULT TRUE,
        max_teams INTEGER DEFAULT 10,
        max_players_per_team INTEGER DEFAULT 15
      );
    `);
    
    // Add points_system table
    console.log('Creating points_system table...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS points_system (
        id SERIAL PRIMARY KEY,
        league_id INTEGER NOT NULL REFERENCES leagues(id),
        name TEXT NOT NULL,
        description TEXT,
        rules_config JSONB NOT NULL
      );
    `);
    
    // Add league_id column to fantasy_teams table if it doesn't exist
    console.log('Adding league_id to fantasy_teams table...');
    try {
      await db.execute(sql`
        ALTER TABLE fantasy_teams 
        ADD COLUMN IF NOT EXISTS league_id INTEGER REFERENCES leagues(id);
      `);
      console.log('Successfully added league_id column');
    } catch (error) {
      console.error('Error adding league_id column:', error);
    }
    
    // Create the default leagues based on the data we have
    const leagueNames = ['sYAG', 'B Phase Dogs', 'Rapid Yorkers'];
    
    for (const leagueName of leagueNames) {
      try {
        const existingLeague = await db.execute(sql`
          SELECT id FROM leagues WHERE name = ${leagueName};
        `);
        
        if (existingLeague.rowCount === 0) {
          await db.execute(sql`
            INSERT INTO leagues (name, description, is_active)
            VALUES (${leagueName}, ${`${leagueName} Fantasy Cricket League`}, TRUE);
          `);
          console.log(`Created league: ${leagueName}`);
          
          // Fetch the ID of the newly created league
          const leagueResult = await db.execute(sql`
            SELECT id FROM leagues WHERE name = ${leagueName};
          `);
          
          if (leagueResult.rowCount > 0) {
            const leagueId = leagueResult.rows[0].id;
            
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
            
            // Update existing fantasy teams to associate with this league
            const userResult = await db.execute(sql`
              SELECT id FROM users WHERE team_name = ${leagueName};
            `);
            
            if (userResult.rowCount > 0) {
              const userId = userResult.rows[0].id;
              
              await db.execute(sql`
                UPDATE fantasy_teams 
                SET league_id = ${leagueId}
                WHERE user_id = ${userId};
              `);
              console.log(`Updated fantasy teams for league: ${leagueName}`);
            }
          }
        } else {
          console.log(`League ${leagueName} already exists`);
        }
      } catch (error) {
        console.error(`Error creating league ${leagueName}:`, error);
      }
    }
    
    console.log('Database schema update completed!');
  } catch (error) {
    console.error('Error updating schema:', error);
  }
}

// Execute the update
updateSchema().then(() => {
  console.log('Schema update completed');
  process.exit(0);
}).catch((error) => {
  console.error('Schema update failed:', error);
  process.exit(1);
});