const mongoose = require('mongoose');

const buildStatsSchema = new mongoose.Schema({
    // Which character
    character: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Character',
        required: true
    },
    gameMode: {
        type: String,
        enum: [
            '1v1_ranked',
            '1v1_casual',
            '2v2_ranked',
            '2v2_casual',
            '3v3_ranked',
            '3v3_casual',
        ],
        required: true
    },

    // The full build (combination of talents)
    build: {
        greaterTalent: {
            type: String,
            required: true
        },
        lesserTalents: [{
            type: String
        }]
    },

    // Performance stats for this exact build
    stats: {
        totalUses: {
            type: Number,
            default: 0
            // How many times this exact build was used
        },
        wins: {
            type: Number,
            default: 0
        },
        losses: {
            type: Number,
            default: 0
        },
        avgKills: {
            type: Number,
            default: 0
        },
        avgDeaths: {
            type: Number,
            default: 0
        },
        avgDamageDealt: {
            type: Number,
            default: 0
        },
        avgAssists: {
            type: Number,
            default: 0
        },
        avgDamageTaken: {
            type: Number,
            default: 0
        }
    }
}, {
    timestamps: true
});

// Index for fast queries
buildStatsSchema.index({ character: 1, gameMode: 1 });
buildStatsSchema.index({ 'stats.wins': -1 });

// Virtual: Win rate for this build
buildStatsSchema.virtual('winRate').get(function() {
    if (this.stats.totalUses === 0) return 0;
    return parseFloat(
        ((this.stats.win / this.stats.totalUses) *100).toFixed(2)
    );
});

// Virtual: Usage rate (calculated relative to total character picks)
buildStatsSchema.virtual('usageRate');

buildStatsSchema.set('toJSON', { virtuals: true });
buildStatsSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('BuildStats', buildStatsSchema);