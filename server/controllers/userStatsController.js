const PlayerStats = require('../models/PlayerStats');
const Match = require('../models/Match');
const Character = require('../models/Character');

// @route   GET /api/user/stats
// @desc    Get current user's overall stats
// @access  Private
const getUserStats = async (req, res) => {
    try {
        const userId = req.user._id;

        // Get all stats for this user across all game modes and characters
        const allStats = await PlayerStats.find({ user: userId })
            .populate('character', 'name image')
            .lean();

        if (allStats.length === 0) {
            return res.json({
                totalMatches: 0,
                totalWins: 0,
                totalLosses: 0,
                winRate: 0,
                highestMMR: 1000,
                topCharacters: [],
                statsByMode: {}
            });
        }

        // Calculate overall stats
        let totalMatches = 0;
        let totalWins = 0;
        let totalLosses = 0;
        let totalKills = 0;
        let totalDeaths = 0;
        let totalAssists = 0;
        let totalDamageDealt = 0;
        let totalDamageTaken = 0;
        let highestAccountMMR = 0;
        let currentAccountMMR = 0;
        let longestWinStreak = 0;
        let currentWinStreak = 0;

        // Stats by game mode
        const statsByMode = {
            '1v1_ranked': { matches: 0, wins: 0, losses: 0, mmr: 1000 },
            '2v2_ranked': { matches: 0, wins: 0, losses: 0, mmr: 1000 },
            '3v3_ranked': { matches: 0, wins: 0, losses: 0, mmr: 1000 }
        };

        // Character data
        const characterMap = new Map();

        allStats.forEach(stat => {
            // Overall totals
            totalMatches += stat.stats.totalMatches;
            totalWins += stat.stats.wins;
            totalLosses += stat.stats.losses;
            totalKills += stat.stats.totalKills;
            totalDeaths += stat.stats.totalDeaths;
            totalAssists += stat.stats.totalAssists;
            totalDamageDealt += stat.stats.totalDamageDealt;
            totalDamageTaken += stat.stats.totalDamageTaken;
            currentAccountMMR = stat.accountMMR;
            longestWinStreak = stat.stats.longestWinStreak;
            currentWinStreak = stat.stats.currentWinStreak;

            // Highest MMR (check if it's higher than starting point 1000)
            if (stat.peakAccountMMR > highestMMR) {
                highestMMR = stat.peakAccountMMR;
            }

            // By game mode
            if (statsByMode[stat.gameMode]) {
                statsByMode[stat.gameMode].matches += stat.stats.totalMatches;
                statsByMode[stat.gameMode].wins += stat.stats.wins;
                statsByMode[stat.gameMode].losses += stat.stats.losses;
                if (stat.accountMMR > statsByMode[stat.gameMode].mmr) {
                    statsByMode[stat.gameMode].mmr = stat.accountMMR;
                }
            }

            // By Character (aggregate across all modes)
            const charId = stat.character._id.toString();
            if (!characterMap.has(charId)) {
                characterMap.set(charId, {
                    _id: stat.character._id,
                    name: stat.character.name,
                    image: stat.character.image,
                    matches: 0,
                    wins: 0,
                    losses: 0,
                    kills: 0,
                    deaths: 0,
                    assists: 0,
                    damageDealt: 0,
                    damageTaken: 0,
                    highestMMR: 0
                });
            }

            const charData = characterMap.get(charId);
            charData.matches += stat.stats.totalMatches;
            charData.wins += stat.stats.wins;
            charData.losses += stat.stats.losses;
            charData.kills += stat.stats.totalKills;
            charData.deaths += stat.stats.totalDeaths;
            charData.assists += stat.stats.totalAssists;
            charData.damageDealt += stat.stats.totalDamageDealt;
            charData.damageTaken += stat.stats.totalDamageTaken;
            if (stat.characterMMR > charData.highestMMR) {
                charData.highestMMR = stat.characterMMR;
            }
        });

        // Get top 3 characters by matches played
        const topCharacters = Array.from(characterMap.values())
            .sort((a, b) => b.matches - a.matches)
            .slice(0, 3)
            .map(char => ({
                ...char,
                winRate: char.matches > 0? ((char.wins / char.matches) * 100).toFixed(1) : 0,
                kda: char.deaths > 0 ? (char.kills / char.deaths).toFixed(2) : totalKills
            }));
        
        res.json({
            totalMatches,
            totalWins,
            totalLosses,
            winRate: totalMatches > 0 ? ((totalWins / totalMatches) * 100).toFixed(1) : 0,
            totalKills,
            totalDeaths,
            totalAssists,
            kda: totalDeaths > 0 ? (totalKills / totalDeaths).toFixed(2) : totalKills,
            highestMMR: Math.round(highestMMR),
            statsByMode,
            topCharacters,
            totalDamageDealt,
            totalDamageTaken,
            currentAccountMMR,
            longestWinStreak,
            currentWinStreak
        });

    } catch (error) {
        console.error('Get user stats error:', error);
        res.status(500).json({
            error: 'Error fetching user stats',
            details: error.message
        });
    }
};

// @route   GET /api/user/recent-matches
// @desc    Get current user's recent matches
// @access  Private
const getRecentMatches = async (req, res) => {
    try {
        const userId = req.user._id;
        const { limit = 10 } = req.query;

        // Find matches where user participated
        const matches = await Match.find({
            'players.user': userId
        })
            .sort({ endedAt: -1 })
            .limit(parseInt(limit))
            .populate('players.user', 'username avatar')
            .populate('players.character', 'name image')
            .lean();

        // Format matches
        const formattedMatches = matches.map(match => {
            // Find this user's data in the match
            const userPlayer = match.players.find(
                p => p.user._id.toString() === userId.toString()
            );

            return {
                _id: match._id,
                gameMode: match.gameMode,
                result: userPlayer.result,
                character: {
                    _id: userPlayer.character._id,
                    name: userPlayer.character.name,
                    image: userPlayer.character.image,
                },
                stats: userPlayer.stats,
                winningTeam: match.winningTeam,
                duration: match.duration,
                endedAt: match.endedAt,
                team: userPlayer.team
            };
        });

        res.json({
            matches: formattedMatches
        });

    } catch (error) {
        console.error('Get recent matches error:', error);
        res.status(500).json({
            error: 'Error fetching recent matches',
            details: error.message
        });
    }
};

module.exports = {
    getUserStats,
    getRecentMatches
};