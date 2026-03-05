const PlayerStats = require('../models/PlayerStats');
const Character = require('../models/Character');
const TalentStats = require('../models/TalentStats');
const BuildStats = require('../models/BuildStats');
const mongoose = require('mongoose');

// @route   GET /api/leaderboard/gameMode
// @desc    Get player leaderboard for a specific game mode
// @access  Public
const getLeaderboard = async (req, res) => {
    try {
        const { gameMode } = req.params;
        const { page = 1, limit = 100 } = req.query;
        
        // Validate game mode
        const validModes = ['1v1_ranked', '2v2_ranked', '3v3_ranked'];
        if (!validModes.includes(gameMode)) {
            return res.status(400).json({
                error: 'Invalid game mode',
                validModes
            });
        }

        // Get top players by ACCOUNT MMR
        const leaderboard = await PlayerStats.aggregate([
            { $match: { gameMode } },
            {
                $group: {
                    _id: '$user',
                    // Account MMR (same across all characters for this user)
                    accountMMR: { $max: '$accountMMR' },
                    peakAccountMMR: { $max: '$peakAccountMMR' },
                    rank: { $first: '$rank' },
                    // Sum stats across all characters
                    totalMatches: { $sum: '$stats.totalMatches' },
                    totalWins: { $sum: '$stats.wins' },
                    totalLosses: { $sum: '$stats.losses' },
                    totalKills: { $sum: '$stats.totalKills' },
                    totalDeaths: { $sum: '$stats.totalDeaths' },
                    totalAssists: { $sum: '$stats.totalAssists' },
                    // Collect top characters (by Character MMR)
                    topCharacters: {
                        $push: {
                            character: '$character',
                            matches: '$stats.totalMatches',
                            wins: '$stats.wins',
                            characterMMR: '$characterMMR',
                            characterRank: {
                                tier: {
                                    $switch: {
                                        branches: [
                                            { case: { $gte: ['$characterMMR', 2300] }, then: 'Grandmaster' },
                                            { case: { $gte: ['$characterMMR', 2300] }, then: 'Master' },
                                            { case: { $gte: ['$characterMMR', 2300] }, then: 'Diamond' },
                                            { case: { $gte: ['$characterMMR', 2300] }, then: 'Platinum' },
                                            { case: { $gte: ['$characterMMR', 2300] }, then: 'Gold' },
                                            { case: { $gte: ['$characterMMR', 2300] }, then: 'Silver' },
                                        ],
                                        default: 'Bronze'
                                    }
                                }
                            }
                        }
                    }
                }
            },
            {
                $addFields: {
                    winRate: {
                        $cond: [
                            { $gt: ['$totalMatches', 0] },
                            { $multiply: [{ $divide: ['$totalWins', '$totalMatches'] }, 100] },
                            0
                        ]
                    },
                    kdRatio: {
                        $cond: [
                            { $gt: ['$totalDeaths', 0] },
                            { $divide: ['$totalKills', '$totalDeaths'] },
                            '$totalKills'
                        ]
                    },
                    assistPerMatch: {
                        $cond: [
                            { $gt: ['$totalMatches', 0] },
                            { $divide: ['$totalAssists', '$totalMatches'] },
                            '$totalAssists'
                        ]
                    }
                }
            },
            
            // SORT BY ACCOUNT MMR (what matters for overall rank)
            { $sort: { accountMMR: -1 } },
            { $skip: (page -1) * limit },
            { $limit: parseInt(limit) }
        ]);

        // Populate user and character details
        await PlayerStats.populate(leaderboard, [
            { path: '_id', select: 'username avatar' },
            { path: 'topCharacters.character', select: 'name image' }
        ]);

        // Sort and limit top characters for each user
        leaderboard.forEach(entry => {
            entry.user = entry._id;
            delete entry._id;

            entry.topCharacters.sort((a, b) => b.characterMMR - a.characterMMR);
            entry.topCharacters = entry.topCharacters.slice(0, 3);
        });

        // Get total count for pagination
        const totalCount = await PlayerStats.aggregate([
            { $match: { gameMode } },
            { $group: { _id: '$user' } },
            { $count: 'total' }
        ]);

        const total = totalCount[0]?.total || 0;

        res.json({
            gameMode,
            leaderboard: leaderboard.map((entry, index) => ({
                rank: (page - 1) * limit + index + 1,
                user: entry.user,
                accountMMR: entry.accountMMR,
                peakAccountMMR: entry.peakAccountMMR,
                visibleRank: entry.rank, // Visible rank (Gold 2, etc...)
                stats: {
                    totalMatches: entry.totalMatches,
                    wins: entry.totalWins,
                    losses: entry.totalLosses,
                    winRate: Number(entry.winRate.toFixed(2)),
                    kdRatio: Number(entry.kdRatio.toFixed(2)),
                    assistPerMatch: Number(entry.assistPerMatch.toFixed(2)),
                    currentWinStreak: entry.currentWinStreak,
                    longesetWinStreak: entry.longesetWinStreak
                },
                topCharacters: entry.topCharacters
            })),
            pagination: {
                page: Number(page),
                limit: Number(limit),
                total,
                pages: Math.ceil(total / limit)
            }
        });

    } catch (error) {
        console.error('Get game mode leaderboard error');
        res.status(500).json({
            error: 'Error fetching game mode leaderboard',
            details: error.message
        });
    }
};

// @route   GET /api/leaderboard/:gameMode/rank/:userId
// @desc    Get a specific player's rank in a game mode
// @access  Public
const getPlayerRank = async (req, res) => {
    try {
        const { gameMode, userId } = req.params;

        // Validate game mode
        const validModes = ['1v1_ranked', '2v2_ranked', '3v3_ranked'];
        if (!validModes.includes(gameMode)) {
            return res.status(400).json({
                error: 'Invalid game mode',
                validModes
            });
        }

        // Get player's highest MMR for this mode
        const playerStats = await PlayerStats.aggregate([
            { $match: {user: mongoose.Types.ObjectId(userId), gameMode } },
            {
                $group: {
                    _id: '$user',
                    highestMMR: { $max: '$mmr' },
                    peakMMR: { $max: '$peakMmr' },
                    bestRank: { $first: '$rank' },
                    totalMatches: { $sum: '$stats.totalMatches' },
                    totalWins: { $sum: '$stats.wins' },
                    totalLosses: { $sum: '$stats.losses' },
                    totalKills: { $sum: '$stats.totalKills' },
                    totalDeaths: { $sum: '$stats.totalDeaths' },
                    totalAssists: { $sum: '$stats.totalAssists' },
                    topCharacters: {
                        $push: {
                            character: '$character',
                            matches: '$stats.totalMatches',
                            wins: '$stats.wins',
                            mmr: '$mmr',
                            rank: '$rank'
                        }
                    }
                }
            }
        ]);

        if (!playerStats.length) {
            return res.status(404).json({
                error: 'Player has no stats in this game mode'
            });
        }

        const stats = playerStats[0];

        // Calculate player's rank (count how many players have higher MMR)
        const rankData = await PlayerStats.aggregate([
            { $match: { gameMode } },
            { 
                $group: {
                    _id: '$user',
                    highestMMR: { $max: '$mmr' }
                }
            },
            {
                $match: {
                    highestMMR: { $gt: stats.highestMMR }
                }
            },
            { $count: 'playersAbove' }
        ]);

        const rank = (rankData[0]?.playersAbove || 0) + 1;

        // Get total players count
        const totalPlayersData = await PlayerStats.aggregate([
            { $match: { gameMode } },
            { $group: { _id: '$user' } },
            { $count: 'total' }
        ]);

        const totalPlayers = totalPlayersData[0]?.total || 0;

        // Populate user and character details
        await PlayerStats.populate(stats, [
            { path: '_id', select: 'username avatar' },
            { path: 'topCharacters.character', select: 'name image' }
        ]);

        // Sort characters by MMR
        stats.topCharacters.sort((a, b) => b.mmr - a.mmr);
        stats.topCharacters = stats.topCharacters.slice(0, 3);

        res.json({
            gameMode,
            user: stats._id,
            rank,
            totalPlayers,
            percentile: totalPlayers > 0 ? ((1 - (rank - 1) / totalPlayers) * 100).toFixed(2) : 0,
            mmr: stats.highestMMR,
            peakMMR: stats.peakMMR,
            visibleRank: stats.bestRank,
            stats: {
                totalMatches: stats.totalMatches,
                wins: stats.totalWins,
                losses: stats.totalLosses,
                winRate: stats.totalMatches > 0 ? ((stats.totalWins / stats.totalMatches) * 100).toFixed(2): 0,
                kdRatio: stats.totalDeaths > 0 ? (stats.totalKills / stats.totalDeaths).toFixed(2) : stats.totalKills,
                assistsPerMach: stats.totalMatches > 0 ? (stats.totalAssists / stats.totalMatches).toFixed(2) : 0
            },
            topCharacters: stats.topCharacters
        });

    } catch (error) {
        console.error('Get player rank error:', error);
        res.status(500).json({
            error: 'Error fetching player rank',
            details: error.message
        });
    }
};

// @route   GET /api/leaderboard/:gameMode/characters
// @desc    Get top characters for a specific game mode
// @access  Public
const getCharacterLeaderboard = async (req, res) => {
    try {
        const { gameMode } = req.params;

        // Validate game mode
        const validModes = ['1v1_ranked', '2v2_ranked', '3v3_ranked'];
        if (!validModes.includes(gameMode)) {
            return res.status(400).json({
                error: 'Invalid game mode',
                validModes
            });
        }

        // Aggregate stats by character
        const characterStats = await PlayerStats.aggregate([
            { $match: { gameMode } },
            {
                $group: {
                    _id: '$character',
                    totalPicks: { $sum: '$stats.totalMatches' },
                    totalWins: { $sum: '$stats.wins' },
                    totalLosses: { $sum: '$stats.losses' },
                    totalAssists: { $sum: '$stats.assists' }
                }
            },
            {
                $addFields: {
                    winRate: {
                        $cond: [
                            { $gt: [{ $add: ['$totalWins', '$totalLosses'] }, 0] },
                            {
                                $multiply: [
                                    { $divide: ['$totalWins', { $add: ['$totalWins', '$totalLosses'] }] },
                                    100
                                ]
                            },
                            0
                        ]
                    }
                }
            },
            { $sort: {winRate: -1 } }
        ]);

        // Populate character details
        await Character.populate(characterStats, {
            path: '_id',
            select: 'name image difficulty'
        });

        // Calculate total picks across all characters for pick rate
        const totalPicks = characterStats.reduce((sum, char) => sum + char.totalPicks, 0);

        res.json({
            gameMode,
            characters: characterStats.map((stat, index) => ({
                rank: index + 1,
                character: stat._id,
                stats: {
                    totalPicks: stat.totalPicks,
                    wins: stat.totalWins,
                    losses: stat.totalLosses,
                    winRate: Number(stat.winRate.toFixed(2)),
                    pickRate: totalPicks > 0 ? Number(((stat.totalPicks / totalPicks) * 100).toFixed(2)) : 0
                }
            }))
        });

    } catch (error) {
        console.error('Get character leaderboard error:', error);
        res.status(500).json({
            error: 'Error fetching character leaderboard',
            details: error.message
        });
    }
};

// @route   GET /api/leaderboard/characters/top
// @desc    Get overall top characters across all ranked modes
// @access  Public
const getTopCharacters = async (req, res) => {
  try {
    const { limit = 10, gameMode } = req.query;

    let matchFilter = {};
    if (gameMode) {
      matchFilter.gameMode = gameMode;
    } else {
      // Only ranked modes
      matchFilter.gameMode = { $in: ['1v1_ranked', '2v2_ranked', '3v3_ranked'] };
    }

    // Aggregate across all ranked modes
    const characterStats = await PlayerStats.aggregate([
      { $match: matchFilter },
      {
        $group: {
          _id: '$character',
          totalPicks: { $sum: '$stats.totalMatches' },
          totalWins: { $sum: '$stats.wins' },
          totalLosses: { $sum: '$stats.losses' }
        }
      },
      {
        $addFields: {
          overallWinRate: {
            $cond: [
              { $gt: [{ $add: ['$totalWins', '$totalLosses'] }, 0] },
              {
                $multiply: [
                  { $divide: ['$totalWins', { $add: ['$totalWins', '$totalLosses'] }] },
                  100
                ]
              },
              0
            ]
          }
        }
      },
      { $sort: { overallWinRate: -1 } },
      { $limit: parseInt(limit) }
    ]);

    // Populate character details
    await Character.populate(characterStats, {
      path: '_id',
      select: 'name image difficulty'
    });

    // Get stats by mode for each character
    for (let stat of characterStats) {
      const statsByMode = await PlayerStats.aggregate([
        {
          $match: {
            character: stat._id._id,
            gameMode: { $in: ['1v1_ranked', '2v2_ranked', '3v3_ranked'] }
          }
        },
        {
          $group: {
            _id: '$gameMode',
            picks: { $sum: '$stats.totalMatches' },
            wins: { $sum: '$stats.wins' },
            losses: { $sum: '$stats.losses' }
          }
        },
        {
          $addFields: {
            winRate: {
              $cond: [
                { $gt: [{ $add: ['$wins', '$losses'] }, 0] },
                {
                  $multiply: [
                    { $divide: ['$wins', { $add: ['$wins', '$losses'] }] },
                    100
                  ]
                },
                0
              ]
            }
          }
        }
      ]);

      stat.statsByMode = {};
      statsByMode.forEach(modeStat => {
        stat.statsByMode[modeStat._id] = {
          picks: modeStat.picks,
          winRate: Number(modeStat.winRate.toFixed(2))
        };
      });
    }

    res.json({
      topCharacters: characterStats.map((stat, index) => ({
        rank: index + 1,
        character: stat._id,
        overallStats: {
          totalPicks: stat.totalPicks,
          totalWins: stat.totalWins,
          totalLosses: stat.totalLosses,
          overallWinRate: Number(stat.overallWinRate.toFixed(2))
        },
        statsByMode: stat.statsByMode
      }))
    });

  } catch (error) {
    console.error('Get top characters error:', error);
    res.status(500).json({
      error: 'Error fetching top characters',
      details: error.message
    });
  }
};

// @route   GET /api/leaderboard/balance/characters
// @desc    Get DETAILED character balance data (Admin Only)
// @access  Private/Admin
const getCharacterBalanceData = async (req, res) => {
    try {
        const { gameMode = '1v1_ranked' } = req.query;

        // Get character performance data
        const characters = await Character.find({ isAvailable: true });

        const balanceData = [];

        for (const character of characters) {
            // Get stats for this character in this mode
            const stats = await PlayerStats.aggregate([
                {
                    $match: {
                        character: character._id,
                        gameMode
                    }
                },
                {
                    $group: {
                        _id: null,
                        totalPicks: { $sum: '$stats.totalMatches' },
                        totalWins: { $sum: '$stats.wins' },
                        totalLosses: { $sum: '$stats.losses' }
                    }
                }
            ]);

            if (stats.length === 0) continue;

            const stat = stats[0];
            const totalMatches = stat.totalWins + stat.totalLosses;
            const winRate = totalMatches > 0 ? ((stat.totalWins / totalMatches) * 100).toFixed(2) : 0;

            // Calculate total picks across all character for pick rate
            const totalPicksAllChars = await PlayerStats.aggregate([
                { $match: { gameMode } },
                { $group: { _id: null, total: { $sum: '$stats.totalMatches' } } }
            ]);

            const pickRate = totalPicksAllChars[0]?.total > 0
                ? ((stat.totalPicks / totalPicksAllChars[0].total) * 100).toFixed(2)
                : 0;

            // Determine flags
            const flags = [];
            let recommendation = '';

            if (winRate > 55) {
                flags.push('HIGH_WIN_RATE');
                recommendation = `Win rate ${winRate.toFixed(1)}% is above 55% baseline - consider nerfs`;
            } else if (winRate < 45) {
                flags.push('LOW_WIN_RATE');
                recommendation = `Win rate ${winRate.toFixed(1)}% is below 45% baseline - consider buffs`;
            }

            if (pickrate < 5) {
                flags.push('LOW_PICK_RATE');
                recommendation += recommendation ? ' | ' : '';
                recommendation += `Pick rate ${pickRate.toFixed(1)}% is very low - may be underperforming`;
            } else if (pickRate > 25) {
                flags.push('HIGH_PICK_RATE');
                recommendation += recommendation ? ' | ' : '';
                recommendation += `Pick rate ${pickRate.toFixed(1)}% is very high - possibly overtuned`
            }

            balanceData.push({
                name: character.name,
                winRate: Number(winRate.toFixed(2)),
                pickRate: Number(pickRate.toFixed(2)),
                totalPicks: stat.totalPicks,
                flagged: flags.length > 0,
                flags,
                recommendation: recommendation || 'Stats within acceptable ranges'
            });
        }

        // Sort by win rate descending
        balanceData.sort((a, b) => b.winRate - a.winRate);

        res.json({
            balanceReport: {
                generatedAt: new Date(),
                gameMode,
                characters: balanceData,
                alerts: balanceData
                    .filter(char => char.flagged)
                    .map(char => ({
                        severity: char.flags.includes('HIGH_WIN_RATE') || char.flags.includes('LOW_WIN_RATE') ? 'HIGH' : 'MEDIUM',
                        character: char.name,
                        issues: char.flags,
                        recommendation: char.recommendation
                    }))
            }
        });

    } catch (error) {
        console.error('Get character balance data error:', error);
        res.status(500).json({
            error: 'Error fetching character balance data',
            details: error.message
        });
    }
};

// @route   GET /api/leaderboard/balance/talents
// @desc    Get talent usage and performance data (Admin Only)
// @access  Private/Admin
const getTalentBalanceData = async (req, res) => {
    try {
        const { gameMode = '1v1_ranked' } = req.query;

        let filter = { gameMode };
        if (character) {
            filter.character = character;
        }

        // Get all talent data
        const talentData = await TalentStats.find(filter)
            .populate('character', 'name')
            .sort({ 'stats.totalUses': -1 });
            
        // Group by character
        const byCharacter = {};

        talentData.forEach(talent => {
            const charName = talent.character.name;

            if (!byCharacter[charName]) {
                byCharacter[charName] = {
                    character: charName,
                    greaterTalents: [],
                    lesserTalents: []
                };
            }

            const talentInfo = {
                name: talent.talentName,
                uses: talent.stats.totalUses,
                wins: talent.stats.wins,
                losses: talent.stats.losses,
                winRate: talent.winRate,
                avgKills: talent.avgKills,
                avgDeaths: talent.avgDeaths,
                avgAssists: talent.avgAssists,
                avgDamageDealt: talent.avgDamageDealt,
                avgDamageTaken: talent.avgDamageTaken,
                pickRate: 0 // will calculate below
            };

            if (talent.talentType === 'greater') {
                byCharacter[charName].greaterTalents.push(talentInfo);
            } else {
                byCharacter[charName].lesserTalents.push(talentInfo);
            }
        });

        // Calculate pick rates and flag dominant talents
        for (const char of Object.values(byCharacter)) {
            // Greater talents pick rate
            const totalGreaterUses = char.greaterTalents.reduce((sum, t) => sum + t.uses, 0);
            char.greaterTalents.forEach(t => {
                t.pickRate = totalGreaterUses > 0
                    ? Number(((t.uses / totalGreaterUses) * 100).toFixed(2))
                    : 0;

                // Flag if picked > 60% of the time
                if (t.pickRate > 60) {
                    t.flagged = true;
                    t.flag = 'DOMINANT_TALENT';
                    t.recommendation = `${t.name} has ${t.pickRate}% pick rate - consider nerfs or buff alternatives`;
                }

                // Flag high win rate
                if (t.winRate > 60 && t.uses > 20) {
                    t.flagged = true;
                    t.flag = 'OVERPERFORMING';
                    t.recommendation = `${t.name} has ${t.winRate}% win rate - likely too strong`;
                }
            });

            // Lesser talents pick rate
            // Note: Players can have up to 3 lesser talents, so total uses will be ~ 3x matches
            const totalLesserUses = char.lesserTalents.reduce((sum, t) => sum + t.uses, 0);
            char.lesserTalents.forEach(t => {
                t.pickRate = totalLesserUses > 0
                    ? Number(((t.uses / totalLesserUses) * 100).toFixed(2))
                    : 0;

                // Flag if picked > 50% of the time (lower threshold for lesser talents)
                if (t.pickRate > 50) {
                    t.flagged = true;
                    t.flag = 'DOMINANT_TALENT';
                    t.recommendation = `${t.name} has ${t.pickRate}% pick rate - consider nerfs or buff alternatives`;
                }

                // Flag high win rate
                if (t.winRate > 60 && t.uses > 20) {
                    t.flagged = true;
                    t.flag = 'OVERPERFORMING';
                    t.recommendation = `${t.name} has ${t.winRate}% win rate - likely too strong`;
                }
            });

            // Sort by pick rate (most popular first)
            char.greaterTalents.sort((a, b) => b.pickRate - a.pickRate);
            char.lesserTalents.sort((a, b) => b.pickRate - a.pickRate);
        }

        res.json({
            talentReport: {
                generatedAt: new Date(),
                gameMode,
                byCharacter: Object.values(byCharacter)
            }
        });

    } catch (error) {
        console.error('Get talent balance data error');
        res.status(500).json({
            error: 'Error fetching talent usage data',
            details: error.message
        });
    }
};

// @route   GET /api/leaderboard/balance/builds
// @desc    Get build combination data (Admin Only)
// @access  Private/Admin
const getBuildBalanceData = async (req, res) => {
    try {
        const { gameMode = '1v1_ranked' } = req.query;

        let filter = { gameMode };
        if (character) {
            filter.character = character;
        }

        // Get top builds
        const buildData = await BuildStats.find(filter)
            .populate('character', 'name')
            .sort({ 'stats.totalUses': -1 })
            .limit(parseInt(limit));

        // Group by ccharacter
        const byCharacter = {};

        buildData.forEach(build => {
            const charName = build.character.name;

            if (!byCharacter[charName]) {
                byCharacter[charName] = {
                    character: charName,
                    totalMatches: 0,
                    topBuild: []
                };
            }

            byCharacter[charName].totalMatches += build.stats.totalUses;
            byCharacter[charName].topBuilds.push({
                build: build.build,
                uses: build.stats.totalUses,
                wins: build.stats.wins,
                losses: build.stats.losses,
                winRate: build.winRate,
                avgKills: build.stats.avgKills,
                avgDeaths: build.stats.avgDeaths,
                avgAssists: build.stats.avgAssists,
                avgDamageDealt: build.stats.avgDamageDealt,
                avgDamageTaken: build.stats.avgDamageTaken,
                pickRate: 0 // will calculate below
            });
        });

        // Calculate pick rates and diversity metrics
        for (const char of Object.values(byCharacter)) {
            // Calculate pick rates
            char.topBuilds.forEach(build => {
                build.pickRate = Number(((build.uses / char.totalMatches) * 100).toFixed(2));

                // Flag dominant builds (>40% pick rate)
                if (build.pickRate > 40) {
                    build.flaggged = true;
                    build.flag = 'DOMINANT_BUILD';
                    build.recommendation = `This build has ${build.pickRate}% pick rate - meta is stale`;
                }

                // Flag overperforming builds (>60% win rate with significant sample)
                if (build.winRate > 60 && build.uses > 20) {
                    build.flagged = true;
                    build.flag = 'OVERPERFORMING';
                    build.recommendation = `${build.winRate.toFixed(1)}% win rate - likely too strong`;
                }
            });

            // Calculate build diversity (Shannon entropy)
            const pickRates = char.topBuilds.map(b => b.uses / char.totalMatches);
            const diversity = -pickRates.reduce((sum, p) => {
                return p > 0 ? sum + (p * Math.log2(p)) : sum;
            }, 0);

            char.buildDiversity = Number(diversity.toFixed(2));

            // Flag low diversity
            if (diversity < 1.5 && char.topBuilds.length > 3) {
                char.diversityFlag = 'LOW_DIVERSITY';
                char.diversityRecommendation = `Build diversity score ${diversity.toFixed(2)} is low - consider buffs to underused talents`;
            }
        }

        res.json({
            buildReport: {
                generatedAt: new Date(),
                gameMode,
                byCharacter: Object.values(byCharacter)
            }
        });

    } catch (error) {
        console.error('Get build balance data error:', error);
        res.status(500).json({
            error: 'Error fetching build balance data',
            details: error.message
        });
    }
};

module.exports = {
    getLeaderboard,
    getPlayerRank,
    getCharacterLeaderboard,
    getTopCharacters,
    getCharacterBalanceData,
    getTalentBalanceData,
    getBuildBalanceData
}