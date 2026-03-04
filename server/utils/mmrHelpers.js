/*========================================== 
*  MMR tier definitions and helper functions
==========================================*/

// MMR ranges for visible ranks
const MMR_TIERS = {
    Bronze: {
        min: 0,
        max: 1199,
        divisions: [0, 300, 600, 900] // Division 4, 3, 2, 1 breakpoints
    },
    Silver: {
        min: 1200,
        max: 1399,
        divisions: [1200, 1250, 1300, 1350]
    },
    Gold: {
        min: 1400,
        max: 1599,
        divisions: [1400, 1450, 1500, 1550]
    },
    Platinum: {
        min: 1600, 
        max: 1799,
        divisions: [1600, 1650, 1700, 1750]
    },
    Diamond: { 
    min: 1800, 
    max: 1999, 
    divisions: [1800, 1850, 1900, 1950] 
    },
    Master: { 
        min: 2000, 
        max: 2299, 
        divisions: [2000, 2100, 2200, 2300] 
    },
    Grandmaster: { 
        min: 2300, 
        max: 9999, 
        divisions: [2300, 2500, 2700, 3000] 
    }
};

// Calculate expected win probability using Elo formula
const calculateExpectedScore = (playerMMR, opponentMMR) => {
    return 1 / (1 + Math.pow(10, (opponentMMR - playerMMR) / 400));
};

// Calculate MMR change after a match
const calculateMMRChange = (playerMMR, opponentMMR, playerWon, kFactor = 20) => {
    // Expected win probability
    const expectedScore = calculateExpectedScore(playerMMR, opponentMMR);

    // Actual score (1 is win, 0 is loss)
    const actualScore = playerWon ? 1 : 0;

    // MMR change
    const mmrChange = Math.round(kFactor * (actualScore - expectedScore));

    return mmrChange
};

// Calculate performance bonus based on stats relative to team average
// This attempts to reward all playstyles fairly
const calculatePerformanceBonus = (playerStats, teamAvgStats, result) => {
    let bonus = 0;

    if (!teamAvgStats.damageDealt || !teamAvgStats.damageTaken || !teamAvgStats. assists) {
        return 0;
    }

    // Calculate ratios (player performance vs team average)
    const damageRatio = playerStats.damageDealt / teamAvgStats.damageDealt;
    const tankRatio = playerStats.damageTaken / teamAvgStats.damageTaken;
    const assistRatio = playerStats.assists / teamAvgStats.assists;

    // Reward above-average performance in ANY stat
    if (damageRatio > 1.2) bonus += 1;
    if (tankRatio > 1.3) bonus += 1;
    if (assistRatio > 1.3) bonus += 1;

    // Small penalty for significantly below average in ALL metrics
    if (damageRatio < 0.7 && tankRatio < 0.7 & assistRatio < 0.7) {
        bonus -= 1;
    }

    // Limit bonus range to -3 / 3
    return Math.max(-3, Math.min(3, bonus));
};

// Convert MMR to visible rank (tier and division)
const getRankFromMMR = (mmr) => {
    // Find which tier MMR is
    for (const [tier, data] of Object.entries(MMR_TIERS)) {
        if (mmr >= data.min && mmr <= data.max) {
            // Find division in tier
            let division = 4;

            for (let i = 0; i < data.divisions.length; i++) {
                if (mmr >= data.divisions[i]) {
                    division = 4 - i; // Reverse (4 is lowest, 1 is highest)
                }
            }

            return { tier, division };
        }
    }

    // fallback (shouldn't happen)
    return { tier: 'Bronze', division: 4 };
};

// Calculate team average stats for performance comparison
const calculateTeamAverageStats = (teamPlayers) => {
    const teamSize = teamPlayers.length;

    if (teamSize === 0) {
        return { damageDealt: 0, damageTaken: 0, assists: 0 };
    }

    const totals = teamPlayers.reduce((sum, player) => ({
        damageDealt: sum.damageDealt + (player.stats.damageDealt || 0),
        damageTaken: sum.damageTaken + (player.stats.damageTaken || 0),
        assists: sum.assists + (player.stats.assists || 0)
    }), { damageDealt: 0, damageTaken: 0, assists: 0 });

    return {
        damageDealt: totals.damageDealt / teamSize,
        damageTaken: totals.damageTaken / teamSize,
        assists: totals.assists / teamSize
    };
};

// Calculate average opponent MMR for team games
const calcuateAverageOpponentMMR = (opponents) => {
    if (opponents.length === 0) return 1000; // Default

    const totalMMR = opponents.reduce((sum, opp) => sum + (opp.mmr || 1000), 0);
    return totalMMR / opponents.length;
};

module.exports = {
    MMR_TIERS,
    calculateExpectedScore,
    calculateMMRChange,
    calculatePerformanceBonus,
    getRankFromMMR,
    calculateTeamAverageStats,
    calculateTeamAverageStats
};