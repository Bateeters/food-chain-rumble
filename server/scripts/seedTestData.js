const mongoose = require('mongoose');
const User = require('../models/User');
const Character = require('../models/Character');
const Match = require('../models/Match');
const PlayerStats = require('../models/PlayerStats');
require('dotenv').config();

const seedTestData = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected');

        const characters = await Character.find();
        if (characters.length === 0) {
            console.log('❌ No characters found. Please run seedCharacters.js first!');
            process.exit(1);
        }
        console.log(`Found ${characters.length} characters`);

        console.log('Clearing existing test data...');
        await User.deleteMany({ username: { $regex: /^testuser/i } });
        await Match.deleteMany({});
        await PlayerStats.deleteMany({});

        console.log('Creating 20 test users...');
        const testUsers = [];
        for (let i = 1; i <= 20; i++) {
            const user = await User.create({
                username: `testuser${i}`,
                email: `testuser${i}@example.com`,
                password: 'TestPass123!',
                dateOfBirth: '1995-06-15',
                isEmailVerified: true
            });
            testUsers.push(user);
        }
        console.log('✅ Created 20 test users');

        console.log('Creating character-specific player stats...');
        const gameModes = ['1v1_ranked', '2v2_ranked', '3v3_ranked'];
        
        for (const user of testUsers) {
            for (const gameMode of gameModes) {
                for (const character of characters) {
                    await PlayerStats.create({
                        user: user._id,
                        gameMode: gameMode,
                        character: character._id,
                        stats: {
                            totalMatches: 0,
                            wins: 0,
                            losses: 0,
                            totalKills: 0,
                            totalDeaths: 0,
                            totalDamageDealt: 0,
                            totalAssists: 0,
                            totalDamageTaken: 0,
                            longestWinStreak: 0,
                            currentWinStreak: 0
                        },
                        accountMMR: 1000 + Math.floor(Math.random() * 1000),
                        characterMMR: 1000,
                        peakAccountMMR: 1000,
                        peakCharacterMMR: 1000
                    });
                }
            }
        }
        console.log('✅ Created character-specific player stats');

        console.log('Generating 100 random matches...');
        const matchCount = 100;
        
        for (let i = 0; i < matchCount; i++) {
            const gameMode = gameModes[Math.floor(Math.random() * gameModes.length)];
            const teamSize = parseInt(gameMode.charAt(0));
            
            const shuffledUsers = [...testUsers].sort(() => Math.random() - 0.5);
            const team1Users = shuffledUsers.slice(0, teamSize);
            const team2Users = shuffledUsers.slice(teamSize, teamSize * 2);
            
            const winningTeam = Math.random() > 0.5 ? 1 : 2;
            
            // Build players array with correct structure
            const players = [];
            
            // Team 1 players
            for (const user of team1Users) {
                const character = characters[Math.floor(Math.random() * characters.length)];
                players.push({
                    user: user._id,
                    character: character._id,
                    team: 1,
                    talents: {
                        greater: null,
                        lesser: []
                    },
                    stats: {
                        kills: Math.floor(Math.random() * 15),
                        deaths: Math.floor(Math.random() * 10),
                        assists: Math.floor(Math.random() * 10),
                        damageDealt: Math.floor(Math.random() * 50000),
                        damageTaken: Math.floor(Math.random() * 40000),
                        abilitiesUsed: Math.floor(Math.random() * 30),
                        highestPercentage: Math.floor(Math.random() * 200)
                    },
                    result: winningTeam === 1 ? 'win' : 'loss'
                });
            }
            
            // Team 2 players
            for (const user of team2Users) {
                const character = characters[Math.floor(Math.random() * characters.length)];
                players.push({
                    user: user._id,
                    character: character._id,
                    team: 2,
                    talents: {
                        greater: null,
                        lesser: []
                    },
                    stats: {
                        kills: Math.floor(Math.random() * 15),
                        deaths: Math.floor(Math.random() * 10),
                        assists: Math.floor(Math.random() * 10),
                        damageDealt: Math.floor(Math.random() * 50000),
                        damageTaken: Math.floor(Math.random() * 40000),
                        abilitiesUsed: Math.floor(Math.random() * 30),
                        highestPercentage: Math.floor(Math.random() * 200)
                    },
                    result: winningTeam === 2 ? 'win' : 'loss'
                });
            }
            
            const matchEndTime = new Date(Date.now() - Math.floor(Math.random() * 7 * 24 * 60 * 60 * 1000));
            const matchDuration = 600 + Math.floor(Math.random() * 1200); // 10-30 minutes
            const matchStartTime = new Date(matchEndTime.getTime() - matchDuration * 1000);
            
            // Create match
            const match = await Match.create({
                gameMode: gameMode,
                players: players,
                winningTeam: winningTeam,
                duration: matchDuration,
                arena: 'Test Arena',
                startedAt: matchStartTime,
                endedAt: matchEndTime,
                serverRegion: 'NA'
            });

            // Update PlayerStats for all players
            for (const playerData of match.players) {
                const isWinner = playerData.result === 'win';
                
                const stats = await PlayerStats.findOne({
                    user: playerData.user,
                    gameMode: gameMode,
                    character: playerData.character
                });

                if (stats) {
                    // Update nested stats
                    stats.stats.totalMatches += 1;
                    stats.stats.wins += isWinner ? 1 : 0;
                    stats.stats.losses += isWinner ? 0 : 1;
                    stats.stats.totalKills += playerData.stats.kills;
                    stats.stats.totalDeaths += playerData.stats.deaths;
                    stats.stats.totalAssists += playerData.stats.assists;
                    stats.stats.totalDamageDealt += playerData.stats.damageDealt;
                    stats.stats.totalDamageTaken += playerData.stats.damageTaken;
                
                    // Update win streak
                    if (isWinner) {
                        stats.stats.currentWinStreak += 1;
                        if (stats.stats.currentWinStreak > stats.stats.longestWinStreak) {
                            stats.stats.longestWinStreak = stats.stats.currentWinStreak;
                        }
                    } else {
                        stats.stats.currentWinStreak = 0;
                    }
                    
                    // Update MMR (simple calculation)
                    const mmrChange = isWinner ? 25 : -20;
                    stats.accountMMR = Math.max(0, stats.accountMMR + mmrChange);
                    
                    // Update peak MMR
                    if (stats.accountMMR > stats.peakAccountMMR) {
                        stats.peakAccountMMR = stats.accountMMR;
                    }
                    
                    stats.lastPlayed = new Date();
                    
                    await stats.save();
                }
            }
        }
        
        console.log('✅ Generated 100 matches and updated stats');

        // Show overall leaderboard (highest account MMR across all characters)
        const topPlayersByHighestMMR = await PlayerStats.aggregate([
        { $match: { gameMode: '1v1_ranked' } },
        {
            $group: {
            _id: '$user',
            highestMMR: { $max: '$accountMMR' },
            totalGames: { $sum: '$stats.totalMatches' },
            totalWins: { $sum: '$stats.wins' },
            totalLosses: { $sum: '$stats.losses' }
            }
        },
        { $sort: { highestMMR: -1 } },
        { $limit: 5 },
        {
            $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
            }
        },
        { $unwind: '$user' }
        ]);

        console.log('\n📊 Top 5 Players (1v1 Ranked - Highest Account MMR):');
        topPlayersByHighestMMR.forEach((player, index) => {
        console.log(`${index + 1}. ${player.user.username} - ${Math.round(player.highestMMR)} MMR (${player.totalWins}W-${player.totalLosses}L across ${player.totalGames} games)`);
        });

        console.log('\n✅ Test data seeded successfully!');
        
        await mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error('Error seeding test data:', error);
        process.exit(1);
    }
};

seedTestData();