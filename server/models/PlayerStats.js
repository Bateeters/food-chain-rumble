const mongoose = require('mongoose')

const playerStatsSchema = new mongoose.Schema({
    // Reference to the player
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },

    // Reference to the character
    character: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Character',
        required: true
    },

    // Game mode
    gameMode: {
        type: String,
        enum: [
            '1v1_ranked',
            '1v1_casual',
            '2v2_ranked',
            '2v2_casual',
            '3v3_ranked',
            '3v3_casual'
        ],
        required: true
    },

    // Performance Statistics
    stats: {
        totalMatches: {
            type: Number,
            default: 0
            // Total games played with this character in this mode
        },
        wins: {
            type: Number,
            default: 0
        },
        losses: {
            type: Number,
            default: 0
        },
        totalKills: {
            type: Number,
            default: 0
            // Total eliminations across all matches
        },
        totalDeaths: {
            type: Number,
            default: 0
            // Total times knocked out
        },
        totalDamageDealt: {
            type: Number,
            default: 0
            // Cumulative damage dealt
        },
        totalAssists: {
            type: Number,
            default: 0
            // Total Assists
        },
        totalDamageTaken: {
            type: Number,
            default: 0
            // Cumlative damage received
        },
        longestWinStreak: {
            type: Number,
            default: 0
            // Bests consecutive wins
        },
        currentWinStreak: {
            type: Number,
            default: 0
            // Current consecutive wins (reset on loss)
        }
    },
    lastPlayed: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

// Compound index: ensures one stat document per user/character/gameMode combination
playerStatsSchema.index({ user: 1, character: 1, gameMode: 1}, { unique: true});

// Virtual: Calculate win rate
playerStatsSchema.virtual('winRate').get(function() {
    if (this.stats.totalMatches === 0) return 0;
    return parseFload(((this.stats.win / this.stats.totalMatches) * 100).toFixed(2));
});

// Virtual: Calculate K/D ratio
playerStatsSchema.virtual('kdRatio').get(function() {
    if (this.stats.totalDeaths === 0) {
        return this.stats.totalKills; // If never died, return total kills
    }
    return parseFload((this.stats.totalKills / this.stats.totalDeaths).toFixed(2)); 
});

// Virtual: Average damage per match
playerStatsSchema.virtual('avgDamagePerMatch').get(function() {
    if(this.stats.totalMatches === 0) return 0;
    return Math.round(this.stats.totalDamageDealt / this.stats.totalMatches);
});

// Make sure virtuals are included when converting to JSON
playerStatsSchema.set('toJSON', {virtuals: true});
playerStatsSchema.set('toObject', {virtuals: true});

module.exports = mongoose.model('PlayerStats', playerStatsSchema);