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
                    const baseMMR = 1000 + Math.floor(Math.random() * 1000);
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
                        accountMMR: baseMMR,
                        characterMMR: baseMMR + Math.floor(Math.random() * 200) - 100,
                        peakAccountMMR: baseMMR,
                        peakCharacterMMR: baseMMR
                    });
                }
            }
        }
        console.log('✅ Created character-specific player stats');

        console.log('Generating matches (ensuring all users participate)...');
        const arenas = ['Savanna Plateau', 'Arctic Tundra', 'Coral Reef', 'Volcanic Rift', 'Forest Canopy', 'Desert Oasis'];

        // First, create 10 matches for EACH user to guarantee participation
        console.log('Creating guaranteed matches for each user...');
        for (const user of testUsers) {
            for (let i = 0; i < 10; i++) {
                const gameMode = gameModes[Math.floor(Math.random() * gameModes.length)];
                const teamSize = parseInt(gameMode.charAt(0));
                const arena = arenas[Math.floor(Math.random() * arenas.length)];
                
                // This user is always on team 1
                const myTeam = 1;
                const winningTeam = Math.random() > 0.5 ? 1 : 2;
                
                const players = [];
                
                // Add this user to team 1
                const myCharacter = characters[Math.floor(Math.random() * characters.length)];
                players.push({
                    user: user._id,
                    character: myCharacter._id,
                    team: myTeam,
                    talents: { greater: null, lesser: [] },
                    stats: {
                        kills: Math.floor(Math.random() * 20) + 1,
                        deaths: Math.floor(Math.random() * 15) + 1,
                        assists: Math.floor(Math.random() * 18) + 1,
                        damageDealt: Math.floor(Math.random() * 50000) + 20000,
                        damageTaken: Math.floor(Math.random() * 40000) + 15000,
                        abilitiesUsed: Math.floor(Math.random() * 35) + 5,
                        highestPercentage: Math.floor(Math.random() * 150) + 50
                    },
                    result: winningTeam === myTeam ? 'win' : 'loss'
                });
                
                // Add teammates for team 1 (if 2v2 or 3v3)
                for (let t = 1; t < teamSize; t++) {
                    const teammate = testUsers[Math.floor(Math.random() * testUsers.length)];
                    const teammateChar = characters[Math.floor(Math.random() * characters.length)];
                    players.push({
                        user: teammate._id,
                        character: teammateChar._id,
                        team: myTeam,
                        talents: { greater: null, lesser: [] },
                        stats: {
                            kills: Math.floor(Math.random() * 20) + 1,
                            deaths: Math.floor(Math.random() * 15) + 1,
                            assists: Math.floor(Math.random() * 18) + 1,
                            damageDealt: Math.floor(Math.random() * 50000) + 20000,
                            damageTaken: Math.floor(Math.random() * 40000) + 15000,
                            abilitiesUsed: Math.floor(Math.random() * 35) + 5,
                            highestPercentage: Math.floor(Math.random() * 150) + 50
                        },
                        result: winningTeam === myTeam ? 'win' : 'loss'
                    });
                }
                
                // Add opponents for team 2
                for (let t = 0; t < teamSize; t++) {
                    const opponent = testUsers[Math.floor(Math.random() * testUsers.length)];
                    const opponentChar = characters[Math.floor(Math.random() * characters.length)];
                    players.push({
                        user: opponent._id,
                        character: opponentChar._id,
                        team: 2,
                        talents: { greater: null, lesser: [] },
                        stats: {
                            kills: Math.floor(Math.random() * 20) + 1,
                            deaths: Math.floor(Math.random() * 15) + 1,
                            assists: Math.floor(Math.random() * 18) + 1,
                            damageDealt: Math.floor(Math.random() * 50000) + 20000,
                            damageTaken: Math.floor(Math.random() * 40000) + 15000,
                            abilitiesUsed: Math.floor(Math.random() * 35) + 5,
                            highestPercentage: Math.floor(Math.random() * 150) + 50
                        },
                        result: winningTeam === 2 ? 'win' : 'loss'
                    });
                }
                
                const matchEndTime = new Date(Date.now() - Math.floor(Math.random() * 30 * 24 * 60 * 60 * 1000));
                const matchDuration = 600 + Math.floor(Math.random() * 1800);
                const matchStartTime = new Date(matchEndTime.getTime() - matchDuration * 1000);
                
                const match = await Match.create({
                    gameMode,
                    players,
                    winningTeam,
                    duration: matchDuration,
                    arena,
                    startedAt: matchStartTime,
                    endedAt: matchEndTime,
                    serverRegion: 'NA'
                });

                // Update stats for all players
                for (const playerData of match.players) {
                    const isWinner = playerData.result === 'win';
                    
                    const stats = await PlayerStats.findOne({
                        user: playerData.user,
                        gameMode: gameMode,
                        character: playerData.character
                    });

                    if (stats) {
                        stats.stats.totalMatches += 1;
                        stats.stats.wins += isWinner ? 1 : 0;
                        stats.stats.losses += isWinner ? 0 : 1;
                        stats.stats.totalKills += playerData.stats.kills;
                        stats.stats.totalDeaths += playerData.stats.deaths;
                        stats.stats.totalAssists += playerData.stats.assists;
                        stats.stats.totalDamageDealt += playerData.stats.damageDealt;
                        stats.stats.totalDamageTaken += playerData.stats.damageTaken;
                        
                        if (isWinner) {
                            stats.stats.currentWinStreak += 1;
                            if (stats.stats.currentWinStreak > stats.stats.longestWinStreak) {
                                stats.stats.longestWinStreak = stats.stats.currentWinStreak;
                            }
                        } else {
                            stats.stats.currentWinStreak = 0;
                        }
                        
                        const mmrChange = isWinner ? 25 : -20;
                        stats.accountMMR = Math.max(0, stats.accountMMR + mmrChange);
                        stats.characterMMR = Math.max(0, stats.characterMMR + mmrChange);
                        
                        if (stats.accountMMR > stats.peakAccountMMR) {
                            stats.peakAccountMMR = stats.accountMMR;
                        }
                        if (stats.characterMMR > stats.peakCharacterMMR) {
                            stats.peakCharacterMMR = stats.characterMMR;
                        }
                        
                        stats.lastPlayed = matchEndTime;
                        await stats.save();
                    }
                }
            }
        }

        const totalMatches = await Match.countDocuments();
        console.log(`✅ Created ${totalMatches} total matches (10 per user minimum)`);

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

        console.log('\n🏆 Top 5 Players (1v1 Ranked - Highest Account MMR):');
        topPlayersByHighestMMR.forEach((player, index) => {
            console.log(`${index + 1}. ${player.user.username} - ${Math.round(player.highestMMR)} MMR (${player.totalWins}W-${player.totalLosses}L across ${player.totalGames} games)`);
        });

        console.log('\n✅ Test data seeded successfully!');
        console.log('\n💡 You can now log in as any testuser (testuser1-20) with password: TestPass123!');
        console.log('   Each user will have their own match history on the dashboard!');
        
        await mongoose.disconnect();
        process.exit(0);

    } catch (error) {
        console.error('Error seeding test data:', error);
        process.exit(1);
    }
};

seedTestData();