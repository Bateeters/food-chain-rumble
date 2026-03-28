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
        totalKills: {
            type: Number,
            default: 0
        },
        totalDeaths: {
            type: Number,
            default: 0
        },
        totalDamageDealt: {
            type: Number,
            default: 0
        },
        totalAssists: {
            type: Number,
            default: 0
        },
        totalDamageTaken: {
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
    const totalMatches = this.stats.wins + this.stats.losses;
    if (totalMatches === 0) return 0;
    return parseFloat(
        ((this.stats.wins / totalMatches) *100).toFixed(2)
    );
});

// Virtual: Calculate actual averages (running average)
buildStatsSchema.virtual('avgKills').get(function() {
    return this.stats.totalUses > 0
        ? parseFloat((this.stats.totalKills / this.stats.totalUses).toFixed(2))
        : 0;
});
buildStatsSchema.virtual('avgDeaths').get(function() {
    return this.stats.totalUses > 0
        ? parseFloat((this.stats.totalDeaths / this.stats.totalUses).toFixed(2))
        : 0;
});
buildStatsSchema.virtual('avgAssists').get(function() {
    return this.stats.totalUses > 0
        ? parseFloat((this.stats.totalAssists / this.stats.totalUses).toFixed(2))
        : 0;
});
buildStatsSchema.virtual('avgDamageDealt').get(function() {
    return this.stats.totalUses > 0
        ? parseFloat((this.stats.totalDamageDealt / this.stats.totalUses).toFixed(2))
        : 0;
});
buildStatsSchema.virtual('avgDamageTaken').get(function() {
    return this.stats.totalUses > 0
        ? parseFloat((this.stats.totalDamageTaken / this.stats.totalUses).toFixed(2))
        : 0;
});

// Virtual: Usage rate (calculated relative to total character picks for same character+gameMode).
// Caller must inject _totalCharacterUses onto the document before serializing,
// e.g.: build._totalCharacterUses = totalUsesForThatCharacter
buildStatsSchema.virtual('usageRate').get(function() {
    if (!this._totalCharacterUses || this._totalCharacterUses === 0) return 0;
    return parseFloat(
        ((this.stats.totalUses / this._totalCharacterUses) * 100).toFixed(2)
    );
});

// Normalize lesserTalents order so ["A","B"] and ["B","A"] resolve to the same build document
buildStatsSchema.pre('save', function(next) {
    if (this.build?.lesserTalents?.length > 1) {
        this.build.lesserTalents.sort();
    }
    next();
});

buildStatsSchema.set('toJSON', { virtuals: true });
buildStatsSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('BuildStats', buildStatsSchema);